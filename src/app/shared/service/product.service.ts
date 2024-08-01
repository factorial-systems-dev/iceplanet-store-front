import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Category, Product, Products} from "../model/product.model";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const PRODUCT_URL = environment.base_url + '/product';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private categories: string[]  = [];

    constructor(private http: HttpClient) {}

    public getProducts(page: number = 1, size: number = 20,
                       sort = 'ascending'): Observable<Products> {

        const params: { size: number; sort: string; page: number; category?: string } =  {size, sort, page};
        return this.http.get<Products>(PRODUCT_URL, {
            params
        });
    }

    public getProductById(id: string): Observable<Product> {
        return this.http.get<{product: Product}>(`${PRODUCT_URL}/${id}`).pipe(
            map(p => p.product)
        );
    }

    public addCategoryToProduct(category: string):Observable<Products> {
        if (this.categories.indexOf(category) === -1) {
            this.categories.push(category);
        }

        if (this.categories.length === 0) {
            return this.getProducts();
        }

        return this.http.get<Products>(`${PRODUCT_URL}/bycategory`, {
            params: {
                category: this.categories.join(',')
            }
        });
    }

    public removeCategoryFromProduct(category: string):Observable<Products> {
        if (this.categories.indexOf(category) !== -1) {
            this.categories.splice(this.categories.indexOf(category), 1);
        }

        if  (this.categories.length === 0) {
           return this.getProducts();
        }

        return this.http.get<Products>(`${PRODUCT_URL}/bycategory`, {
            params: {
                category: this.categories.join(',')
            }
        });
    }


    public search(page: number = 1, size: number = 20, search: string): Observable<Products> {
        const params: { size: number; page: number } =  {size, page};
        return this.http.get<Products>(`${PRODUCT_URL}/search/${search}`, {
            params
        });
    }

    public getProductCategories(): Observable<string[]> {
        return this.http.get<Category>(`${PRODUCT_URL}/categories`).
            pipe(
                map(c => c.categories)
        )
    }
}
