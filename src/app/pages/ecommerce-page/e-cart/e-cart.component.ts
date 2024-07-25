import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {Router, RouterLink} from '@angular/router';
import { QuantityCounterComponent } from './quantity-counter/quantity-counter.component';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";

declare function PaystackPop(): any;

@Component({
    selector: 'app-e-cart',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatFormFieldModule, MatInputModule, FormsModule, QuantityCounterComponent, MatOption, MatSelect],
    templateUrl: './e-cart.component.html',
    styleUrl: './e-cart.component.scss'
})
export class ECartComponent {

    // isToggled
    isToggled = false;
    destinations = [
        {value: 0, name: 'No Delivery'},
        {value: 2500, name: 'Ajah'},
        {value: 3500, name: 'Lekki-1'}
    ];

    constructor(
        private router: Router,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onCheckout() {
        // @ts-ignore
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: 'pk_test_94dbaebf2467e2b41e3552f23a093e7e55cbe57e',
            email: 'example@email.com',
            amount: 10000,
            onSuccess: (transaction: any) => {
               console.log(transaction);
            },
            onCancel: () => {
                console.log('Transaction was cancelled');
            }
        });
    }
}
