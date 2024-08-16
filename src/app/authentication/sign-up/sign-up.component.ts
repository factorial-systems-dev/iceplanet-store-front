import {Component, DestroyRef, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {tap} from "rxjs/operators";
import {SnackbarService} from "../../shared/service/snackbar.service";
import {AuthService} from "../auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

    // isToggled
    hide = true;
    isToggled = false;
    authForm: FormGroup;
    private destroyRef = inject(DestroyRef);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private snackService: SnackbarService,
        private snackbarService: SnackbarService,
        public themeService: CustomizerSettingsService
    ) {
        this.authForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.minLength(8), Validators.required]],
            address: ['', [Validators.required, Validators.minLength(16)]],
            telephone: ['', Validators.required],
            organisation: ['']
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }


    onSubmit() {
        if (this.authForm.valid) {
            const name = this.authForm.value.name;
            const email = this.authForm.value.email;
            const password = this.authForm.value.password;
            const address = this.authForm.value.address;
            const telephone = this.authForm.value.telephone;
            const organization = this.authForm.value.organization;

            this.authService.signup(name, email, password, address, telephone, organization)
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    tap(() => this.router.navigate(['/authentication']))
                ).subscribe(results => {
                    this.snackService.message('Sign up successful, verification sent to your email.');
            });
        } else {
            this.snackbarService.message('Form is invalid. Please check the fields.');
        }
    }
}
