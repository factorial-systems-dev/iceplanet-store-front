import {Component, Input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';
import {CartService} from "../../../../shared/service/cart.service";

@Component({
    selector: 'app-quantity-counter',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './quantity-counter.component.html',
    styleUrl: './quantity-counter.component.scss'
})
export class QuantityCounterComponent implements OnInit{

    @Input() initialValue = 1;
    @Input() productId: string;
    @Input() bundleId: string;
    value = 1;

    constructor(
        private cartService: CartService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit() {
        this.value = this.initialValue;
    }

    increment() {
        this.cartService.addItem(this.productId, this.bundleId);
        this.value++;
    }

    decrement() {
        if (this.value > 0) {
            this.cartService.removeItem(this.productId, this.bundleId);
            this.value--;
        }
    }

    // isToggled
    isToggled = false;
}
