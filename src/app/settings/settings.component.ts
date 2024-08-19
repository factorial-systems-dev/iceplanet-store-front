import {Component, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CustomizerSettingsService } from '../customizer-settings/customizer-settings.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {AuthService} from "../authentication/auth.service";
import {AsyncPipe, NgIf, NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [RouterLink, RouterOutlet, MatCardModule, MatButtonModule, RouterLinkActive, MatMenu, MatMenuItem, MatMenuTrigger, AsyncPipe, NgIf, NgOptimizedImage],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

    // isToggled
    isToggled = false;

    constructor(
        public authService: AuthService,
        public themeService: CustomizerSettingsService
    ) {
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    uploadPhoto() {

    }

    removePhoto() {

    }

    ngOnInit(): void {
    }
}
