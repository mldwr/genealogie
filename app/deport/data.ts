
import {
    SpartenTable,
    CustomerField,
    CustomersTable,
    InvoiceForm,
    InvoicesTable,
    LatestInvoiceRaw,
    User,
    Revenue,
    Deported,
  } from './definitions';
  import { formatCurrency } from './utils';
  import { unstable_noStore as noStore } from 'next/cache';
  import supabase from '@/app/deport/supabase';
  
  
  export async function fetchDeported(query: string, currentPage: number): Promise<Deported[]> {
    noStore();
  
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
  
        const { data, error } = await supabase
        .from('deport')
        .select()
        .or(`Familienname.ilike.%${query}%,Vorname.ilike.%${query}%,Vatersname.ilike.%${query}%,Familienrolle.ilike.%${query}%,Geburtsort.ilike.%${query}%,Geburtsjahr.ilike.%${query}%`)
        .range(offset, offset + ITEMS_PER_PAGE - 1);
        
  
      return data ?? [];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch revenue data.');
    }
  }
  
  export async function fetchDeportedPages(query: string, currentPage: number){
    noStore();
  
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
  
      const { count, error } = await supabase
        .from('deport')
        .select('*', { count: 'exact' })
        .or(`Familienname.ilike.%${query}%,Vorname.ilike.%${query}%,Vatersname.ilike.%${query}%,Familienrolle.ilike.%${query}%,Geburtsort.ilike.%${query}%,Geburtsjahr.ilike.%${query}%`)
        .range(offset, offset + ITEMS_PER_PAGE - 1);
  
        
      const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch revenue data.');
    }
  }
  
  
  export async function fetchRevenue(sessionUserEmail: string): Promise<Revenue[]> {
    // Add noStore() here prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).
    noStore();
  
    try {
      // Artificially delay a reponse for demo purposes.
      // Don't do this in real life :)
  
      //console.log('Fetching revenue data...');
      //await new Promise((resolve) => setTimeout(resolve, 3000));
  
      //const data = await sql<Revenue>`SELECT * FROM revenue`;
      /*const data = await sql<Revenue>
      `
      with cte_month as (
        select 1 as NumMonth, 'Jan' as Month
        union
        select 2 as NumMonth, 'Feb' as Month
        union
        select 3 as NumMonth, 'Mar' as Month
        union
        select 4 as NumMonth, 'Apr' as Month
        union
        select 5 as NumMonth, 'Mai' as Month
        union
        select 6 as NumMonth, 'Jun' as Month
        union
        select 7 as NumMonth, 'Jul' as Month
        union
        select 8 as NumMonth, 'Aug' as Month
        union
        select 9 as NumMonth, 'Sep' as Month
        union
        select 10 as NumMonth, 'Okt' as Month
        union
        select 11 as NumMonth, 'Nov' as Month
        union
        select 12 as NumMonth, 'Dec' as Month
      ), cte_data as (
        select extract(YEAR FROM date) as year, extract(MONTH FROM date) as nummonth,sum(amount)/100 as revenue 
        from invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE customers.email ILIKE ${`%${sessionUserEmail}%`}
        group by extract(YEAR FROM date) , extract(MONTH FROM date)
        limit 12
      ), cte_group as (
        select Year, Month, max(cte_data.nummonth) over (partition by year) as maxmon,  cte_data.nummonth, Revenue
        from cte_data
        join cte_month
        on cte_data.nummonth = cte_month.nummonth
        order by year desc, cte_data.nummonth desc
      )
      select case when maxmon=nummonth then year::varchar(4) else '' end as Year, Month, Revenue  
      from cte_group
      `;      
      */
  
      const sessionuseremail = sessionUserEmail;
      const { data, error } = await supabase.rpc('get_revenue_data', { sessionuseremail });
  
      // console.log('Data fetch',data,error);
  
      //const revenue = data as Revenue;
  
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch revenue data.');
    }
  }
  
  export async function fetchLatestInvoices(sessionUserEmail: string): Promise<LatestInvoiceRaw[]>  {
    noStore();
    
    try {
      // REMOVE TODO 
      //await new Promise((resolve) => setTimeout(resolve, 5000));
  
      /*const data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE customers.email ILIKE ${`%${sessionUserEmail}%`}
        ORDER BY invoices.date DESC
        LIMIT 5`; */
  
      const sessionuseremail = sessionUserEmail;
      const { data, error } = await supabase.rpc('get_latest_invoice', { sessionuseremail });
    
      //console.log('Data invoice',data,error); 
          
      //const latestInvoices = invoices.rows.map((invoice) => ({ ...invoice,  amount: formatCurrency(invoice.amount),  }));
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest invoices.');
    }
  }
  
  export async function fetchCardData(sessionUserEmail: string) {
    noStore();
  
    try {
      // You can probably combine these into a single SQL query
      // However, we are intentionally splitting them to demonstrate
      // how to initialize multiple queries in parallel with JS.
      /* const invoiceCountPromise = sql`
          SELECT count(*)
          FROM invoices
          JOIN customers ON invoices.customer_id = customers.id
          WHERE customers.email ILIKE ${`%${sessionUserEmail}%`}
          `; 
      const customerCountPromise = sql`
          SELECT COUNT(*) 
          FROM customers
          WHERE customers.email ILIKE ${`%${sessionUserEmail}%`}
          `;
      const invoiceStatusPromise = sql`
          SELECT
            SUM(CASE WHEN status = 'genehmigt' THEN amount ELSE 0 END) AS "paid",
            SUM(CASE WHEN status = 'ausstehend' THEN amount ELSE 0 END) AS "pending"
          FROM invoices
          JOIN customers ON invoices.customer_id = customers.id
          WHERE customers.email ILIKE ${`%${sessionUserEmail}%`}
          `;*/
  
  
      const sessionuseremail = sessionUserEmail;
      const { data, error } = await supabase.rpc('get_invoice_customer_counts', { sessionuseremail });
      
      // console.log('Data counts',data,error); 
      // console.log('Data ',data[0].invoice_count); 
  
      const numberOfInvoices = Number(data[0].invoice_count ?? '0');
      const numberOfCustomers = Number(data[0].customer_count ?? '0');
      const totalPaidInvoices = formatCurrency(data[0].paid ?? '0');
      const totalPendingInvoices = formatCurrency(data[0].pending ?? '0');
       
      /* const data = await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        invoiceStatusPromise,
      ]); */
  /* 
      const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
      const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
      const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
      const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0'); */
  
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to card data.');
    }
  }
  
  
  const ITEMS_PER_PAGE = 22;
  export async function fetchInvoicesUser( query: string, currentPage: number, sessionUserEmail: string): Promise<InvoicesTable[]> {
    noStore();
  
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
         
      /* const invoices = await sql<InvoicesTable>`
      SELECT
          invoices.id,
          invoices.amount,
          invoices.hours,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url,
          invoices.groupid
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          (
            customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`} OR
            invoices.date::text ILIKE ${`%${query}%`} OR
            invoices.status ILIKE ${`%${query}%`}
          ) AND
          (
            customers.email ILIKE ${`%${sessionUserEmail}%`} 
          )
        ORDER BY invoices.date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset} 
      `;*/
  
  
      const query_param = query;
      const session_email_param = sessionUserEmail;
      const items_per_page_param = ITEMS_PER_PAGE;
      const offset_param = offset;
      const { data, error } = await supabase.rpc('get_invoices_with_email_and_pagination', { 
        query_param, 
        session_email_param,
        items_per_page_param,
        offset_param });   
  
  
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesUser.');
    }
  }
  
  
  export async function fetchInvoicesByUserMonth( sessionUserEmail: string): Promise<InvoicesTable[]> {
    noStore();
  
    try {
  
      const session_email_param = sessionUserEmail;
      const { data, error } = await supabase.rpc('get_invoices_by_user_month', { session_email_param}); 
      //console.log('data ',data,error);
  
      if (data === null || data.length === 0) {
        throw new Error('No invoices found for the specified user and month.');
      } else {
        return data;
      }    
  
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesByUserMonth.');
    }
  }
  
  
  export async function fetchPastInvoiceAmount( sessionUserEmail: string): Promise<number> {
    noStore();
  
    try {
  
      const session_email_param = sessionUserEmail;
      const { data, error } = await supabase.rpc('get_past_invoices_amount', { session_email_param}); 
      //console.log('data ',data,error);
  
      if (data === null || data.length === 0) {
        throw new Error('No invoices found for the specified past invoices.');
      } else {
        return data[0].total_amount;
      }    
  
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchPastInvoiceAmount.');
    }
  }
  
  
  export async function fetchInvoicesApproveList( query: string, currentPage: number): Promise<InvoicesTable[]> {
    noStore();
  
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
         
      /* const invoices = await sql<InvoicesTable>`
      SELECT
          invoices.id,
          invoices.amount,
          invoices.hours,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url,
          invoices.groupid
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          (
            customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`} OR
            invoices.amount::text ILIKE ${`%${query}%`} OR
            invoices.date::text ILIKE ${`%${query}%`} OR
            invoices.status ILIKE ${`%${query}%`} OR
            invoices.groupid ILIKE ${`%${query}%`}
          ) 
          ORDER BY invoices.date DESC
          --order by invoices.status DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `; */
  
  
      //return invoices.rows;
  
      const query_param = query;
      const items_per_page_param = ITEMS_PER_PAGE;
      const offset_param = offset;
      const { data, error } = await supabase.rpc('search_invoices', { 
        query_param, 
        items_per_page_param,
        offset_param }); 
  
      return data;
  
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesApproveList.');
    }
  }
  
  
  
  export async function fetchInvoicesApproveListSparte( query: string, currentPage: number, sparte: string): Promise<InvoicesTable[]> {
    noStore();
  
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
         
      /* const invoices = await sql<InvoicesTable>`
      SELECT
          invoices.id,
          invoices.amount,
          invoices.hours,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url,
          invoices.groupid
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          (
            customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`} OR
            invoices.amount::text ILIKE ${`%${query}%`} OR
            invoices.date::text ILIKE ${`%${query}%`} OR
            invoices.status ILIKE ${`%${query}%`} OR
            invoices.groupid ILIKE ${`%${query}%`}
          ) AND
          (
            invoices.groupid ILIKE ${`%${sparte}%`} --AND
            --invoices.status = 'ausstehend'
          )
        ORDER BY invoices.date DESC
        --order by invoices.status
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset} 
      `;*/
  
  
  
      const query_param = query;
      const sparte_param = sparte;
      const items_per_page_param = ITEMS_PER_PAGE;
      const offset_param = offset;
      const { data, error } = await supabase.rpc('search_invoices_division', { 
        query_param, 
        sparte_param,
        items_per_page_param,
        offset_param }); 
  
  
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesApproveListSparte.');
    }
  }
  
  
  export async function fetchInvoicesApprovePagesSparte(query: string, sparte: string) {
      noStore();
      
      try {
        /* const count = await sql`
        SELECT COUNT(*)
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          (
            customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`} OR
            invoices.amount::text ILIKE ${`%${query}%`} OR
            invoices.date::text ILIKE ${`%${query}%`} OR
            invoices.status ILIKE ${`%${query}%`}
          ) AND
          (
            invoices.groupid ILIKE ${`%${sparte}%`} --AND
            --invoices.status = 'ausstehend'
          )
      `; */
    
  
        const query_param = query;
        const sparte_param = sparte;
        const { data, error } = await supabase.rpc('count_matching_invoices', { query_param, sparte_param });
  
        const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
        return totalPages;
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch fetchInvoicesApprovePagesSparte.');
      }
    }
    
  
    export async function fetchInvoicesApprovePagesUser(query: string, sessionUserEmail: string) {
      noStore();
      
      try {
        /* const count = await sql`
        SELECT COUNT(*)
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          (
            customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`} OR
            invoices.amount::text ILIKE ${`%${query}%`} OR
            invoices.date::text ILIKE ${`%${query}%`} OR
            invoices.status ILIKE ${`%${query}%`}
          ) AND
          (
            customers.email ILIKE ${`%${sessionUserEmail}%`} 
          )
      `; */
    
        //const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
        //return totalPages;
  
  
      const query_param = query;
      const session_email_param = sessionUserEmail;
      const { data, error } = await supabase.rpc('count_matching_invoices_for_user', { query_param, session_email_param });
  
      const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
      return totalPages;
  
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch fetchInvoicesApprovePagesUser.');
      }
    }
  
  
    
  
  export async function fetchInvoicesPagesUser(query: string, sessionUserEmail: string) {
    noStore();
  
    try {
      /* const count = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        (
          customers.name ILIKE ${`%${query}%`} OR
          customers.email ILIKE ${`%${query}%`} OR
          invoices.amount::text ILIKE ${`%${query}%`} OR
          invoices.date::text ILIKE ${`%${query}%`} OR
          invoices.status ILIKE ${`%${query}%`}
        ) AND
        (
          customers.email ILIKE ${`%${sessionUserEmail}%`} 
        )
    `; */
  
  
      const query_param = query;
      const session_email_param = sessionUserEmail;
      const { data, error } = await supabase.rpc('count_matching_invoices_with_email', { query_param, session_email_param });
  
      const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
      //const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesPagesUser.');
    }
  }
  
  
  export async function fetchInvoicesPages(query: string) {
    noStore();
    
    try {
      /* const count = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `; */
  
  
      const query_param = query;
      const { data, error } = await supabase.rpc('count_matching_invoices', { query_param}); 
  
      //const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
      const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
      console.log('totalPages', totalPages);
  
      return totalPages;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoicesPages.');
    }
  }
  
  
  
  export async function fetchInvoiceById(id: string): Promise<InvoiceForm[]> {
    noStore();
    try {
      /* const data = await sql<InvoiceForm>`
      SELECT
      invoices.id,
      invoices.customer_id,
      invoices.amount,
      invoices.hours,
      invoices.date,
      invoices.status,
      invoices.groupid
    FROM invoices
        WHERE invoices.id = ${id};
      `; */
  
  
      const id_param = id;
      const { data, error } = await supabase.rpc('get_invoice_by_id', { id_param});  
  
      /* const invoice = data.rows.map((invoice) => ({
        ...invoice,
        // Convert amount from cents to dollars
        //amount: invoice.amount / 100,
        //date: new Date(invoice.date).toLocaleDateString()
      })); */
      
      // console.log(invoice)
      //return invoice[0];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch fetchInvoiceById.');
    }
  }
  
  export async function fetchSparten( query: string): Promise<SpartenTable[]> {
    noStore();
    try {
      /* const data = await sql<SpartenTable>`
        SELECT
          sp.name as spartenname,
          sl.name as spartenleiter,
          sp.spartenleiter as spartenleiterEmail
        FROM sparten sp
        left join customers sl
        on sp.spartenleiter = sl.email
        WHERE
        sp.name ILIKE ${`%${query}%`} OR
        sl.name ILIKE ${`%${query}%`} OR
        sp.spartenleiter  ILIKE ${`%${query}%`} 
        ORDER BY sp.name ASC
      `; */
  
  
      const query_param = query;
      const { data, error } = await supabase.rpc('search_sparten', { query_param});   
  
      const groups = data.length !== 0 ? data : [{
        spartenname: '',
        spartenleiter: '',
        spartenleiteremail: '',}] ;
      //const groups = data.rows;
      return groups;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch fetchSparten.');
    }
  }
  
  
  
  export async function fetchCustomerById(customerId: string): Promise<CustomersTable> {
    noStore();
  
    try {
  
      const customer_id_param = customerId;
      const { data, error } = await supabase.rpc('search_customer_by_id', { customer_id_param });
  
      return data[0];
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch fetchCustomerById.');
    }
  }
  
  
  //export async function fetchCustomers() {
  export async function fetchCustomers(): Promise<CustomerField[]> {
    noStore();
    try {
      /* const data = await sql<CustomerField>`
        SELECT
          id,
          name,
          email
        FROM customers
        ORDER BY name ASC
      `; */
  
  
      const { data, error } = await supabase.rpc('get_customers');  
  
      //const customers = data.rows;
      //const customers = rows as CustomerField;
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch all customers.');
    }
  }
  
  
  export async function fetchFilteredCustomers(query: string): Promise<CustomersTable[]> {
    noStore();
  
    try {
      /* const customers = await sql<CustomersTable>`
      WITH CTE AS (
        SELECT
              customers.id,
              customers.name,
              customers.email,
              customers.image_url,
              case when status = 'ausstehend' then 1 else 0 end as ausstehend,
              case when status = 'geprüft' then 1 else 0 end as geprueft,
              case when status = 'genehmigt' then 1 else 0 end as genehmigt,
              customers.rate
        FROM invoices 
        LEFT JOIN customers 
        ON invoices.customer_id = customers.id 
      )
        SELECT
            id,
            name,
            email,
            image_url,
            sum(ausstehend) as total_ausstehend,
            sum(geprueft) as total_geprueft,
            sum(genehmigt) as total_genehmigt,
            rate
        FROM CTE
        WHERE
          (
                name ILIKE ${`%${query}%`} OR
            email ILIKE ${`%${query}%`}
          ) 
        GROUP BY id, name, email, image_url, rate
        ORDER BY name ASC
        `;
   */
  
  
      const query_param = query;
      const { data, error } = await supabase.rpc('search_customers_summary', { query_param}); 
  
      /* const customers = data.rows.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending),
        total_paid: formatCurrency(customer.total_paid),
      })); */
  
      //return customers.rows;
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetchFilteredCustomers.');
    }
  }
  
  
  
  
  export async function fetchFilteredCustomersUser(query: string, sessionUserEmail: string): Promise<CustomersTable[]> {
    noStore();
  
    try {
      /* const customers = await sql<CustomersTable>`
      WITH CTE AS (
        SELECT
              customers.id,
              customers.name,
              customers.email,
              customers.image_url,
              case when status = 'ausstehend' then 1 else 0 end as ausstehend,
              case when status = 'geprüft' then 1 else 0 end as geprueft,
              case when status = 'genehmigt' then 1 else 0 end as genehmigt,
              customers.rate
        FROM invoices 
        LEFT JOIN customers 
        ON invoices.customer_id = customers.id 
      )
        SELECT
            id,
            name,
            email,
            image_url,
            sum(ausstehend) as total_ausstehend,
            sum(geprueft) as total_geprueft,
            sum(genehmigt) as total_genehmigt,
            rate
        FROM CTE
        WHERE
          (
                name ILIKE ${`%${query}%`} OR
            email ILIKE ${`%${query}%`}
          ) AND
            email ILIKE ${`%${sessionUserEmail}%`}
        GROUP BY id, name, email, image_url, rate
        ORDER BY name ASC
        `; */
  
      /* const customers = data.rows.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending),
        total_paid: formatCurrency(customer.total_paid),
      })); */
  
      //return customers.rows;
  
      const query_param = query;
      const sessionuseremail_param = sessionUserEmail;
      const { data, error } = await supabase.rpc('search_customers_summary_for_user', { query_param, sessionuseremail_param });
  
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch fetchFilteredCustomersUser.');
    }
  }
  
  
  
  export async function fetchFilteredCustomersSparten(query: string, sparte: string): Promise<CustomersTable[]> {
    noStore();
  
    try {
      /* const customers = await sql<CustomersTable>`
      WITH CTE AS (
        SELECT
              customers.id,
              customers.name,
              customers.email,
              customers.image_url,
              invoices.groupid,
              case when status = 'ausstehend' then 1 else 0 end as ausstehend,
              case when status = 'geprüft' then 1 else 0 end as geprueft,
              case when status = 'genehmigt' then 1 else 0 end as genehmigt,
              customers.rate
        FROM invoices 
        LEFT JOIN customers 
        ON invoices.customer_id = customers.id 
      )
        SELECT
            id,
            name,
            email,
            image_url,
            groupid,
            sum(ausstehend) as total_ausstehend,
            sum(geprueft) as total_geprueft,
            sum(genehmigt) as total_genehmigt,
            rate
        FROM CTE
        WHERE
              (
            name ILIKE ${`%${query}%`} OR
            email ILIKE ${`%${query}%`}
          ) 
          AND
            groupid ILIKE ${`%${sparte}%`}
        GROUP BY id, name, email, image_url, groupid, rate
        ORDER BY name ASC 
        `;*/
  
  
      const query_param = query;
      const sparte_param = sparte;
      const { data, error } = await supabase.rpc('search_customers', { query_param, sparte_param });
  
      /* const customers = data.rows.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending),
        total_paid: formatCurrency(customer.total_paid),
      })); */
  
  
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch fetchFilteredCustomersSparten.');
    }
  }
  
  
  /* export async function getUser(email: string) {
    try {
      const user = await sql`
      SELECT 
            id, 
            name, 
            email, 
            password, 
            role 
      from USERS 
            where email=${email}`;
      return user.rows[0] as User;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
  } */
  
  
  /*export async function fetchRoleId(sessionUserEmail: string | null | undefined){
    noStore();
  
    try{
      const roleId = await sql<User>`
      SELECT
      role
      from USERS
      where email = ${sessionUserEmail}
      `;
  
      return roleId.rows[0].role;
    }catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch approveId.');
    }
  }*/