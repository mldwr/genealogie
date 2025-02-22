'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { EditRow, DeleteRow } from '@/app/deport/buttons';

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

export default function TableClient({ people }: { people: Person[] }) {
  const { user } = useAuth();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
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
              {people?.map((person) => (
                <tr key={person.id} className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                  <td className="whitespace-nowrap px-3 py-3">{person.Seite}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Familiennr}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Eintragsnr}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Laufendenr}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Familienname}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Vorname}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Vatersname}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Familienrolle}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Geschlecht}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Geburtsjahr}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Geburtsort}</td>
                  <td className="whitespace-nowrap px-3 py-3">{person.Arbeitsort}</td>
                  {user && (
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <EditRow id={person.id} />
                        <DeleteRow id={person.id} />
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