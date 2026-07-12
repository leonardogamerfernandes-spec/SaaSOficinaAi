const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T = any>(path: string, options?: RequestInit): Promise<T> {
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

export const api = {
  health: () => request<{ status: string }>("/health"),

  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any; tenant: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (data: { name: string; email: string; password: string; tenantName: string; cnpj: string; phone?: string; address?: string }) =>
      request<{ token: string; user: any; tenant: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  customers: {
    list: () => request<any[]>("/api/customers"),
    create: (data: { name: string; email?: string; phone: string; cpfCnpj?: string; address?: string }) =>
      request<any>("/api/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/customers/${id}`, { method: "DELETE" }),
  },

  vehicles: {
    list: () => request<any[]>("/api/vehicles"),
    create: (data: { customerId: string; plate: string; brand: string; model: string; year: number; color?: string }) =>
      request<any>("/api/vehicles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
  },

  serviceOrders: {
    list: () => request<any[]>("/api/service-orders"),
    get: (id: string) => request<any>(`/api/service-orders/${id}`),
    create: (data: { customerId: string; vehicleId: string; notes?: string }) =>
      request<any>("/api/service-orders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { status?: string; notes?: string; discount?: number }) =>
      request<any>(`/api/service-orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    addItem: (orderId: string, data: { description: string; quantity: number; unitPrice: number; type: string }) =>
      request<any>(`/api/service-orders/${orderId}/items`, { method: "POST", body: JSON.stringify(data) }),
    removeItem: (orderId: string, itemId: string) =>
      request<void>(`/api/service-orders/${orderId}/items/${itemId}`, { method: "DELETE" }),
    aiAnalyze: (orderId: string) =>
      request<any>(`/api/service-orders/${orderId}/ai-analyze`, { method: "POST" }),
  },

  dashboard: {
    metrics: () => request<any>("/api/dashboard/metrics"),
  },

  ai: {
    listSessions: () => request<any[]>("/api/ai/sessions"),
    createSession: (title?: string) =>
      request<any>("/api/ai/sessions", { method: "POST", body: JSON.stringify({ title }) }),
    getSession: (sessionId: string) => request<any>(`/api/ai/sessions/${sessionId}`),
    sendMessage: (sessionId: string, content: string) =>
      request<any>(`/api/ai/sessions/${sessionId}/message`, { method: "POST", body: JSON.stringify({ content }) }),
  },
};
