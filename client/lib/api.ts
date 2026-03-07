const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
};

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
}

// ============ Product APIs ============

export async function getProducts(params?: { category?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.featured) query.set("featured", "true");
    const qs = query.toString();
    return apiRequest<{ success: boolean; count: number; data: Product[] }>(
        `/products${qs ? `?${qs}` : ""}`
    );
}

export async function getProduct(slug: string) {
    return apiRequest<{ success: boolean; data: Product }>(`/products/${slug}`);
}

// ============ Order APIs ============

export async function createOrder(orderData: CreateOrderPayload) {
    return apiRequest<{ success: boolean; data: { order: Order; whatsappUrl: string } }>(
        "/orders",
        { method: "POST", body: orderData }
    );
}

export async function getOrder(orderNumber: string) {
    return apiRequest<{ success: boolean; data: Order }>(`/orders/${orderNumber}`);
}

export async function getOrdersByPhone(phone: string) {
    return apiRequest<{ success: boolean; count: number; data: Order[] }>(
        `/orders/phone/${phone}`
    );
}

export async function cancelOrder(orderNumber: string) {
    return apiRequest<{ success: boolean; data: Order }>(
        `/orders/${orderNumber}/cancel`,
        { method: "PATCH" }
    );
}

// ============ Client APIs ============

export async function getClientByPhone(phone: string) {
    return apiRequest<{ success: boolean; data: Client }>(`/clients/${phone}`);
}

export async function upsertClient(data: { phone: string; name: string; defaultAddress?: string; alternatePhone?: string }) {
    return apiRequest<{ success: boolean; data: Client }>("/clients", {
        method: "POST",
        body: data,
    });
}

// ============ Types ============

export type ProductVariant = {
    label: string;
    price: number;
    weight: number;
};

export type Product = {
    _id: string;
    name: string;
    slug: string;
    category: "sweets" | "namkeens";
    description: string;
    imgURL: string;
    pricingType: "weight" | "piece";
    variants: ProductVariant[];
    tags: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    sortOrder: number;
};

export type OrderItem = {
    product: string;
    productName: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type StatusHistoryEntry = {
    status: string;
    changedAt: string;
    changedBy: "system" | "admin" | "user";
};

export type Order = {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDate: string;
    deliveryTimeSlot: string;
    items: OrderItem[];
    subtotal: number;
    status: string;
    statusHistory: StatusHistoryEntry[];
    cancelledBy: string | null;
    whatsappSent: boolean;
    source: "online" | "offline";
    notes: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateOrderPayload = {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDate: string;
    deliveryTimeSlot: string;
    notes?: string;
    items: {
        productId: string;
        variant: string;
        quantity: number;
    }[];
};

export type AdminCreateOrderPayload = {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDate: string;
    deliveryTimeSlot: string;
    notes?: string;
    status?: string;
    items: {
        productId: string;
        variant: string;
        quantity: number;
    }[];
};

export type Client = {
    _id: string;
    phone: string;
    name: string;
    defaultAddress: string;
    alternatePhone: string;
    orderCount: number;
    totalSpent: number;
    createdAt: string;
    updatedAt: string;
};

export type AdminStats = {
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalProducts: number;
    totalClients: number;
    totalRevenue: number;
};

export type RequirementByVariant = {
    productName: string;
    variant: string;
    totalQty: number;
    deliveredQty: number;
    requirementQty: number;
};

export type RequirementByProduct = {
    productName: string;
    pricingType: "weight" | "piece";
    totalWeight: number;
    deliveredWeight: number;
    requirementWeight: number;
    totalQty: number;
    deliveredQty: number;
    requirementQty: number;
};

export type RequirementsData = {
    date: string;
    totalOrders: number;
    toPrepareOrders: number;
    dispatchedOrders: number;
    byVariant: RequirementByVariant[];
    byProduct: RequirementByProduct[];
};

// ============ Admin APIs ============

function authHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(phone: string, password: string) {
    return apiRequest<{ success: boolean; token: string }>("/admin/login", {
        method: "POST",
        body: { phone, password },
    });
}

export async function adminGetStats(token: string) {
    return apiRequest<{ success: boolean; data: AdminStats }>("/admin/stats", {
        headers: authHeaders(token),
    });
}

export async function adminGetOrders(token: string, status?: string) {
    const qs = status ? `?status=${status}` : "";
    return apiRequest<{ success: boolean; count: number; data: Order[] }>(
        `/admin/orders${qs}`,
        { headers: authHeaders(token) }
    );
}

export async function adminCreateOrder(token: string, data: AdminCreateOrderPayload) {
    return apiRequest<{ success: boolean; data: Order }>(
        "/admin/orders",
        { method: "POST", body: data, headers: authHeaders(token) }
    );
}

export async function adminUpdateOrderStatus(token: string, orderId: string, status: string, secretKey?: string) {
    return apiRequest<{ success: boolean; data: Order }>(
        `/admin/orders/${orderId}/status`,
        { method: "PATCH", body: { status, ...(secretKey ? { secretKey } : {}) }, headers: authHeaders(token) }
    );
}

export async function adminGetProducts(token: string) {
    return apiRequest<{ success: boolean; count: number; data: Product[] }>("/admin/products", {
        headers: authHeaders(token),
    });
}

export async function adminCreateProduct(token: string, data: Partial<Product>) {
    return apiRequest<{ success: boolean; data: Product }>("/admin/products", {
        method: "POST",
        body: data,
        headers: authHeaders(token),
    });
}

export async function adminUpdateProduct(token: string, id: string, data: Partial<Product>) {
    return apiRequest<{ success: boolean; data: Product }>(`/admin/products/${id}`, {
        method: "PUT",
        body: data,
        headers: authHeaders(token),
    });
}

export async function adminDeleteProduct(token: string, id: string) {
    return apiRequest<{ success: boolean; message: string }>(`/admin/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
}

export async function adminGetRequirements(token: string, date: string) {
    return apiRequest<{ success: boolean; data: RequirementsData }>(
        `/admin/requirements?date=${date}`,
        { headers: authHeaders(token) }
    );
}

export async function adminGetClients(token: string) {
    return apiRequest<{ success: boolean; count: number; data: Client[] }>("/admin/clients", {
        headers: authHeaders(token),
    });
}

export async function adminGetClientOrders(token: string, phone: string) {
    return apiRequest<{ success: boolean; count: number; data: Order[] }>(
        `/admin/clients/${phone}/orders`,
        { headers: authHeaders(token) }
    );
}
