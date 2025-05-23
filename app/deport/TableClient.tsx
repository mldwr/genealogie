'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@headlessui/react';
import { PencilIcon, PlusIcon, TrashIcon, StopIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';
import { fetchDeported, updateDeportedPerson, createDeportedPerson, deleteDeportedPerson, getDeportedPersonByLaufendenr, hasHistoricalVersions } from '@/app/deport/data';
import { useToast } from '@/components/ui/Toasts/use-toast';
import { createClient } from '@/utils/supabase/client';

// Import the ITEMS_PER_PAGE constant if it's exported, otherwise define it here
const ITEMS_PER_PAGE = 22; // Make sure this matches the value in data.ts
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

  // State to track which rows have their history expanded
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // State to store historical records for each person
  const [historyRecords, setHistoryRecords] = useState<Record<number, Person[]>>({});
  // State to track which records have historical versions
  const [recordsWithHistory, setRecordsWithHistory] = useState<Record<number, boolean>>({});

  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    fetchData();
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditIdx(-1);

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
              <Button
                onClick={handleAddRow}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Person hinzufügen
              </Button>
            </div>
          )}
          <table className="min-w-full text-gray-900 table ">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">Historie</th>
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
                className={`w-full border-b py-3 text-sm ${editIdx === idx ? 'bg-gray-200' : ''} ${expandedRows[person.Laufendenr || 0] ? 'border-b-0' : 'last-of-type:border-none'} [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Laufendenr && recordsWithHistory[person.Laufendenr || 0] ? (
                      <Button
                        onClick={() => toggleHistoryView(person.Laufendenr || 0)}
                        className="rounded-md p-1 hover:bg-gray-100"
                        title="Zeige historische Versionen"
                      >
                        {expandedRows[person.Laufendenr || 0] ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </Button>
                    ) : (
                      <span className="w-5 h-5 inline-block"></span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Seite"
                          value={formData.Seite}
                          onChange={handleChange}
                          className="w-20"
                          ref={idx === 0 ? firstInputRef : null}
                        />
                      ) : (
                        person.Seite
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {editIdx === idx ? (
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
                  {editIdx === idx ? (
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
                  {editIdx === idx ? (
                      <input
                        type="text"
                        name="Familienname"
                        value={formData.Familienname}
                        onChange={handleChange}
                        className="w-20"
                      />
                    ) : (
                      person.Familienname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                      <input
                        type="text"
                        name="Vorname"
                        value={formData.Vorname}
                        onChange={handleChange}
                        className="w-20"
                      />
                    ) : (
                      person.Vorname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                      <input
                        type="text"
                        name="Vatersname"
                        value={formData.Vatersname}
                        onChange={handleChange}
                        className="w-20"
                      />
                    ) : (
                      person.Vatersname
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Familienrolle"
                          value={formData.Familienrolle}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Familienrolle
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
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
                  {editIdx === idx ? (
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
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Geburtsort"
                          value={formData.Geburtsort}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Geburtsort
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Arbeitsort"
                          value={formData.Arbeitsort}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Arbeitsort
                      )}
                  </td>
                  {user && (
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        {editIdx === idx ? (
                        <>
                        <Button
                          onClick={handleSave}
                          className="rounded-md border p-2 hover:bg-gray-100"
                        >
                          <CheckIcon className="w-5" />
                        </Button>
                        <Button
                          onClick={handleCancel}
                          className="rounded-md border p-2 hover:bg-gray-100"
                        >
                          <StopIcon className="w-5" />
                        </Button>
                        </>
                      ) : (
                        <>
                        {user && (
                          <Button
                            onClick={() => handleEdit(idx, person)}
                            className="rounded-md border p-2 hover:bg-gray-100"
                          >
                            <PencilIcon className="w-5" />
                          </Button>
                        )}
                        {user && isAdmin && (
                          <Button
                            onClick={() => handleDelete(person.id)}
                            className="rounded-md border p-2 hover:bg-gray-100"
                          >
                            <TrashIcon className="w-5" />
                          </Button>
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
                      <td colSpan={user ? 14 : 13} className="px-3 py-2 text-blue-700 font-medium">
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
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="w-5 h-5 inline-block"></span>
                          </td>
                          
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
              ))}            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}