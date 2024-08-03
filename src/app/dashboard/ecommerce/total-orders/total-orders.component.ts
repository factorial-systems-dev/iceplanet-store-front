import {Component, OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import {OrderService} from "../../../shared/service/order.service";
import {Observable} from "rxjs";
import {OrderStatistics} from "../../../shared/model/order.model";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
    selector: 'app-total-orders',
    standalone: true,
    imports: [MatCardModule, RouterLink, AsyncPipe, NgIf],
    templateUrl: './total-orders.component.html',
    styleUrl: './total-orders.component.scss'
})
export class TotalOrdersComponent implements OnInit {
    public statistics$: Observable<OrderStatistics>;
    constructor(private orderService: OrderService) {}

    ngOnInit(): void {
        this.statistics$ = this.orderService.getOrderStatistics();
    }
}
