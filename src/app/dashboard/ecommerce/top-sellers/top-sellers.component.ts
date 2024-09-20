import {Component, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import {ProductService} from "../../../shared/service/product.service";
import {Products} from "../../../shared/model/product.model";
import {Observable} from "rxjs";
import {AsyncPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-top-sellers',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, NgIf, AsyncPipe, NgForOf, NgOptimizedImage],
    templateUrl: './top-sellers.component.html',
    styleUrl: './top-sellers.component.scss'
})
export class TopSellersComponent implements OnInit {
    products$: Observable<Products>;

    // isToggled
    isToggled = false;

    constructor(
        private productService: ProductService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.products$ = this.productService.getTopSellingProducts();
    }
}
