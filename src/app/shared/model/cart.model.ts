export interface Cart {
    delivery?: string;
    instruction?: string;
    cut?: boolean;
    deliveryPrice: number;
    discount: number;
    subtotal: number;
    grandTotal: number;
    items: {
        product: string;
        bundle: string;
        quantity: number;
        name: string;
        unit: string;
        price: number;
        total: number;
    }[];
}
