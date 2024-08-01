import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {exhaustMap, take} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {AuthService} from "./auth.service";


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = req.url.substring(0, environment.base_url.length);

        if (url !== environment.base_url) {
            return next.handle(req);
        }

        return this.authService.user$.pipe(
            take(1),
            exhaustMap(user => {

                if (!user) {
                    return next.handle(req);
                }

                const headerSettings: { [name: string]: string | string[]; } = {};
                headerSettings['Authorization'] = 'Bearer ' + user.token;

                const newHeader = new HttpHeaders(headerSettings);
                const authReq = req.clone({headers: newHeader});

                return next.handle(authReq);
            })
        );
    }
}
