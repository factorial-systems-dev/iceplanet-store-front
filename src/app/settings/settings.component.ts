import {Component, OnInit} from '@angular/core';
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
import {throwError} from "rxjs";
import {SnackbarService} from "../shared/service/snackbar.service";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [RouterLink, RouterOutlet, MatCardModule, MatButtonModule, RouterLinkActive, MatMenu, MatMenuItem, MatMenuTrigger, AsyncPipe, NgIf, NgOptimizedImage, FileUploadComponent, FilesAcceptDirective],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

    // isToggled
    isToggled = false;

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
        this.authService.removeImage().subscribe( result => {
            console.log(result);
        });
    }

    ngOnInit(): void {}

    onFileChange($event: Event) {
        const element = $event.target as HTMLInputElement;
        const file = element.files ? element.files[0] : null;


        if (file) {
            this.authService.uploadImage(file).pipe(
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
