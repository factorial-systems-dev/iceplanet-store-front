import { Component } from '@angular/core';
import { TotalSalesComponent } from './total-sales/total-sales.component';
import { TotalRevenueComponent } from './total-revenue/total-revenue.component';
import { TotalOrdersComponent } from './total-orders/total-orders.component';
import { TopSellersComponent } from './top-sellers/top-sellers.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { RouterLink } from '@angular/router';
import {EOrdersComponent} from "../../pages/ecommerce-page/e-orders/e-orders.component";

@Component({
    selector: 'app-ecommerce',
    standalone: true,
    imports: [TotalSalesComponent, TotalRevenueComponent, TotalOrdersComponent, TopSellersComponent, OrderSummaryComponent, RouterLink, EOrdersComponent],
    templateUrl: './ecommerce.component.html',
    styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent {}
