import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {environment} from "../../environments/environment";
import {BackEndUser, User} from "./user.model";
import {SnackbarService} from "../shared/service/snackbar.service";


interface AuthSignUpRequestData {
    email: string;
    fullName: string;
    telephoneNumber: string;
    address: string;
    password: string;
    organization: string;
}

export interface AuthSignUpResponseData {
    status: number;
    message: string;
}

interface AuthSignInRequestData {
    email: string;
    password: string;
}

export interface AuthSignInResponseData {
    access_token: string;
    expiresIn: number;
    scope: string;
    token_type: string;
}

export interface CustomJwtDecoded {
    sub: string;
    iss: string;
    name: string;
    preferred_username: string;
    organization: string;
    imageUrl: string;
    exp: number;
    roles: string[];
}

const SIGNUP_URL = environment.base_url + '/auth/signup';
const SIGNIN_URL = environment.base_url + '/auth/login';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private subject = new BehaviorSubject<User | null>(null);
    public user$ = this.subject.asObservable();
    public user: User;
    private failedReq: string;
    private tokenExpirationTimer: NodeJS.Timer | number | null;

    constructor (
        private http: HttpClient,
        private router: Router,
        private  snackService: SnackbarService) {}

    signup(name: string, email: string, password: string, telephone: string,
           address: string, organization: string): Observable<AuthSignUpResponseData> {

        const signupRequest: AuthSignUpRequestData = {
            email,
            fullName: name,
            password,
            telephoneNumber: telephone,
            address,
            organization
        };

        return this.http.post<AuthSignUpResponseData>(SIGNUP_URL, signupRequest).pipe(
            catchError(err => {
                return this.handleError(err);
            })
        );
    }

    login(email: string, password: string): Observable<AuthSignInResponseData> {
        const signInRequest: AuthSignInRequestData = {email, password};

        const self = this;
        return this.http.post<AuthSignInResponseData>(SIGNIN_URL, signInRequest)
            .pipe(
                catchError(err => {
                    return this.handleError(err);
                }),
                tap(response => {
                    this.handleAuthentication(response, self);
                })
            );
    }

    private handleAuthentication(responseData: AuthSignInResponseData, self: any) {
        const decoded: CustomJwtDecoded = jwtDecode(responseData.access_token);
        const dt = new Date();
        dt.setHours(dt.getHours() + 1);

        const user =
            new User(
                decoded.sub,
                decoded.name,
                decoded.preferred_username,
                decoded.organization,
                decoded.imageUrl,
                responseData.access_token,
                dt
            );

        this.user = user;
        self.subject.next(user);
        self.autoLogout(responseData.expiresIn * 1000);
        this.saveUserToLocalStorage(user);
        this.snackService.message('You have successfully logged in');
    }

    private saveUserToLocalStorage(user: User) {
        localStorage.setItem('userData', JSON.stringify(user ? user : this.user));
    }

    private handleError(errorResponse: HttpErrorResponse) {
        let errorMessage = 'Unknown Error Occurred';

        switch (errorResponse.status) {
            case 400:
                errorMessage = `Bad Request: ${errorResponse.message}`;
                break;

            case 401:
                errorMessage = `Unauthorized error occurred: ${errorResponse.error.message}`;
                break;

            case 409:
                errorMessage = errorResponse.error.message;
                break;

            case 500:
                errorMessage = `Internal Error Authenticating: ${errorResponse.error.message}`;
                break;
        }

        this.snackService.message(errorMessage);

        return throwError(() => {
            const error: any = new Error(errorMessage);
            error.timestamp = Date.now();
            return error;
        });
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
            this.router.navigate(['/']).then(r => {});
        }, expirationDuration);
    }

    autoLogin() {
        const  data = localStorage.getItem('userData');

        if (!data) {
            return;
        }

        const userData = JSON.parse(data);

        if (!userData) {
            return;
        }

        const dt = new Date(userData._tokenExpirationDate);
        const expirationDuration = dt.getTime() - new Date().getTime();

        if (expirationDuration > 5_000) {
            const user: User =
                new User(
                    userData.id,
                    userData.email,
                    userData.fullName,
                    userData.organization,
                    userData.imageUrl,
                    userData._token,
                    dt
                );

            this.autoLogout(expirationDuration);
            this.user = user;
            this.subject.next(user);

            if (this.failedReq) {
                this.router.navigate([this.failedReq]).then(r => {});
            }
        }
    }

    updateUser(firstName: string, lastName: string, telephone: string, address: string): Observable<any> {
        const user = {
            fullName: `${firstName} ${lastName}`,
            telephoneNumber: telephone,
            address
        };

        return this.http.put(environment.base_url + '/auth/update', user);
    }

    changePassword(old_password: string, new_password: string): Observable<any> {
        const data = {
            old_password,
            new_password
        };

        return this.http.put(environment.base_url + '/auth/change-password', data);
    }

    logout() {
        this.subject.next(null);
        localStorage.removeItem('userData');

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer as number);
        }

        this.tokenExpirationTimer = null;
        this.snackService.message('You have successfully logged out');
    }

    reloadUser() {
        this.http.get<BackEndUser>(environment.base_url + '/auth/user').subscribe( u => {
            if (u) {
                const clonedUser = this.user.createNewUserFromSelf(u.imageUrl);
                this.user = clonedUser;
                this.subject.next(clonedUser);
            }
        });
    }

    getUser(): Observable<BackEndUser> {
        return this.http.get<BackEndUser>(environment.base_url + '/auth/user');
    }

    uploadImage(file: File): Observable<any> {
        const data: FormData = new FormData();
        data.append('file', file);

        return this.http.post(`${environment.base_url}/auth/upload-avatar`, data);
    }

    removeImage(): Observable<any> {
        return this.http.delete(environment.base_url + '/auth/delete-avatar');
    }

    setFailedReq(value: string) {
        this.failedReq = value;
    }
}

