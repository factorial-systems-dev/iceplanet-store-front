import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CustomizerSettingsService } from '../customizer-settings/customizer-settings.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {AuthService} from "../authentication/auth.service";
import {AsyncPipe, NgIf, NgOptimizedImage} from "@angular/common";
import {FilesAcceptDirective, FileUploadComponent} from "@iplab/ngx-file-upload";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {BehaviorSubject, finalize, throwError} from "rxjs";
import {SnackbarService} from "../shared/service/snackbar.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        RouterLink,
        RouterOutlet,
        MatCardModule,
        MatButtonModule,
        RouterLinkActive,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        AsyncPipe,
        NgIf,
        NgOptimizedImage,
        FileUploadComponent,
        FilesAcceptDirective,
        MatProgressSpinner
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

    // isToggled
    isToggled = false;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    private destroyRef = inject(DestroyRef);

    constructor(
        public authService: AuthService,
        private snackbarservice: SnackbarService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    removePhoto() {
        this.loadingSubject.next(true);
        this.authService.removeImage().pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => { this.loadingSubject.next(false) }),
            catchError((error: HttpErrorResponse) => {
                const message = 'Error removing Image';
                this.snackbarservice.message(message);
                return throwError(() => new Error(message));
            })
        ).subscribe( result => {
            this.snackbarservice.message('Image removed successfully');
            this.authService.reloadUser();
        });
    }

    ngOnInit(): void {}

    onFileChange($event: Event) {
        const element = $event.target as HTMLInputElement;
        const file = element.files ? element.files[0] : null;

        if (file) {
            this.loadingSubject.next(true);
            this.authService.uploadImage(file).pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => { this.loadingSubject.next(false) }),
                catchError((error: HttpErrorResponse) => {
                    const message = 'Error uploading file make sure it is an image file and not larger than 2MB';
                    this.snackbarservice.message(message);
                    return throwError(() => new Error(message));
                })
            ).subscribe( result => {
                this.snackbarservice.message('Image uploaded successfully');
                this.authService.reloadUser();
            });
        }
    }
}
