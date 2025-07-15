import axios from 'axios';

export type InvoiceType = {
  id: string;
  caseId: string;
  created_at: string;
  amount: string;
  due_date?: string | null;
  payment_status: string;
  invoice_ref: string;
  payment_method?: string;
  payment_transaction_code?: string;
  currency?: string;
  doctor?: {
    fullName: any;
    profilePic: any;
    email?: string;
    address_1?: string;
    address_2?: string;
    phone?: string;
  };
};

const defaultInvoice: InvoiceType = {
  id: '0',
  caseId: '0',
  created_at: new Date().toISOString(),
  amount: '0.00',
  payment_status: 'unpaid',
  invoice_ref: '',
  due_date: null,
  currency: '$',
};

const processInvoice = (invoice: any): InvoiceType => {
  return {
    id: invoice.id ?? defaultInvoice.id,
    caseId: invoice.caseId ?? defaultInvoice.caseId,
    created_at: invoice.created_at ?? defaultInvoice.created_at,
    amount: invoice.amount ?? defaultInvoice.amount,
    due_date: invoice.due_date ?? defaultInvoice.due_date,
    payment_status: invoice.payment_status ?? defaultInvoice.payment_status,
    invoice_ref: invoice.invoice_ref ?? defaultInvoice.invoice_ref,
    payment_method: invoice.payment_method ?? defaultInvoice.payment_method,
    payment_transaction_code:
      invoice.payment_transaction_code ??
      defaultInvoice.payment_transaction_code,
    currency: invoice.currency ?? defaultInvoice.currency,
    reste_a_payer: invoice.reste_a_payer,
    doctor: invoice.doctor
      ? {
          fullName: invoice.doctor.fullName,
          profilePic: invoice.doctor.profilePic,
          email: invoice.doctor.email,
          address_1: invoice.doctor.address_1,
          address_2: invoice.doctor.address_2,
          phone: invoice.doctor.phone,
        }
      : undefined,
    patient_name: invoice.patient_name,
  };
};

const fetchInvoices = async (token: any): Promise<InvoiceType[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `/devis/invoices`;
  const url = `${apiUrl}${endpoint}`;
  const response = await axios.get(url, {
    withCredentials: true,
  });
  const invoiceData = response.data as any[];
  return invoiceData.map(processInvoice);
};

export { fetchInvoices };
