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

export type Order = {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDateTime: string;
    items: OrderItem[];
    subtotal: number;
    status: string;
    cancelledBy: string | null;
    whatsappSent: boolean;
    notes: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateOrderPayload = {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDateTime?: string;
    notes?: string;
    items: {
        productId: string;
        variant: string;
        quantity: number;
    }[];
};
