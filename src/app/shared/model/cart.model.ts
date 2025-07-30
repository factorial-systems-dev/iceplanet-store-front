export interface Cart {
    delivery?: string | null
    instruction?: string;
    cut?: boolean;
    deliveryPrice: number;
    discount: number;
    subtotal: number;
    grandTotal: number;
    items: {
        product: string;
        image: string;
        bundle: string;
        quantity: number;
        name: string;
        unit: string;
        price: number;
        total: number;
    }[];
}
