import axios from 'axios';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';
import axiosInstance from '@/utils/axiosInstance';

export type DevisType = {
  id: string;
  caseId: string;
  created_at: string;
  price: string;
  due_date?: string | null;
  status: string;
  pack_name: string;
  currency?: string;
  reduction?: string;
  doctor?: {
    fullName: any;
    profilePic: any;
    email?: any;
    address_1?: any;
    address_2?: any;
    phone?: any;
  };
};

export type InvoiceType = {
  id: string;
  caseId: string;
  created_at: string;
  amount: string;
  due_date?: string | null;
  payment_status: string;
  invoice_ref: string;
  currency: string;
  product_name: string;
  doctor?: {
    fullName: string;
    address: string;
    address_2: string;
  };
  patient?: {
    fullName: string;
  };
  reduction?: any;
  invoice_url: string;
  partial_payments: {
    id: string;
    amount: string;
    payment_date: string;
    payment_method: string;
    payment_transaction_code: string;
  }[];
};

const defaultDevis: DevisType = {
  pack_name: '',
  id: '0',
  caseId: '0',
  created_at: new Date().toISOString(),
  price: '0.00',
  reduction: '0',
  status: 'draft',
  due_date: null,
  currency: '$',
};

const defaultInvoice: InvoiceType = {
  id: '0',
  caseId: '0',
  created_at: new Date().toISOString(),
  amount: '0.00',
  payment_status: 'unpaid',
  invoice_ref: 'N/A',
  currency: '€',
  product_name: 'N/A',
  partial_payments: [],
  invoice_url: '',
  reduction: '0',
};

const processDevis = (
  devis: any
): {
  doctor:
    | {
        phone: any;
        address_1: any;
        profilePic: any;
        address_2: any;
        fullName: any;
        email: any;
      }
    | undefined;
  pack_name: any;
  price: any;
  patient: { fullName: any } | undefined;
  caseId: any;
  due_date: any;
  created_at: any;
  currency: any;
  id: any;
  reduction: any;
  status: any;
} => {
  return {
    id: devis.id ?? defaultDevis.id,
    caseId: devis.caseId ?? defaultDevis.caseId,
    created_at: devis.created_at ?? defaultDevis.created_at,
    price: devis.price ?? defaultDevis.price,
    due_date: devis.due_date ?? defaultDevis.due_date,
    status: devis.status ?? defaultDevis.status,
    pack_name: devis.pack_name ?? defaultDevis.pack_name,
    currency: devis.currency ?? defaultDevis.currency,
    reduction: devis.reduction ?? defaultDevis.reduction,
    patient: devis.patient
      ? {
          fullName: devis.patient.fullName,
        }
      : undefined,
    doctor: devis.doctor
      ? {
          fullName: devis.doctor.fullName,
          profilePic: devis.doctor.profilePic,
          email: devis.doctor.email,
          address_1: devis.doctor.address_1,
          address_2: devis.doctor.address_2,
          phone: devis.doctor.phone,
          country: devis.doctor.country,
        }
      : undefined,
  };
};

const processInvoice = (invoice: any): InvoiceType => {
  return {
    id: invoice.id?.toString() ?? defaultInvoice.id,
    caseId: invoice.caseId?.toString() ?? defaultInvoice.caseId,
    created_at: invoice.created_at ?? defaultInvoice.created_at,
    amountBeforeReduction:
      invoice.amountBeforeReduction?.toString() ?? defaultInvoice.amount,
    amountAfterReduction:
      invoice.amountAfterReduction?.toString() ?? defaultInvoice.amount,
    due_date: invoice.due_date ?? defaultInvoice.due_date,
    payment_status: invoice.payment_status ?? defaultInvoice.payment_status,
    invoice_ref: invoice.invoice_ref ?? defaultInvoice.invoice_ref,
    currency: invoice.currency ?? defaultInvoice.currency,
    product_name: invoice.product_name ?? defaultInvoice.product_name,
    doctor: invoice.doctor
      ? {
          fullName: invoice.doctor.fullName,
          address: invoice.doctor.address,
          address_2: invoice.doctor.address_2,
          country: invoice.doctor.country,
        }
      : undefined,
    patient: invoice.patient
      ? {
          fullName: invoice.patient.fullName,
        }
      : undefined,
    partial_payments: invoice.partial_payments
      ? invoice.partial_payments.map((payment: any) => ({
          id: payment.id.toString(),
          amount: parseFloat(payment.amount).toFixed(2),
          payment_date: payment.payment_date,
          payment_method: payment.payment_method,
          payment_transaction_code: payment.payment_transaction_code,
          payment_proof_url: payment.payment_proof_url,
        }))
      : defaultInvoice.partial_payments,
    invoice_url: invoice.invoice_url,
    reduction: invoice.reduction ?? defaultInvoice.reduction,
  };
};

const fetchDevis = async (): Promise<DevisType[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `/devis`;
  const url = `${apiUrl}${endpoint}`;
    const response = await axiosInstance.get(url);

  const devisData = response.data as any[];
  return devisData.map(processDevis);
};

const fetchDevisDetails = async (
  devisId: any,
): Promise<DevisType> => {
  console.log('devisId', devisId);
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = `/devis/${devisId}`;
    const url = `${apiUrl}${endpoint}`;

    const response = await axiosInstance.get(url);


    const devisData = response.data as any;
    return processDevis(devisData);
  } catch (error) {
    console.error('Error fetching devis details:', error);
    return defaultDevis;
  }
};

const fetchInvoiceDetails = async (
  invoiceId: any,
  token: any
): Promise<InvoiceType> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = `/devis/invoices/${invoiceId}`;
    const url = `${apiUrl}${endpoint}`;

    const response = await axios.get(url,{withCredentials: true});

    const invoiceData = response.data as any;
    const processedData = processInvoice(invoiceData);
    return processedData;
  } catch (error) {
    console.error('Error fetching invoice details:', error);

    return defaultInvoice;
  }
};

export { fetchDevis, fetchDevisDetails, fetchInvoiceDetails };
