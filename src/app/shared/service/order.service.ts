import {Injectable} from "@angular/core";
import {CartService} from "./cart.service";
import {Order, OrderStatistics} from "../model/order.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthService} from "../../authentication/auth.service";
import {PaystackCharge} from "../model/payment.model";
import {SnackbarService} from "./snackbar.service";
import {Observable, pipe} from "rxjs";
import {map, tap} from "rxjs/operators";

const ORDER_URL = environment.base_url + '/order';
const PAYMENT_URL = environment.base_url + '/payment';
const DEFAULT_EMAIL: string = 'user@factorialsystem.io';
const Months: string[] = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
];
const data_points_array = [
    {x: 'Jan', y: 0},
    {x: 'Feb', y: 0},
    {x: 'Mar', y: 0},
    {x: 'Apr', y: 0},
    {x: 'May', y: 0},
    {x: 'Jun', y: 0},
    {x: 'Jul', y: 0},
    {x: 'Aug', y: 0},
    {x: 'Sep', y: 0},
    {x: 'Oct', y: 0},
    {x: 'Nov', y: 0},
    {x: 'Dec', y: 0}
];

const data_points = [
    0,0,0,0,0,0,0,0,0,0,0,0
]


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

    getOrderStatistics(): Observable<OrderStatistics>  {
        return this.http.get<{aggregate:OrderStatistics[]}>(`${ORDER_URL}/aggregates/count`).pipe(
            map(o => o.aggregate[0])
        );
    }

    getOrderMonthly(year: string): Observable<number[]> {
        return this.http.get<{ aggregate: OrderStatistics[] }>(`${ORDER_URL}/aggregates/monthly`, {
            params: {
                year: year
            }
        }).pipe (
            tap(ot => {
                ot.aggregate.forEach((value, index) => {
                    data_points[parseInt(value._id)] =  value.total;
                });
            }),
            map(o => data_points)
        );
    }

    getOrderStatuses(): Observable<{_id: string,  count: number}[]> {
        return this.http.get<{aggregate:{_id: string,  count: number}[]}>(`${ORDER_URL}/aggregates/status`)
            .pipe(
                map(a => a.aggregate)
            );
    }

    initPayment(amount: number, id: string) {
        // @ts-ignore
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: environment.paystack_key,
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
