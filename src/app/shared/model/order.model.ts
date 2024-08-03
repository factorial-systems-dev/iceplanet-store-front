
export interface OrderItem {
    _id?: string;
    product: string;
    bundle: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
}

export interface Order {
    _id?: string;
    delivery?: string;
    subtotal: number;
    discount: number;
    grandTotal: number;
    instruction?: string;
    cut: boolean;
    status?: string;
    deliveryPrice?: number;
    deliveryAddress?: string;
    date?: Date;
    user?: {
        email?: string;
        fullName?: string;
        address?: string;
        telephoneNumber?: string;
    }
    items: OrderItem[];
}

export interface OrderStatistics {
    _id: string;
    count: number;
    total: number;
}
