export interface DeliveryZone {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    price: number;
}

export interface DeliveryZones {
    pages: number;
    current: number
    zones: DeliveryZone[];
}
