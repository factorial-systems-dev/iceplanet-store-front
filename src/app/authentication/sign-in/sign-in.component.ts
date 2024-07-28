import {Component, OnDestroy} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import {SnackbarService} from "../../shared/service/snackbar.service";
import {AuthService} from "../auth.service";
import {Subscription} from "rxjs";
import {tap} from "rxjs/operators";

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnDestroy {
    private subscription: Subscription;

    // Password Hide
    hide = true;

    // Form
    authForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackbarService: SnackbarService,
        private authService: AuthService
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
        });
    }

    onSubmit() {
        if (this.authForm.valid) {
            const email = this.authForm.value.email;
            const password = this.authForm.value.password;
            this.subscription = this.authService.login(email, password)
                .pipe(
                    tap(() => this.router.navigate(['/']))
                ).subscribe();
        } else {
            this.snackbarService.message('Invalid email or password', );
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe()
        }
    }
}
