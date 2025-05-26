'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { PencilIcon, PlusIcon, TrashIcon, StopIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDeported, updateDeportedPerson, createDeportedPerson, deleteDeportedPerson, getDeportedPersonByLaufendenr, hasHistoricalVersions, fetchFieldSuggestions } from '@/app/deport/data';
import { useToast } from '@/components/ui/Toasts/use-toast';
import { createClient } from '@/utils/supabase/client';

// Import the ITEMS_PER_PAGE constant if it's exported, otherwise define it here
const ITEMS_PER_PAGE = 22; // Make sure this matches the value in data.ts

// Autocomplete Input Component
interface AutocompleteInputProps {
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: string[];
  showSuggestions: boolean;
  activeSuggestion: number;
  onSelectSuggestion: (suggestion: string) => void;
  className?: string;
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, Omit<AutocompleteInputProps, 'ref'>>((
  {
    name,
    value,
    onChange,
    onKeyDown,
    suggestions,
    showSuggestions,
    activeSuggestion,
    onSelectSuggestion,
    className = '',
    placeholder = '',
  }, 
  ref
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        // Close suggestions when clicking outside
        if (showSuggestions) {
          onSelectSuggestion(''); // This will trigger the dropdown to close
        }
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, onSelectSuggestion]);
  
  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`${className} relative z-10`}
        placeholder={placeholder}
        ref={ref}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                index === activeSuggestion ? 'bg-blue-100' : ''
              }`}
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
interface Person {
  id: string;
  Seite: number | null;
  Familiennr: number | null;
  Eintragsnr: number | null;
  Laufendenr: number | null;
  Familienname: string | null;
  Vorname: string | null;
  Vatersname: string | null;
  Familienrolle: string | null;
  Geschlecht: string | null;
  Geburtsjahr: string | null;
  Geburtsort: string | null;
  Arbeitsort: string | null;
  // Historization fields
  valid_from: string | null;
  valid_to: string | null;
  updated_by: string | null;
}

interface TableClientProps {
  people: Person[];
  currentPage?: number;
  query?: string;
}

export default function TableClient({ people: initialPeople, currentPage = 1, query = '' }: TableClientProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [formData, setFormData] = useState<{
    id?: string;
    Seite?: string;
    Familiennr?: string;
    Eintragsnr?: string;
    Laufendenr?: string;
    Familienname?: string;
    Vorname?: string;
    Vatersname?: string;
    Familienrolle?: string;
    Geschlecht?: string;
    Geburtsjahr?: string;
    Geburtsort?: string;
    Arbeitsort?: string;
  }>({});
  const [originalData, setOriginalData] = useState<any>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClient();

  // State to track which rows have their history expanded
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // State to store historical records for each person
  const [historyRecords, setHistoryRecords] = useState<Record<number, Person[]>>({});
  // State to track which records have historical versions
  const [recordsWithHistory, setRecordsWithHistory] = useState<Record<number, boolean>>({});
  // State for autocomplete suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [currentField, setCurrentField] = useState('');
  // State for dropdown menu visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  
  const [isAdmin, setIsAdmin] = useState(false);

  // Keyboard navigation for dropdown button
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDropdownOpen(prev => !prev);
      // Focus on the first item when opening with keyboard
      if (!isDropdownOpen) {
        setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Keyboard navigation for dropdown menu items
  const handleMenuItemKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % menuItemsRef.current.length;
      menuItemsRef.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + menuItemsRef.current.length) % menuItemsRef.current.length;
      menuItemsRef.current[prevIndex]?.focus();
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      dropdownRef.current?.querySelector('button')?.focus(); // Focus back on the toggle button
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLButtonElement).click(); // Simulate click on the focused item
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to fetch data
  const fetchData = async () => {
    try {
      const fetchedPeople = await fetchDeported(query, currentPage);
      setPeople(fetchedPeople);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Fehler beim Laden der Daten',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setIsAdmin(false); // Assume not admin on error
        } else if (data && data.length > 0 && data[0] && 'role' in data[0]) {
          setIsAdmin((data[0] as any).role === 'admin');
        } else {
          setIsAdmin(false); // User not found in profiles table or data is empty or role property is missing
        }
      } else {
        setIsAdmin(false); // Not logged in
      }
    };

    fetchUserRole();
  }, [user]);

  // Fetch data when query or currentPage changes
  useEffect(() => {
    fetchData();
  }, [query, currentPage]);

  // Update local people state when initialPeople changes
  useEffect(() => {
    setPeople(initialPeople);
    
    // Check which records have historical versions
    const checkHistoricalRecords = async () => {
      const historyStatus: Record<number, boolean> = {};
      
      // Process in batches to avoid too many parallel requests
      for (let i = 0; i < initialPeople.length; i++) {
        const person = initialPeople[i];
        if (person.Laufendenr) {
          try {
            const hasHistory = await hasHistoricalVersions(person.Laufendenr);
            historyStatus[person.Laufendenr] = hasHistory;
          } catch (error) {
            console.error(`Error checking history for Laufendenr ${person.Laufendenr}:`, error);
            historyStatus[person.Laufendenr] = false;
          }
        }
      }
      
      setRecordsWithHistory(historyStatus);
    };
    
    checkHistoricalRecords();
  }, [initialPeople]);

  // Focus on first input when adding a new row
  useEffect(() => {
    if (editIdx === 0 && isAddingNewRow && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [editIdx, isAddingNewRow]);

  const handleEdit = (idx: number, person: any) => {
    setEditIdx(idx);
    // Include id in the form data
    setFormData({
      ...person,
      id: person.id
    });
    setOriginalData(person);
  };

  // Debounced function to fetch suggestions
  const fetchSuggestions = useCallback(async (fieldName: string, value: string) => {
    if (value.length >= 2) {
      try {
        const fieldSuggestions = await fetchFieldSuggestions(fieldName, value);
        setSuggestions(fieldSuggestions);
        setShowSuggestions(fieldSuggestions.length > 0);
        setActiveSuggestion(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Only fetch suggestions for text fields that support autocomplete
    const autocompleteFields = ['Familienname', 'Vorname', 'Vatersname', 'Familienrolle', 'Geburtsort', 'Arbeitsort'];
    if (autocompleteFields.includes(name)) {
      setCurrentField(name);
      fetchSuggestions(name, value);
    } else {
      // Clear suggestions for non-autocomplete fields
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    if (currentField) {
      setFormData({
        ...formData,
        [currentField]: suggestion,
      });
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };
  
  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only process if suggestions are showing
    if (!showSuggestions) return;
    
    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Up arrow
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : 0);
    }
    // Enter key
    else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestion]);
    }
    // Escape key
    else if (e.key === 'Escape') {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleSave = async () => {
    if (isAddingNewRow) {
      // Create new person in the database
      try {
        await createDeportedPerson({
          Seite: formData.Seite,
          Familiennr: formData.Familiennr,
          Eintragsnr: formData.Eintragsnr,
          Laufendenr: formData.Laufendenr,
          Familienname: formData.Familienname,
          Vorname: formData.Vorname,
          Vatersname: formData.Vatersname,
          Familienrolle: formData.Familienrolle,
          Geschlecht: formData.Geschlecht,
          Geburtsjahr: formData.Geburtsjahr,
          Geburtsort: formData.Geburtsort,
          Arbeitsort: formData.Arbeitsort
        }, user?.email || 'unknown');
        setIsAddingNewRow(false);
      } catch (error) {
        console.error('Table: Failed to create new person:', error);
        toast({
          title: 'Fehler beim Erstellen',
          description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
          variant: 'destructive'
        });
        return; // Prevent clearing edit mode on error
      }
    } else if (formData.id) {
      // Update existing person
      try {
        await updateDeportedPerson(formData as {
          id: string;
          Seite?: string;
          Familiennr?: string;
          Eintragsnr?: string;
          Laufendenr?: string;
          Familienname?: string;
          Vorname?: string;
          Vatersname?: string;
          Familienrolle?: string;
          Geschlecht?: string;
          Geburtsjahr?: string;
          Geburtsort?: string;
          Arbeitsort?: string;
        }, user?.email || 'unknown');
      } catch (error) {
        console.error('Table: Failed to update person:', error);
        toast({
          title: 'Fehler beim Aktualisieren',
          description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
          variant: 'destructive'
        });
        return; // Prevent clearing edit mode on error
      }
    }
    setEditIdx(-1);
    // Clear autocomplete state
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setCurrentField('');
    fetchData();
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditIdx(-1);
    
    // Clear autocomplete state
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setCurrentField('');

    if (isAddingNewRow) {
      setIsAddingNewRow(false);
      fetchData(); // Refresh data when canceling a new row addition
    }
  };

  const handleAddRow = () => {
    // Create a new empty person with default values and a temporary ID
    const newPerson = {
      id: 'temp-' + Date.now(), // Temporary ID to identify this row
      Seite: null,
      Familiennr: null,
      Eintragsnr: null,
      Laufendenr: null,
      Familienname: null,
      Vorname: null,
      Vatersname: null,
      Familienrolle: null,
      Geschlecht: "unbekannt",
      Geburtsjahr: null,
      Geburtsort: null,
      Arbeitsort: null,
      // Historization fields
      valid_from: null,
      valid_to: null,
      updated_by: null
    };

    // Add the new person to the top of the local state
    const updatedPeople = [newPerson, ...people];
    setPeople(updatedPeople);

    // Set the new row in edit mode (index 0 since it's at the top)
    setEditIdx(0);
    // Convert null values to empty strings for formData which expects string | undefined
    setFormData({
      id: newPerson.id,
      Seite: newPerson.Seite !== null ? String(newPerson.Seite) : '',
      Familiennr: newPerson.Familiennr !== null ? String(newPerson.Familiennr) : '',
      Eintragsnr: newPerson.Eintragsnr !== null ? String(newPerson.Eintragsnr) : '',
      Laufendenr: newPerson.Laufendenr !== null ? String(newPerson.Laufendenr) : '',
      Familienname: newPerson.Familienname || '',
      Vorname: newPerson.Vorname || '',
      Vatersname: newPerson.Vatersname || '',
      Familienrolle: newPerson.Familienrolle || '',
      Geschlecht: newPerson.Geschlecht || 'unbekannt',
      Geburtsjahr: newPerson.Geburtsjahr || '',
      Geburtsort: newPerson.Geburtsort || '',
      Arbeitsort: newPerson.Arbeitsort || ''
    });
    setOriginalData(newPerson);
    setIsAddingNewRow(true);
  };

  const handleAddFamilyGroup = () => {
    const newFamilyGroup: Person[] = [];
    const familyNr = Math.floor(Date.now() / 1000); // Simple auto-generation for Familiennr
    const tempFamilyId = 'family-' + Date.now(); // Temporary ID for the family group

    for (let i = 0; i < 5; i++) {
      const newPerson = {
        id: `temp-${tempFamilyId}-${i}`, // Temporary ID for each person in the group
        Seite: null, // Leave Seite empty for user to fill
        Familiennr: familyNr,
        Eintragsnr: i + 1,
        Laufendenr: null, // Let the database handle auto-generation
        Familienname: null,
        Vorname: null,
        Vatersname: null,
        Familienrolle: i === 0 ? 'Familienoberhaupt' : (i === 1 ? 'Ehefrau' : 'Kind'),
        Geschlecht: "unbekannt",
        Geburtsjahr: null,
        Geburtsort: null,
        Arbeitsort: null,
        valid_from: null,
        valid_to: null,
        updated_by: null
      };
      newFamilyGroup.push(newPerson);
    }

    // Add the new family group to the top of the local state
    const updatedPeople = [...newFamilyGroup, ...people];
    setPeople(updatedPeople);

    // Set the first new row in edit mode (index 0)
    setEditIdx(0);
    // Set formData for the first person in the group
    const firstPerson = newFamilyGroup[0];
    setFormData({
      id: firstPerson.id,
      Seite: firstPerson.Seite !== null ? String(firstPerson.Seite) : '',
      Familiennr: firstPerson.Familiennr !== null ? String(firstPerson.Familiennr) : '',
      Eintragsnr: firstPerson.Eintragsnr !== null ? String(firstPerson.Eintragsnr) : '',
      Laufendenr: firstPerson.Laufendenr !== null ? String(firstPerson.Laufendenr) : '',
      Familienname: firstPerson.Familienname || '',
      Vorname: firstPerson.Vorname || '',
      Vatersname: firstPerson.Vatersname || '',
      Familienrolle: firstPerson.Familienrolle || '',
      Geschlecht: firstPerson.Geschlecht || 'unbekannt',
      Geburtsjahr: firstPerson.Geburtsjahr || '',
      Geburtsort: firstPerson.Geburtsort || '',
      Arbeitsort: firstPerson.Arbeitsort || ''
    });
    setOriginalData(firstPerson);
    setIsAddingNewRow(true); // Indicate that we are adding new rows
  };

  const handleDelete = async (id: string) => {
    try {
      // Use the direct Supabase client function instead of the API endpoint
      // Pass the current user's email for the updated_by field
      await deleteDeportedPerson(id, user?.email || 'unknown');

      // Refresh the data after successful deletion
      fetchData();
      toast({
        title: 'Erfolgreich gelöscht',
        description: 'Der Eintrag wurde erfolgreich gelöscht.',
      });

    } catch (error) {
      console.error('Table: Failed to delete person:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    }
  };

  // Function to toggle the history view for a specific row
  const toggleHistoryView = async (laufendenr: number) => {
    // Toggle the expanded state for this row
    setExpandedRows(prev => ({
      ...prev,
      [laufendenr]: !prev[laufendenr]
    }));

    // If we're expanding and don't have the history data yet, fetch it
    if (!expandedRows[laufendenr] && !historyRecords[laufendenr]) {
      try {
        // Show loading toast
        toast({
          title: 'Lade Versionshistorie...',
          description: 'Die historischen Daten werden geladen.',
        });
        
        // Fetch historical records for this person
        const history = await getDeportedPersonByLaufendenr(laufendenr, true) as Person[];
        
        // Store the historical records in state
        setHistoryRecords(prev => ({
          ...prev,
          [laufendenr]: history
        }));
        
        // Update the recordsWithHistory state to ensure we know this record has history
        if (history.length > 1) {
          setRecordsWithHistory(prev => ({
            ...prev,
            [laufendenr]: true
          }));
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        toast({
          title: 'Fehler beim Laden der Historie',
          description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
          variant: 'destructive'
        });
        
        // Reset expanded state on error
        setExpandedRows(prev => ({
          ...prev,
          [laufendenr]: false
        }));
      }
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="block align-middle overflow-x-auto">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {user && (
            <div className="flex justify-end p-4">
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onKeyDown={handleDropdownKeyDown}
                    className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                    id="options-menu-button"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    Optionen
                    {isDropdownOpen ? (
                      <ChevronUpIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
                    ) : (
                      <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu-button"
                    tabIndex={-1}
                  >
                    <div className="py-1" role="none">
                      <button
                        onClick={() => { handleAddRow(); setIsDropdownOpen(false); }}
                        onKeyDown={(e) => handleMenuItemKeyDown(e, 0)}
                        className="text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-violet-500 hover:text-white"
                        role="menuitem"
                        tabIndex={0}
                        id="menu-item-0"
                        ref={el => { menuItemsRef.current[0] = el; }}
                      >
                        <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                        Neue Zeile hinzufügen
                      </button>
                      <button
                        onClick={() => { handleAddFamilyGroup(); setIsDropdownOpen(false); }}
                        onKeyDown={(e) => handleMenuItemKeyDown(e, 1)}
                        className="text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-violet-500 hover:text-white"
                        role="menuitem"
                        tabIndex={-1}
                        id="menu-item-1"
                        ref={el => { menuItemsRef.current[1] = el; }}
                      >
                        <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                        Neue Familiengruppe hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <table className="min-w-full text-gray-900 table ">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">Seite</th>
                <th scope="col" className="px-3 py-5 font-medium">Familiennr</th>
                <th scope="col" className="px-3 py-5 font-medium">Eintragsnr</th>
                <th scope="col" className="px-3 py-5 font-medium">Laufendenr</th>
                <th scope="col" className="px-3 py-5 font-medium">Familienname</th>
                <th scope="col" className="px-3 py-5 font-medium">Vorname</th>
                <th scope="col" className="px-3 py-5 font-medium">Vatername</th>
                <th scope="col" className="px-3 py-5 font-medium">Familienrolle</th>
                <th scope="col" className="px-3 py-5 font-medium">Geschlecht</th>
                <th scope="col" className="px-3 py-5 font-medium">Geburtsjahr</th>
                <th scope="col" className="px-3 py-5 font-medium">Geburtsort</th>
                <th scope="col" className="px-3 py-5 font-medium">Arbeitsort</th>
                {user && (
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {people?.map((person,idx) => (
                <React.Fragment key={person.id}>
                <tr
                className={`w-full border-b py-3 text-sm ${editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? 'bg-gray-200' : ''} ${expandedRows[person.Laufendenr || 0] ? 'border-b-0' : 'last-of-type:border-none'} [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg ${person.id.startsWith('temp-family-') ? 'border-l-4 border-blue-500' : ''}`}>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <input
                          type="text"
                          name="Seite"
                          value={formData.Seite}
                          onChange={handleChange}
                          className="w-20"
                          ref={idx === 0 ? firstInputRef : undefined}
                        />
                      ) : (
                        person.Seite
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <input
                          type="text"
                          name="Familiennr"
                          value={formData.Familiennr}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Familiennr
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                      <input
                        type="text"
                        name="Eintragsnr"
                        value={formData.Eintragsnr}
                        onChange={handleChange}
                        className="w-20"
                      />
                    ) : (
                      person.Eintragsnr
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/* Laufendenr field is read-only and cannot be edited */}
                    {person.Laufendenr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                      <AutocompleteInput
                        name="Familienname"
                        value={formData.Familienname}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        suggestions={currentField === 'Familienname' ? suggestions : []}
                        showSuggestions={showSuggestions && currentField === 'Familienname'}
                        activeSuggestion={activeSuggestion}
                        onSelectSuggestion={handleSelectSuggestion}
                        className="w-32"
                        placeholder="Familienname"
                      />
                    ) : (
                      person.Familienname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                      <AutocompleteInput
                        name="Vorname"
                        value={formData.Vorname}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        suggestions={currentField === 'Vorname' ? suggestions : []}
                        showSuggestions={showSuggestions && currentField === 'Vorname'}
                        activeSuggestion={activeSuggestion}
                        onSelectSuggestion={handleSelectSuggestion}
                        className="w-32"
                        placeholder="Vorname"
                      />
                    ) : (
                      person.Vorname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                      <AutocompleteInput
                        name="Vatersname"
                        value={formData.Vatersname}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        suggestions={currentField === 'Vatersname' ? suggestions : []}
                        showSuggestions={showSuggestions && currentField === 'Vatersname'}
                        activeSuggestion={activeSuggestion}
                        onSelectSuggestion={handleSelectSuggestion}
                        className="w-32"
                        placeholder="Vatersname"
                      />
                    ) : (
                      person.Vatersname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <AutocompleteInput
                          name="Familienrolle"
                          value={formData.Familienrolle}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          suggestions={currentField === 'Familienrolle' ? suggestions : []}
                          showSuggestions={showSuggestions && currentField === 'Familienrolle'}
                          activeSuggestion={activeSuggestion}
                          onSelectSuggestion={handleSelectSuggestion}
                          className="w-32"
                          placeholder="Familienrolle"
                        />
                      ) : (
                        person.Familienrolle
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <select
                          name="Geschlecht"
                          value={formData.Geschlecht || ''}
                          onChange={handleChange}
                          className="w-28"
                        >
                          <option value="männlich">männlich</option>
                          <option value="weiblich">weiblich</option>
                          <option value="unbekannt">unbekannt</option>
                        </select>
                      ) : (
                        person.Geschlecht
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <input
                          type="text"
                          name="Geburtsjahr"
                          value={formData.Geburtsjahr}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Geburtsjahr
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <AutocompleteInput
                          name="Geburtsort"
                          value={formData.Geburtsort}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          suggestions={currentField === 'Geburtsort' ? suggestions : []}
                          showSuggestions={showSuggestions && currentField === 'Geburtsort'}
                          activeSuggestion={activeSuggestion}
                          onSelectSuggestion={handleSelectSuggestion}
                          className="w-32"
                          placeholder="Geburtsort"
                        />
                      ) : (
                        person.Geburtsort
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <AutocompleteInput
                          name="Arbeitsort"
                          value={formData.Arbeitsort}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          suggestions={currentField === 'Arbeitsort' ? suggestions : []}
                          showSuggestions={showSuggestions && currentField === 'Arbeitsort'}
                          activeSuggestion={activeSuggestion}
                          onSelectSuggestion={handleSelectSuggestion}
                          className="w-32"
                          placeholder="Arbeitsort"
                        />
                      ) : (
                        person.Arbeitsort
                      )}
                  </td>
                  {user && (
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        {editIdx === idx || (isAddingNewRow && person.id.startsWith('temp-family-')) ? (
                        <>
                        <button
                          onClick={handleSave}
                          className="rounded-md border p-2 hover:bg-gray-100"
                        >
                          <CheckIcon className="w-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="rounded-md border p-2 hover:bg-gray-100"
                        >
                          <StopIcon className="w-5" />
                        </button>
                        </>
                      ) : (
                        <>
                        {person.Laufendenr && recordsWithHistory[person.Laufendenr || 0] && (
                          <button
                            onClick={() => toggleHistoryView(person.Laufendenr || 0)}
                            className="rounded-md border p-2 hover:bg-gray-100"
                            title="Zeige historische Versionen"
                          >
                            {expandedRows[person.Laufendenr || 0] ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        )}
                        {user && (
                          <button
                            onClick={() => handleEdit(idx, person)}
                            className="rounded-md border p-2 hover:bg-gray-100"
                          >
                            <PencilIcon className="w-5" />
                          </button>
                        )}
                        {user && isAdmin && (
                          <button
                            onClick={() => handleDelete(person.id)}
                            className="rounded-md border p-2 hover:bg-gray-100"
                          >
                            <TrashIcon className="w-5" />
                          </button>
                        )}
                        </>
                      )}
                      </div>
                    </td>
                  )}
                </tr>
                {expandedRows[person.Laufendenr || 0] && historyRecords[person.Laufendenr || 0] && (
                  <>
                    <tr className="w-full border-b py-2 text-sm bg-blue-50">
                      <td colSpan={user ? 13 : 12} className="px-3 py-2 text-blue-700 font-medium">
                        <div className="flex items-center">
                          <span className="mr-2">Versionshistorie</span>
                          <span className="text-xs text-blue-500">Chronologisch sortiert (neueste zuerst)</span>
                        </div>
                      </td>
                    </tr>
                    
                    {historyRecords[person.Laufendenr || 0]
                      .filter(historyRecord => historyRecord.id !== person.id)
                      .sort((a, b) => {
                        const dateA = a.valid_from ? new Date(a.valid_from).getTime() : 0;
                        const dateB = b.valid_from ? new Date(b.valid_from).getTime() : 0;
                        return dateB - dateA;
                      })
                      .map((historyRecord, historyIdx) => (
                        <tr 
                          key={`history-${historyRecord.id}`}
                          className={`w-full border-b py-3 text-sm bg-blue-50/30 hover:bg-blue-50/50 ${historyIdx === historyRecords[person.Laufendenr || 0].filter(h => h.id !== person.id).length - 1 ? 'last-of-type:border-none' : ''}`}
                        >
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Seite}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Familiennr}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Eintragsnr}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Laufendenr}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Familienname}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Vorname}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Vatersname}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Familienrolle}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Geschlecht}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Geburtsjahr}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Geburtsort}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{historyRecord.Arbeitsort}</td>
                          
                          {user && (
                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-xs text-gray-500">
                              <div className="flex flex-col">
                                <span>Gültig bis: {historyRecord.valid_to ? new Date(historyRecord.valid_to).toLocaleString('de-DE') : '-'}</span>
                              </div>                            
                            </td>
                          )}
                        </tr>
                      ))}
                  </>
                )}
                </React.Fragment>
              ))}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}