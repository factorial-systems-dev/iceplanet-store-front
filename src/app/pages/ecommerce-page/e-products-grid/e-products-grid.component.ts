import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import {CurrencyPipe} from "@angular/common";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";

@Component({
    selector: 'app-e-products-grid',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatCheckboxModule, MatSliderModule, FormsModule, MatButtonModule, MatIconModule, CurrencyPipe, MatSelectModule],
    templateUrl: './e-products-grid.component.html',
    styleUrl: './e-products-grid.component.scss'
})
export class EProductsGridComponent {
    // isToggled
    isToggled = false;
    foods  = [
        {value: 'Kg', viewValue: 'Kg'},
        {value: 'Carton', viewValue: 'Carton'}
    ];

    constructor(public themeService: CustomizerSettingsService) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onWishList() {
        console.log('WishList');
    }
}
