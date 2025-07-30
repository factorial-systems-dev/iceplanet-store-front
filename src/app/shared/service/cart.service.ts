import {Injectable} from "@angular/core";
import {Cart} from "../model/cart.model";
import {ProductService} from "./product.service";
import {BehaviorSubject} from "rxjs";
import {DeliveryZone} from "../model/delivery-zone.model";

@Injectable({
    providedIn: 'root'
})
export class CartService {
    public cart: Cart = { grandTotal:0, subtotal:0, discount:0, deliveryPrice:0, cut: false, items:[] };
    private cartSubject = new BehaviorSubject<Cart>(this.cart);
    private countSubject = new BehaviorSubject<number>(0);
    public cart$ = this.cartSubject.asObservable();
    public count$ = this.countSubject.asObservable();

    constructor(private productService: ProductService) {
        // const cart = localStorage.getItem('cart');
        // if (cart) {
        //     this.cart = JSON.parse(cart);
        //     this.cartSubject.next(this.cart);
        // }
    }

    clearCart() {
        this.cart = { grandTotal:0, subtotal:0, discount:0, deliveryPrice:0, cut: false, items:[] };
        this.cartSubject.next(this.cart);
        this.countSubject.next(0);
        // localStorage.removeItem('cart');
    }

    addItem(productId: string, bundleId: string) {
        const item = this.cart.items.find(item => item.product === productId && item.bundle === bundleId);
        if (item) {
            item.quantity++;
            this.recalculateCart();
        } else {
            this.productService.getProductById(productId).subscribe(product => {
                const bundle = product.bundles.find(bundle => bundle._id === bundleId);

                if (bundle) {
                    this.cart.items.push({
                        product: productId,
                        image: product.imagePath,
                        bundle: bundleId,
                        unit: bundle.unit,
                        quantity: 1,
                        price: bundle.price,
                        name: product.name,
                        total: bundle.price
                    });

                    this.recalculateCart();
                }
            });
        }
    }

    removeItem(productId: string, bundleId: string) {
        const item = this.cart.items.find(item => item.product === productId && item.bundle === bundleId);
        if (item) {
            item.quantity--;
            if (item.quantity === 0) {
                this.cart.items = this.cart.items.filter(item => item.product !== productId && item.bundle !== bundleId);
            }

            this.recalculateCart();
        }
    }

    addCut(status: boolean) {
        this.cart.cut = status;
        // localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addDelivery(zone: DeliveryZone) {
        this.cart.deliveryPrice = zone.price;
        this.cart.delivery = zone.id;
        this.recalculateCart();
    }

    removeDelivery() {
        this.cart.deliveryPrice = 0;
        this.cart.delivery = null;
        this.recalculateCart();
    }

    private recalculateCart() {
        const subtotal = this.cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        this.cart.subtotal = subtotal;
        this.cart.grandTotal = subtotal + this.cart.deliveryPrice - ((this.cart.discount / 100) * subtotal);

        this.countSubject.next(this.cart.items.length);
        this.cartSubject.next(this.cart);
        // localStorage.setItem('cart', JSON.stringify(this.cart));
    }
}
