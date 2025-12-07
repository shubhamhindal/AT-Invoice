"use client";
import { toast } from "react-toastify";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://alitinvoiceappapi.azurewebsites.net/api";

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token") || localStorage.getItem("token")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const authHeaders = getAuthHeaders();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const userHeaders = options.headers as Record<string, string> | undefined;
  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...(userHeaders || {}),
  };

  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const config: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    let data: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // JSON parse failed
      }
    }

    if (!response.ok) {
      let errorMessage = 'Something went wrong';

      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.title) {
          errorMessage = data.title;
        }
      }

      if (errorMessage === 'Something went wrong') {
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      throw new ApiError(errorMessage, response.status);
    }

    return data as T;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      toast.error('Network error. Please check your connection.', {
        position: 'top-right',
        autoClose: 10000,
      });
    } else if (!(err instanceof ApiError)) {
      toast.error('An unexpected error occurred', { position: 'top-right' });
    }
    throw err;
  }
}

export interface LoginResponse {
  token: string;
  userID: number;
  companyID: number;
  email: string;
  firstName: string;
  lastName?: string;
  companyName: string;
  currencySymbol: string;
}

export const login = (
  email: string,
  password: string
): Promise<LoginResponse> =>
  apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });

export const signup = (formData: FormData): Promise<LoginResponse> =>
  apiFetch<LoginResponse>("/auth/signup", {
    method: "POST",
    body: formData,
  });

interface Item {
  itemID: number;
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number | null;
  thumbnailUrl?: string | null;
  createdByUserName?: string;
  createdOn?: string;
}

export const getItems = (): Promise<Item[]> =>
  apiFetch<Item[]>("/Item/GetList");
export const getItem = (id: number): Promise<Item> =>
  apiFetch<Item>(`/Item/${id}`);

export const createItem = (data: unknown): Promise<Item> =>
  apiFetch<Item>("/Item", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateItem = (data: unknown): Promise<Item> =>
  apiFetch<Item>(`/Item`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteItem = (id: number): Promise<void> =>
  apiFetch<void>(`/Item/${id}`, { method: "DELETE" });

export interface ItemCategory {
  categoryID: number;
  categoryName: string;
  createdOn: string;
}

export const getCategories = (): Promise<ItemCategory[]> =>
  apiFetch<ItemCategory[]>("/itemcategories");
export const createCategory = (name: string): Promise<ItemCategory> =>
  apiFetch<ItemCategory>("/itemcategories", {
    method: "POST",
    body: JSON.stringify({ categoryName: name.trim() }),
  });
export const updateCategory = (
  id: number,
  name: string
): Promise<ItemCategory> =>
  apiFetch<ItemCategory>(`/itemcategories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ categoryName: name.trim() }),
  });
export const deleteCategory = (id: number): Promise<void> =>
  apiFetch<void>(`/itemcategories/${id}`, { method: "DELETE" });

export interface InvoiceLine {
  rowNo: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct?: number | null;
}

// export interface Invoice {
//   invoiceID: number;
//   invoiceNo: number;
//   invoiceDate: string;
//   customerName: string;
//   address?: string | null;
//   city?: string | null;
//   taxPercentage: number;
//   notes?: string | null;
//   lines: InvoiceLine[];
//   subTotal?: number;
//   taxAmount?: number;
//   totalAmount: number;
//   status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
//   issueDate: string;
//   itemsCount?: number;
// }

export interface Invoice {
  primaryKeyID: number;
  invoiceID: number;
  invoiceNo: number;
  invoiceDate: string;
  customerName: string;
  address?: string | null;
  city?: string | null;
  taxPercentage: number;
  notes?: string | null;
  totalItems: number;
  lines: InvoiceLine[];
  subTotal?: number;
  taxAmount?: number;
  invoiceAmount: number;
  createdByUserName: string;
  createdOn: string;
  updatedByUserName: string | null;
  updatedOn: string | null;
  companyName?: string;
  companyLogoUrl?: string;
  currencySymbol: string;
}

export interface InvoiceListItem {
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  totalItems: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  createdOn?: string;
  updatedOn?: string | null;
}

export const getInvoices = (params?: {
  InvoiceID?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<InvoiceListItem[]> => {
  let query = "";
  if (params) {
    const q = new URLSearchParams();
    if (params.InvoiceID) q.append("InvoiceID", params.InvoiceID.toString());
    if (params.fromDate) q.append("fromDate", params.fromDate);
    if (params.toDate) q.append("toDate", params.toDate);
    query = q.toString() ? `?${q.toString()}` : "";
  }
  return apiFetch<InvoiceListItem[]>(`/Invoice/GetList${query}`);
};

export const getInvoice = (id: number): Promise<Invoice> =>
  apiFetch<Invoice>(`/Invoice/${id}`);

export const createInvoice = (
  data: Omit<Invoice, "invoiceID">
): Promise<Invoice> =>
  apiFetch<Invoice>("/Invoice", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateInvoice = (data: Invoice): Promise<Invoice> =>
  apiFetch<Invoice>("/Invoice", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteInvoice = (id: number): Promise<void> =>
  apiFetch<void>(`/Invoice/${id}`, { method: "DELETE" });

export interface InvoiceLine {
  rowNo: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct?: number | null;
}

export interface InvoicePayload {
  invoiceNo?: number;
  invoiceID?: number;
  invoiceDate: string;
  customerName: string;
  address?: string | null;
  city?: string | null;
  taxPercentage: number;
  notes?: string | null;
  lines: InvoiceLine[];
}

export const createUpdateInvoice = async (
  data: InvoicePayload
): Promise<unknown> => {
  const isUpdate = data.invoiceID !== undefined && data.invoiceID > 0;

  const url = "/Invoice";
  const method = isUpdate ? "PUT" : "POST";

  return apiFetch<unknown>(url, {
    method,
    body: JSON.stringify(data),
  });
};


export const getNextInvoiceNo = async (): Promise<number> => {
  const invoices = await getInvoices();
  const numbers = invoices
    .map(inv => parseInt(String(inv.invoiceNo || '0'), 10))
    .filter(n => !isNaN(n));
  
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
};