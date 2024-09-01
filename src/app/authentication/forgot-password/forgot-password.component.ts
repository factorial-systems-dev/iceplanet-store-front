import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {NgIf} from "@angular/common";
import {SnackbarService} from "../../shared/service/snackbar.service";
import {AuthService} from "../auth.service";
import {BehaviorSubject, finalize, throwError} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

    // isToggled
    isToggled = false;

    public forgotForm: FormGroup;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    private destroyRef = inject(DestroyRef);

    constructor(
        public themeService: CustomizerSettingsService,
        @Inject(FormBuilder) private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackService: SnackbarService,
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onSubmit() {
        if (!this.forgotForm.valid) {
            return this.snackService.message('Please fill all the fields');
        }

        const email = this.forgotForm.value.email;
        this.loadingSubject.next(true);

        this.authService.request_password_reset(email)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.loadingSubject.next(false)
                }),
                catchError((error: HttpErrorResponse) => {
                    const message = 'Error requesting password reset';
                    console.error(message, error);
                    this.snackService.message(message);
                    return throwError(() => new Error(message));
                })
            ).subscribe(results => {
            this.router.navigate(['/authentication']).then(r => {});
            this.snackService.message('Password reset request sent');
        });
    }

    ngOnInit(): void {
        this.forgotForm = this.fb.group({
            email: [null, [Validators.email, Validators.required]],
        });
    }
}
