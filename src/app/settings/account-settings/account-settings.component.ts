import {Component, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {AuthService} from "../../authentication/auth.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {Observable} from "rxjs";
import {BackEndUser} from "../../authentication/user.model";

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FileUploadModule, AsyncPipe, NgIf],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {

    // Select Value
    genderSelected = 'option1';
    public user$: Observable<BackEndUser>


    // File Uploader
    public multiple: boolean = false;

    // isToggled
    isToggled = false;

    constructor(
        private authService: AuthService,
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
    }

}
