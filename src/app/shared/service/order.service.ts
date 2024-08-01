import {Injectable} from "@angular/core";
import {CartService} from "./cart.service";
import {Order} from "../model/order.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthService} from "../../authentication/auth.service";
import {PaystackCharge} from "../model/payment.model";
import {SnackbarService} from "./snackbar.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const ORDER_URL = environment.base_url + '/order';
const PAYMENT_URL = environment.base_url + '/payment';
const DEFAULT_EMAIL: string = 'user@factorialsystem.io';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private cartService: CartService,
        private snackbarService: SnackbarService
    ) {}

    saveOrder(instruction: string) {
        const cart = this.cartService.cart;

        const order: Order = {
            cut: cart.cut ? cart.cut : false,
            subtotal: cart.subtotal,
            discount: cart.discount,
            grandTotal: cart.grandTotal,
            items: cart.items.map(item => {
                return {
                    product: item.product,
                    bundle: item.bundle,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    price: item.price,
                    total: item.quantity * item.price
                }
            })
        };

        if (cart.delivery) {
            order.delivery = cart.delivery;
            order.deliveryPrice = cart.deliveryPrice;
        }

        if (cart.instruction) {
            order.instruction = instruction;
        }

        this.http.post<{message: string, order: Order}>(ORDER_URL, order).subscribe({
            next: newOrder => {
                this.initPayment(newOrder.order.grandTotal, newOrder.order._id as string);
            },
            error: err => {
                this.snackbarService.message('Order saving Error (Initialize Payment), Please contact Support');
                console.error(`Error saving order, InitPayment Failed: ${err}`);
                console.error(err);
            }
        });
    }

    getOrders(pageNumber: number = 1, pageSize: number = 20): Observable<Order[]> {
        return this.http.get<Order[]>(`${ORDER_URL}/user`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            }
        });
    }

    getOrderById(id: String): Observable<Order> {
        return this.http.get<{order: Order}>(`${ORDER_URL}/${id}`).pipe(
            map(res => res.order)
        )
    }

    search(pageNumber: number = 1, pageSize: number = 20, searchString: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${ORDER_URL}/user/search`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                search: searchString
            }
        });
    }

    initPayment(amount: number, id: string) {
        // @ts-ignore
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: 'pk_test_94dbaebf2467e2b41e3552f23a093e7e55cbe57e',
            email: this.authService.user ? this.authService.user.email : DEFAULT_EMAIL,
            amount: amount * 100,
            onSuccess: (transaction: PaystackCharge) => {
                this.http.post<{message: string, id: string}>(PAYMENT_URL, {
                    amount: amount * 100,
                    transaction: transaction.transaction,
                    reference: transaction.reference,
                    order: id
                }).subscribe(   {
                    next: (results) => {
                        this.cartService.clearCart();
                        this.snackbarService.message(`Order has been placed successfully id: ${id}`);
                    },
                    error: (err) => {
                        console.error(`Error saving order, InitPayment Failed: ${err}`);
                        this.snackbarService.message('Order saving Error, Please contact Support');
                    }
                });
            },
            onCancel: () => {
                this.http.delete(ORDER_URL + '/cancel/' + id ).subscribe(a=> {
                    this.snackbarService.message('Order has been successfully cancelled');
                });
            }
        });
    }
}
