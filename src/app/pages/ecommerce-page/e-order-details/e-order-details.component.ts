import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import {OrderService} from "../../../shared/service/order.service";
import {Order, OrderItem} from "../../../shared/model/order.model";
import {BehaviorSubject, Subscription} from "rxjs";
import {AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgIf} from "@angular/common";
import {tap} from "rxjs/operators";

@Component({
    selector: 'app-e-order-details',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule, AsyncPipe, NgIf, CurrencyPipe, DatePipe, NgClass],
    templateUrl: './e-order-details.component.html',
    styleUrl: './e-order-details.component.scss'
})
export class EOrderDetailsComponent implements OnInit, OnDestroy {
    private id: string;
    private subscription: Subscription;

    // @ts-ignore
    private orderSubject = new BehaviorSubject<Order>(null);
    public order$ = this.orderSubject.asObservable();

    displayedColumns: string[] = ['product', 'unit', 'quantity', 'price'];
    dataSource: MatTableDataSource<OrderItem>;

    // isToggled
    isToggled = false;

    constructor(
        private route: ActivatedRoute,
        private orderService: OrderService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.id = <string>this.route.snapshot.paramMap.get('id');
        this.subscription = this.orderService.getOrderById(this.id).subscribe(o => {
            this.dataSource = new MatTableDataSource(o.items);
            this.orderSubject.next(o);
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.orderSubject.complete();
    }
}
