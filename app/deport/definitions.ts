// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type Deported = {
    Laufendenr: number
    Eintragsnr: number | null
    Familienname: string | null
    Familiennr: number | null
    Geburtsjahr: string | null
    Geschlecht: string | null
    Geburtsort: string | null
    Arbeitsort: string | null
    Seite: number | null
    Vatersname: string | null
    Vorname: string | null
    Familienrolle: string | null
    id: string
    version: 'inserted' | 'updated' | 'deleted'
    valid_from: string | null
    valid_to: string | null
    logical_id: string | null
    updated_at: string | null
    updated_by: string | null
  };


  export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    image: string;
    role: string;
  };

  export type Customer = {
    id: string;
    name: string;
    email: string;
    image_url: string;
  };

  export type Invoice = {
    id: string;
    customer_id: string;
    amount: number;
    date: string;
    // In TypeScript, this is called a string union type.
    // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
    status: 'ausstehend' | 'geprüft' | 'genehmigt';
  };

  export type Revenue = {
    year: string;
    month: string;
    revenue: number;
  };

  export type LatestInvoice = {
    id: string;
    name: string;
    image_url: string;
    email: string;
    amount: string;
    date: string;
  };

  // The database returns a number for amount, but we later format it to a string with the formatCurrency function
  export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
    amount: number;
  };

  export type InvoicesTable = {
    id: string;
    customer_id: string;
    name: string;
    email: string;
    image_url: string;
    date: string;
    amount: number;
    hours: number;
    status: 'ausstehend' | 'geprüft' | 'genehmigt';
    groupid: string;
  };

  export type CustomersTable = {
    id: string;
    name: string;
    email: string;
    image_url: string;
    total_ausstehend: number;
    total_geprueft: number;
    total_genehmigt: number;
    rate: number;
  };

  export type FormattedCustomersTable = {
    id: string;
    name: string;
    email: string;
    image_url: string;
    total_ausstehend: number;
    total_geprueft: number;
    total_genehmigt: number;
    rate: number;
    // the FormattedCustomersTable was used to hold the currency format.
    // see data.ts and fetchFilteredCustomers
    // total_pending: string;
    // total_paid: string;
  };

  export type CustomerField = {
    id: string;
    name: string;
    email: string;
  };

  export type InvoiceForm = {
    id: string;
    customer_id: string;
    amount: number;
    hours: number;
    date: string;
    status: 'ausstehend' | 'geprüft' | 'genehmigt';
    groupid: string;
  };

  export type SpartenTable = {
    spartenname: string;
    spartenleiter: string;
    spartenleiteremail: string;
  };