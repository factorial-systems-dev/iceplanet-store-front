import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {Review, Reviews} from "../model/review.model";

const REVIEW_URL = environment.base_url + '/review';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {

    constructor(private http: HttpClient) {}

    getReviewsByProductId(productId: string): Observable<Reviews> {
        return this.http.get<Reviews>(`${REVIEW_URL}/product/${productId}`);
    }

    getReviewsByUserId(userId: string): Observable<Review[]> {
        return this.http.get<Review[]>(`${REVIEW_URL}/user/${userId}`);
    }

    getReviewById(id: string): Observable<Review> {
        return this.http.get<Review>(`${REVIEW_URL}/${id}`);
    }
     createReview(review: Partial<Review>): Observable<any> {
        return this.http.post(REVIEW_URL, review);
     }
}
