import {AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {Component, DestroyRef, inject, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {StarRatingComponent} from './star-rating/star-rating.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CustomizerSettingsService} from '../../../customizer-settings/customizer-settings.service';
import {ProductService} from "../../../shared/service/product.service";
import {BehaviorSubject, Observable} from "rxjs";
import {Product} from "../../../shared/model/product.model";
import {AuthService} from "../../../authentication/auth.service";
import {MatOption} from "@angular/material/core";
import {MatSelect, MatSelectChange} from "@angular/material/select";
import {tap} from "rxjs/operators";
import {CartService} from "../../../shared/service/cart.service";
import {ReviewService} from "../../../shared/service/review.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { Reviews} from "../../../shared/model/review.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-e-product-details',
    standalone: true,
    imports: [
        RouterLink,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        CarouselModule,
        NgFor, NgClass,
        FormsModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        StarRatingComponent,
        MatProgressBarModule, AsyncPipe, NgIf, CurrencyPipe, MatOption, MatSelect, ReactiveFormsModule
    ],
    templateUrl: './e-product-details.component.html',
    styleUrl: './e-product-details.component.scss'
})
export class EProductDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('bundle') select: MatSelect;
    //@ViewChild('text') text: HTMLTextAreaElement;

    private id: string;
    private product: Product;
    public bundle_price: number;
    public product$: Observable<Product>;
    public ratingForm: FormGroup;

    private reviewSubject: BehaviorSubject<Reviews | null> = new BehaviorSubject<Reviews | null>(null)
    public reviews$ = this.reviewSubject.asObservable();

    private destroyRef = inject(DestroyRef);

    // Star Rating
    selectedRating: number = 2;
    textValue = '';

    // isToggled
    isToggled = false;

    // Product Images
    productImages = [
        {
            url: 'images/products/product-details1.jpg'
        },
        {
            url: 'images/products/product-details1.jpg'
        },
        {
            url: 'images/products/product-details1.jpg'
        },
        {
            url: 'images/products/product-details1.jpg'
        }
    ]
    selectedImage: string;

    constructor(
        public themeService: CustomizerSettingsService,
        @Inject(FormBuilder) private fb: FormBuilder,
        public authService: AuthService,
        private route: ActivatedRoute,
        private cartService: CartService,
        private reviewService: ReviewService,
        private snackBar: MatSnackBar,
        private productService: ProductService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.id = <string>this.route.snapshot.paramMap.get('id');
        this.reviewService.getReviewsByProductId(this.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(r => this.reviewSubject.next(r));


        this.product$ = this.productService.getProductById(this.id).pipe(
            tap(product => {
                this.product = product;
                this.bundle_price = product.bundles[0].price;
            })
        );

        this.ratingForm = this.fb.group({
            rating: ['', Validators.required],
        });
    }

    ngOnDestroy(): void {
        this.reviewSubject.complete();
    }

    // Input Counter
    value = 1;

    increment() {
        const b = this.product.bundles.find(bundle => bundle._id === this.select.value);

        if (b) {
            this.cartService.addItem(this.id, b._id);
            this.value++;
        }

    }

    decrement() {
        const b = this.product.bundles.find(bundle => bundle._id === this.select.value);

        if (b && this.value > 1) {
            this.cartService.removeItem(this.id, b._id);
            this.value--;
        }
    }

    changeimage(image: string) {
        this.selectedImage = image;
    }

    onSelectChange($event: MatSelectChange) {
        const b = this.product.bundles.find(bundle => bundle._id === this.select.value);

        if (b) {
            this.bundle_price = b.price;
        }
    }

    addToCart() {
        const b = this.product.bundles.find(bundle => bundle._id === this.select.value);

        if (b) {
            this.cartService.addItem(this.id, b._id);
        }
    }

    onSubmitPost() {
        const rating = this.ratingForm.value.rating;

        if (rating === '' || rating.trim().length === 0) {
            this.snackBar.open('Review is required', 'Close', {
                duration: 5000,
            });

            return;
        }

        this.reviewService.createReview({
            rating: this.selectedRating,
            review: rating,
            product: this.id,
        }).subscribe(() => {
           this.ratingForm.patchValue({
               rating: ''
           });
            this.selectedRating = 2;
            this.snackBar.open('Review submitted', 'Close', {
                duration: 5000,
            });

            this.reviewService.getReviewsByProductId(this.id)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(r => this.reviewSubject.next(r));
        })
    }
}
