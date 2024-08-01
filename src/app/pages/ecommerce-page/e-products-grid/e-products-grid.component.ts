import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {RouterLink} from '@angular/router';
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CustomizerSettingsService} from '../../../customizer-settings/customizer-settings.service';
import {AsyncPipe, CurrencyPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatSelectChange, MatSelectModule} from "@angular/material/select";
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    fromEvent,
    Observable,
    Subscription,
    switchMap
} from "rxjs";
import {ProductService} from "../../../shared/service/product.service";
import {Products} from "../../../shared/model/product.model";
import {map, tap} from "rxjs/operators";
import {CartService} from "../../../shared/service/cart.service";

@Component({
    selector: 'app-e-products-grid',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatCheckboxModule, MatSliderModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, AsyncPipe, NgForOf, NgIf, NgOptimizedImage, CurrencyPipe, NgClass],
    templateUrl: './e-products-grid.component.html',
    styleUrl: './e-products-grid.component.scss'
})
export class EProductsGridComponent implements OnInit, OnDestroy, AfterViewInit {
    private pageSize = 20;
    products$: Observable<Products>;
    categories$: Observable<string[]>;
    subject = new BehaviorSubject(0);

    private eventSubscription: Subscription;
    @ViewChild('input') input: ElementRef;

    // isToggled
    isToggled = false;

    constructor(private productService: ProductService,
                private cartService: CartService,
                public themeService: CustomizerSettingsService) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.categories$ = this.productService.getProductCategories();
        this.getObservable(1);
    }

    ngAfterViewInit(): void {
        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }

        this.eventSubscription = fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => {
                    if (this.input.nativeElement.value && this.input.nativeElement.value.length > 0) {
                        this.products$ = this.subject.asObservable().pipe(
                            switchMap(() => this.productService.search(1, 20, this.input.nativeElement.value))
                        );
                    } else {
                        this.products$ = this.subject.asObservable().pipe(
                            switchMap(() => this.productService.getProducts())
                        );
                    }
                })
            ).subscribe();
    }

    refreshPage(i: number) {
        this.getObservable(i);
    }

    getObservable(page: number): void {
        this.products$ = this.subject.asObservable().pipe(
            switchMap(() => this.productService.getProducts(page, this.pageSize))
        );
    }

    onCategoryMatChange($event: MatCheckboxChange, category: string) {
        if ($event.checked) {
            this.products$ = this.subject.asObservable().pipe(
                switchMap(() => this.productService.addCategoryToProduct(category))
            );
        } else {
            this.products$ = this.subject.asObservable().pipe(
                switchMap(() => this.productService.removeCategoryFromProduct(category))
            );
        }
    }

    ngOnDestroy(): void {
    }

    addToCart($event: MouseEvent, id: string) {
        // @ts-ignore
        const bundleId = document.getElementById(id + '-hidden').value;
        this.cartService.addItem(id,  bundleId);
    }

    onSelectChange($event: MatSelectChange, _id: string) {
        // @ts-ignore
        const element: HTMLSpanElement = document.getElementById(_id);
        // @ts-ignore
        const innerHidden: HTMLInputElement = document.getElementById(_id + '-hidden');

        this.products$.pipe(
            map(p => {
                const product = p.products.find(p => p._id === _id);
                if (product) {
                    const bundle = product.bundles.find(b => b._id === $event.value);
                    if (bundle) {
                        return bundle;
                    }
                }
                return {_id: 0, price: 0};
            })
        ).subscribe(b => {
            element.innerText = `₦${new Intl.NumberFormat().format(b.price)}`;
            innerHidden.value = <string>b._id;
        });
    }

    protected readonly Number = Number;
}
