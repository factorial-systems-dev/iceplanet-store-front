import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {RouterLink} from '@angular/router';
import {FileUploadModule} from '@iplab/ngx-file-upload';
import {CustomizerSettingsService} from '../../customizer-settings/customizer-settings.service';
import {AuthService} from "../../authentication/auth.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {BehaviorSubject, finalize, Observable, throwError} from "rxjs";
import {BackEndUser} from "../../authentication/user.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SnackbarService} from "../../shared/service/snackbar.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FileUploadModule, AsyncPipe, NgIf, ReactiveFormsModule, MatProgressSpinner],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {
    public settingsForm: FormGroup;

    // Select Value
    genderSelected = 'option1';
    public user$: Observable<BackEndUser>


    // File Uploader
    public multiple: boolean = false;

    // isToggled
    isToggled = false;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    private destroyRef = inject(DestroyRef);

    constructor(
        @Inject(FormBuilder) private fb: FormBuilder,
        private snackbarservice: SnackbarService,
        private authService: AuthService,
        private snackService: SnackbarService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    // RTL Mode
    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

    ngOnInit(): void {
        this.user$ = this.authService.getUser();
        this.createForm();
    }

    private createForm() {
        this.user$.pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(user => {
            this.settingsForm = this.fb.group({
                firstName: [user.fullName.split(' ')[0], Validators.required],
                lastName: [user.fullName.split(' ')![1], Validators.required],
                email: [user.email, [Validators.email, Validators.required]],
                telephone: [user.telephoneNumber, Validators.required],
                address: [user.address, Validators.required],
            });
        })

    }

    onSubmit() {
        const firstName = this.settingsForm.value.firstName;
        const lastName = this.settingsForm.value.lastName;
        const telephone = this.settingsForm.value.telephone;
        const address = this.settingsForm.value.address;

        this.loadingSubject.next(true);

        this.authService.updateUser(firstName, lastName, telephone, address)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.loadingSubject.next(false)
                }),
                catchError((error: HttpErrorResponse) => {
                    const message = 'Error updating profile';
                    console.error(message, error);
                    this.snackbarservice.message(message);
                    return throwError(() => new Error(message));
                })
            ).subscribe(results => {
            this.snackService.message('Account settings updated successfully');
            this.authService.reloadUser();
        });
    }
}
