import { Component } from '@angular/core';
import { TotalSalesComponent } from './total-sales/total-sales.component';
import { TotalRevenueComponent } from './total-revenue/total-revenue.component';
import { TotalCustomersComponent } from './total-customers/total-customers.component';
import { TotalOrdersComponent } from './total-orders/total-orders.component';
import { TopSellingProductsComponent } from './top-selling-products/top-selling-products.component';
import { TransactionsHistoryComponent } from './transactions-history/transactions-history.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';
import { TopSellersComponent } from './top-sellers/top-sellers.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { RouterLink } from '@angular/router';
import {EOrdersComponent} from "../../pages/ecommerce-page/e-orders/e-orders.component";

@Component({
    selector: 'app-ecommerce',
    standalone: true,
    imports: [TotalSalesComponent, TotalRevenueComponent, TotalOrdersComponent, TotalCustomersComponent, TopSellingProductsComponent, TransactionsHistoryComponent, RecentOrdersComponent, TopSellersComponent, OrderSummaryComponent, RouterLink, EOrdersComponent],
    templateUrl: './ecommerce.component.html',
    styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent {}
