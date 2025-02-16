/* import Image from 'next/image';
import { ViewInvoice, UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils'; */
import { fetchInvoicesUser, fetchDeported } from '@/app/deport/data';
import {EditRow, DeleteRow } from '@/app/deport/buttons';

export default async function InvoicesTable({
  query,
  currentPage,
  sessionUserEmail,
}: {
  query: string;
  currentPage: number;
  sessionUserEmail: string;
}) {
  /* const invoices = await fetchInvoicesUser(query, currentPage, sessionUserEmail); */
  const people = await fetchDeported(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {people?.map((person) => (
              <div
                key={person.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{person.Familienname}</p>
                    </div>
                    <p className="text-sm text-gray-500">{person.Vorname}</p>
                  </div>
                  {/* <InvoiceStatus status={invoice.status} /> */}
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                       {/* {formatCurrency(invoice.amount)}  */}
                      {person.Vatersname}
                    </p>
                    <p>{person.Familienrolle}</p>
                    <p>{person.Geschlecht}</p>
                    <p>{person.Geburtsjahr}</p>
                    <p>{person.Geburtsort}</p>
                    <p>{person.Arbeitsort}</p>
                  </div>
                  {/* <div className="flex justify-end gap-2">
                    <ViewInvoice id={invoice.id} />
                    <UpdateInvoice id={invoice.id} invoices={invoices} />
                    <DeleteInvoice id={invoice.id} invoices={invoices} />
                  </div> */}
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">
                  Seite
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Familiennr
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Eintragsnr
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Laufendenr
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Familienname
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Vorname
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Vatername
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Familienrolle
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Geschlecht
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Geburtsjahr
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Geburtsort
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Arbeitsort
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {people?.map((person) => (
                <tr
                  key={person.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Seite}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Familiennr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Eintragsnr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Laufendenr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Familienname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Vorname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Vatersname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Familienrolle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Geschlecht}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Geburtsjahr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Geburtsort}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {person.Arbeitsort}
                  </td>
                  {/* <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td> */}
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <EditRow id={person.id} />
                      <DeleteRow id={person.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}