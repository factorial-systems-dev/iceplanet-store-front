import {Component} from '@angular/core';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {MatExpansionModule} from '@angular/material/expansion';
import {Router, RouterLink, RouterLinkActive, RouterModule} from '@angular/router';
import {ToggleService} from './toggle.service';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {CustomizerSettingsService} from '../../customizer-settings/customizer-settings.service';
import {AuthService} from "../../authentication/auth.service";

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [NgScrollbarModule, MatExpansionModule, RouterLinkActive, RouterModule, RouterLink, NgClass, AsyncPipe, NgIf],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    constructor(
        private router: Router,
        public authService: AuthService,
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService
    ) {
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Mat Expansion
    panelOpenState = false;

    logout() {
        this.authService.logout();
        this.router.navigate(['/']).then(r => r);
    }
}
