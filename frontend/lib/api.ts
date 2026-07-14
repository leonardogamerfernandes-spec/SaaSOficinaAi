const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// --- Types ---
export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  phone?: string;
  address?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  planExpiresAt?: string;
  maxUsers: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpfCnpj?: string;
  address?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  mileage?: number;
  engineInfo?: string;
  customer?: Customer;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: "PART" | "LABOR";
}

export interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  status: string;
  discount: number;
  totalPrice: number;
  notes?: string;
  aiDiagnostic?: string;
  createdAt: string;
  items?: ServiceItem[];
  customer?: Customer;
  vehicle?: Vehicle;
  createdBy?: { id: string; name: string; role: string };
  inspection?: InspectionChecklist;
  warranty?: ServiceWarranty;
}

export interface InspectionChecklist {
  id: string;
  serviceOrderId: string;
  headlightsOk: boolean;
  taillightsOk: boolean;
  tiresOk: boolean;
  brakesOk: boolean;
  fluidsOk: boolean;
  batteryOk: boolean;
  suspensionOk: boolean;
  exhaustOk: boolean;
  acOk: boolean;
  wiperOk: boolean;
  mirrorsOk: boolean;
  bodyDamageNotes?: string;
  mileage?: number;
  fuelLevel?: "EMPTY" | "QUARTER" | "HALF" | "THREE_QUARTER" | "FULL";
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  partNumber?: string;
  brand?: string;
  quantity: number;
  minQuantity: number;
  unitCost: number;
  unitPrice: number;
  category: "BRAKE" | "ENGINE" | "SUSPENSION" | "ELECTRICAL" | "FILTERS" | "LUBRICATION" | "OTHER";
  location?: string;
  createdAt: string;
}

