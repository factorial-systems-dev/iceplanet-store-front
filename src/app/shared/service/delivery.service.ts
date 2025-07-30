import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {DeliveryZone, DeliveryZones} from "../model/delivery-zone.model";
import {map} from "rxjs/operators";

const ZONE_URL = environment.base_url + '/zone';

@Injectable({
    providedIn: 'root'
})
export class DeliveryService {
    private zoneSubject = new BehaviorSubject<DeliveryZone[]>([]);
    public zones$ = this.zoneSubject.asObservable();

    constructor(private http: HttpClient) {
        this.http.get<DeliveryZones>(ZONE_URL)
            .pipe(map(z => z.zones))
            .subscribe(zones => {
                const noZone: DeliveryZone = {
                    id: '0',
                    name: 'No Delivery',
                    description: '',
                    enabled: true,
                    price: 0
                };
                this.zoneSubject.next([noZone, ...zones]);

            });
    }
}
