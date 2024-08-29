import {Component, DestroyRef, Inject, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {AsyncPipe, NgIf} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {BehaviorSubject, finalize, throwError} from "rxjs";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../authentication/auth.service";
import {SnackbarService} from "../../shared/service/snackbar.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, AsyncPipe, MatProgressSpinner, NgIf, FormsModule, ReactiveFormsModule],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

    // Password Hide
    hide = true;
    hide2 = true;
    hide3 = true;

    // isToggled
    isToggled = false;

    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    private destroyRef = inject(DestroyRef);
    public passwordForm: FormGroup;

    constructor(
        public themeService: CustomizerSettingsService,
        @Inject(FormBuilder) private fb: FormBuilder,
        private authService: AuthService,
        private snackService: SnackbarService,
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    // RTL Mode
    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

    onSubmit() {
        if (this.passwordForm.invalid) {
            return this.snackService.message('Please fill all the fields');
        }

        const currentPassword = this.passwordForm.value.currentPassword;
        const newPassword = this.passwordForm.value.newPassword;
        const confirmPassword = this.passwordForm.value.confirmPassword;

        if (newPassword !== confirmPassword) {
            return this.snackService.message('Passwords do not match');
        }

        this.loadingSubject.next(true);

        this.authService.changePassword(currentPassword, newPassword).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loadingSubject.next(false)),
            catchError((error: HttpErrorResponse) => {
                const message = 'Error changing password';
                console.error(message, error);
                this.snackService.message(message);
                return throwError(() => new Error(message));
            })
        ).subscribe(results => {
            this.snackService.message('Password changed successfully');
        });

    }

    ngOnInit(): void {
        this.createForm();
    }

    private createForm() {
        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });
    }
}
