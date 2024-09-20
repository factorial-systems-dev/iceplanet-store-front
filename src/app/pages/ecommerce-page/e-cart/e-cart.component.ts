import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {QuantityCounterComponent} from './quantity-counter/quantity-counter.component';
import {CustomizerSettingsService} from '../../../customizer-settings/customizer-settings.service';
import {MatOption} from "@angular/material/core";
import {MatSelect, MatSelectChange} from "@angular/material/select";
import {CartService} from "../../../shared/service/cart.service";
import {AsyncPipe, CurrencyPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {DeliveryService} from "../../../shared/service/delivery.service";
import {OrderService} from "../../../shared/service/order.service";
import {AuthService} from "../../../authentication/auth.service";
import {MatCheckboxChange, MatCheckboxModule} from "@angular/material/checkbox";

declare function PaystackPop(): any;

@Component({
    selector: 'app-e-cart',
    standalone: true,
    imports: [
        MatCardModule, MatMenuModule, MatButtonModule, RouterLink,
        MatFormFieldModule, MatInputModule, FormsModule, QuantityCounterComponent,
        MatOption, MatSelect, NgForOf, AsyncPipe, CurrencyPipe, NgIf,
        MatCheckboxModule, ReactiveFormsModule, NgOptimizedImage
    ],
    templateUrl: './e-cart.component.html',
    styleUrl: './e-cart.component.scss'
})
export class ECartComponent implements OnInit {
    // isToggled
    isToggled = false;
    public orderForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private orderService: OrderService,
        public authService: AuthService,
        public cartService: CartService,
        public deliveryService: DeliveryService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.createForm();
    }

    onChange($event: MatSelectChange) {
        this.deliveryService.zones$.subscribe(zones => {
            const zone = zones.find(z => z.id === $event.value);

            if (zone) {
                this.cartService.addDelivery(zone);
            }
        });
    }

    onCheckBoxChange($event: MatCheckboxChange) {
        this.cartService.addCut($event.checked);
    }

    onSubmit(orderForm: FormGroup) {
        const instruction = orderForm.value.instruction;
        this.orderService.saveOrder(instruction);
    }

    private createForm() {
        this.orderForm = this.fb.group({
            instruction: [null],
        });
    }

    protected readonly Number = Number;
}
