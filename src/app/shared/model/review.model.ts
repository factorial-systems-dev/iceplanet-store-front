export interface Review {
    _id: string;
    rating: number;
    review: string;
    user: string;
    userName: string;
    product: string;
    date: Date
}

export interface Reviews {
    current: number;
    pages: number;
    reviews: Review[];
}
