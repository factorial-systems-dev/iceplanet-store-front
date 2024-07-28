// Description: Interface for product model.
export interface Bundle {
    _id: string;
    unit: string;
    price: number;
    enabled: boolean;
}

export interface Product {
    _id: string;
    name: string;
    category: string;
    description: string;
    imagePath: string;
    bundles: Bundle[];
}

export interface Products {
    current: number;
    current_size: number;
    pages: number;
    count: number;
    size: number;
    products: Product[];
}

export interface Category {
    categories: string[];
}