export interface ServiceWarranty {
  id: string;
  serviceOrderId: string;
  warrantyDays: number;
  expiresAt: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceReminder {
  id: string;
  customerId: string;
  vehicleId: string;
  type: "OIL_CHANGE" | "REVISION" | "TIMING_BELT" | "BRAKE_CHECK" | "TIRE_ROTATION" | "CUSTOM";
  description: string;
  dueDateKm?: number;
  dueDate?: string;
  status: "PENDING" | "SENT" | "COMPLETED" | "DISMISSED";
  createdAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string;
  scheduledTime: string;
  notes?: string;
  status: string;
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalVehicles: number;
  activeOrdersCount: number;
  pendingBudgetsCount: number;
  totalRevenue: number;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recentOrders: ServiceOrder[];
  weeklyRevenue: { day: string; revenue: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface PlanStatusResponse {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  limits: {
    customers: number;
    monthlyOrders: number;
    users: number;
  };
  usage: {
    customers: number;
    monthlyOrders: number;
    users: number;
  };
}

export interface FinancialReportResponse {
  totalRevenue: number;
  ticketMedio: number;
  completedOrdersCount: number;
  monthlyData: { month: string; revenue: number }[];
}

export interface TopServiceResponse {
  description: string;
  count: number;
  totalValue: number;
  type: string;
}

export interface TopCustomerResponse {
  id: string;
  name: string;
  phone: string;
  spent: number;
  ordersCount: number;
}

// --- HTTP Client ---
async function request<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let message: string;
    try {
      message = JSON.parse(body).error || body;
    } catch {
      message = body;
    }
    throw new Error(message || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- API Methods ---
export const api = {
  health: () => request<{ status: string }>("/health"),

  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (data: { name: string; email: string; password: string; tenantName: string; cnpj: string; phone?: string; address?: string }) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  plans: {
    getStatus: () => request<PlanStatusResponse>("/api/plans/status"),
    update: (plan: "FREE" | "PRO" | "ENTERPRISE") =>
      request<{ message: string; plan: string; maxUsers: number }>("/api/plans/update", {
        method: "POST",
        body: JSON.stringify({ plan }),
      }),
  },

  customers: {
    list: () => request<Customer[]>("/api/customers"),
    create: (data: { name: string; email?: string; phone: string; cpfCnpj?: string; address?: string }) =>
      request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Customer>) =>
      request<Customer>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/customers/${id}`, { method: "DELETE" }),
  },

  vehicles: {
    list: () => request<Vehicle[]>("/api/vehicles"),
    create: (data: { customerId: string; plate: string; brand: string; model: string; year: number; color?: string; vin?: string; mileage?: number; engineInfo?: string }) =>
      request<Vehicle>("/api/vehicles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Vehicle>) =>
      request<Vehicle>(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
    history: (id: string) =>
      request<{ vehicle: Vehicle; history: ServiceOrder[] }>(`/api/vehicles/${id}/history`),
  },

  serviceOrders: {
    list: () => request<ServiceOrder[]>("/api/service-orders"),
    get: (id: string) => request<ServiceOrder>(`/api/service-orders/${id}`),
    create: (data: { customerId: string; vehicleId: string; notes?: string }) =>
      request<ServiceOrder>("/api/service-orders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { status?: string; notes?: string; discount?: number }) =>
      request<ServiceOrder>(`/api/service-orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    addItem: (orderId: string, data: { description: string; quantity: number; unitPrice: number; type: string }) =>
      request<ServiceItem>(`/api/service-orders/${orderId}/items`, { method: "POST", body: JSON.stringify(data) }),
    removeItem: (orderId: string, itemId: string) =>
      request<void>(`/api/service-orders/${orderId}/items/${itemId}`, { method: "DELETE" }),
    aiAnalyze: (orderId: string) =>
      request<{ aiDiagnostic: string; order: ServiceOrder }>(`/api/service-orders/${orderId}/ai-analyze`, { method: "POST" }),
  },

  inspections: {
    get: (serviceOrderId: string) =>
      request<InspectionChecklist | null>(`/api/inspections/${serviceOrderId}`),
    upsert: (serviceOrderId: string, data: Partial<InspectionChecklist>) =>
      request<InspectionChecklist>(`/api/inspections/${serviceOrderId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  reports: {
    financial: () => request<FinancialReportResponse>("/api/reports/financial"),
    topServices: () => request<TopServiceResponse[]>("/api/reports/top-services"),
    topCustomers: () => request<TopCustomerResponse[]>("/api/reports/top-customers"),
  },

  inventory: {
    list: () => request<InventoryItem[]>("/api/inventory"),
    create: (data: Omit<InventoryItem, "id" | "createdAt">) =>
      request<InventoryItem>("/api/inventory", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<InventoryItem>) =>
      request<InventoryItem>(`/api/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/inventory/${id}`, { method: "DELETE" }),
  },

  reminders: {
    list: () => request<ServiceReminder[]>("/api/reminders"),
    create: (data: { customerId: string; vehicleId: string; type: string; description: string; dueDateKm?: number; dueDate?: string }) =>
      request<ServiceReminder>("/api/reminders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ServiceReminder>) =>
      request<ServiceReminder>(`/api/reminders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/reminders/${id}`, { method: "DELETE" }),
  },

  warranties: {
    list: () => request<ServiceWarranty[]>("/api/warranties"),
    get: (serviceOrderId: string) =>
      request<ServiceWarranty | null>(`/api/warranties/order/${serviceOrderId}`),
    upsert: (serviceOrderId: string, data: { warrantyDays: number; notes?: string }) =>
      request<ServiceWarranty>(`/api/warranties/order/${serviceOrderId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  dashboard: {
    metrics: () => request<DashboardResponse>("/api/dashboard/metrics"),
  },

  ai: {
    listSessions: () => request<ChatSession[]>("/api/ai/sessions"),
    createSession: (title?: string) =>
      request<ChatSession>("/api/ai/sessions", { method: "POST", body: JSON.stringify({ title }) }),
    getSession: (sessionId: string) => request<ChatSession>(`/api/ai/sessions/${sessionId}`),
    sendMessage: (sessionId: string, content: string) =>
      request<{ userMessage: ChatMessage; aiMessage: ChatMessage }>(`/api/ai/sessions/${sessionId}/message`, { method: "POST", body: JSON.stringify({ content }) }),
    partsFinder: (data: { vehicleBrand: string; vehicleModel: string; vehicleYear: number; engineInfo?: string; serviceDescription: string }) =>
      request<{ result: string }>("/api/ai/parts-finder", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  appointments: {
    list: () => request<Appointment[]>("/api/appointments"),
    create: (data: { customerId: string; vehicleId: string; scheduledTime: string; notes?: string }) =>
      request<Appointment>("/api/appointments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { scheduledTime?: string; notes?: string; status?: string }) =>
      request<Appointment>(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/appointments/${id}`, { method: "DELETE" }),
  },
};
