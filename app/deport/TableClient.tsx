'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { EditRow, DeleteRow } from '@/app/deport/buttons';
import { Button } from '@headlessui/react';
import { PencilIcon, PlusIcon, TrashIcon, StopIcon, CheckIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { fetchDeported, updateDeportedPerson } from '@/app/deport/data';

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
}

interface TableClientProps {
  people: Person[];
  refreshData: () => void;
}

export default function TableClient({ people, refreshData }: TableClientProps) {
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


  const { user } = useAuth();
  
  const handleEdit = (idx: number, person: any) => {
    setEditIdx(idx);
    setFormData({ ...person, id: person.id });
    setOriginalData(person);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (formData.id) {
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
      });
    }
    setEditIdx(-1);
    refreshData();
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditIdx(-1);
  };

  return (
    <div className="mt-6 flow-root">
      <div className="block align-middle overflow-x-auto">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
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
                <tr key={person.id} 
                className={`w-full border-b py-3 text-sm last-of-type:border-none ${editIdx === idx ? 'bg-gray-200' : ''} [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}>
                  <td className="whitespace-nowrap px-3 py-3">
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Seite"
                          value={formData.Seite}
                          onChange={handleChange}
                          className="w-20"
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
                  {editIdx === idx ? (
                        <input
                          type="text"
                          name="Laufendenr"
                          value={formData.Laufendenr}
                          onChange={handleChange}
                          className="w-20"
                        />
                      ) : (
                        person.Laufendenr
                      )}
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
                        <input
                          type="text"
                          name="Geschlecht"
                          value={formData.Geschlecht}
                          onChange={handleChange}
                          className="w-20"
                        />
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
                        <Button
                          onClick={() => handleEdit(idx, person)}
                          className="rounded-md border p-2 hover:bg-gray-100"
                        >
                          <PencilIcon className="w-5" />
                        </Button>
                      )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}