import { Routes } from '@angular/router';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { EcommerceComponent } from './dashboard/ecommerce/ecommerce.component';
import { InternalErrorComponent } from './common/internal-error/internal-error.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ChangePasswordComponent } from './settings/change-password/change-password.component';
import { AccountSettingsComponent } from './settings/account-settings/account-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { InvoiceDetailsComponent } from './pages/invoices-page/invoice-details/invoice-details.component';
import { InvoicesComponent } from './pages/invoices-page/invoices/invoices.component';
import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
import { ECartComponent } from './pages/ecommerce-page/e-cart/e-cart.component';
import { EOrderDetailsComponent } from './pages/ecommerce-page/e-order-details/e-order-details.component';
import { EOrdersComponent } from './pages/ecommerce-page/e-orders/e-orders.component';
import { EProductDetailsComponent } from './pages/ecommerce-page/e-product-details/e-product-details.component';
import { EProductsGridComponent } from './pages/ecommerce-page/e-products-grid/e-products-grid.component';
import {AuthGuard} from "./authentication/auth-guard.service";

export const routes: Routes = [
    {path: '', component: EProductsGridComponent},
    {path: 'shop/product-details/:id', component: EProductDetailsComponent},
    {path: 'dashboard', component: EcommerceComponent, canActivate: [AuthGuard]},
    {path: 'order/orders', component: EOrdersComponent, canActivate: [AuthGuard]},
    {path: 'order/order-details/:id', component: EOrderDetailsComponent, canActivate: [AuthGuard]},
    {path: 'cart', component: ECartComponent},
    {
        path: 'invoices',
        component: InvoicesPageComponent,
        children: [
            {path: '', component: InvoicesComponent},
            {path: 'invoice-details', component: InvoiceDetailsComponent},
        ]
    },
    {path: 'faq', component: FaqPageComponent},
    {
        path: 'authentication',
        component: AuthenticationComponent,
        children: [
            {path: '', component: SignInComponent},
            {path: 'sign-up', component: SignUpComponent},
            {path: 'forgot-password', component: ForgotPasswordComponent},
            {path: 'reset-password', component: ResetPasswordComponent},
            {path: 'confirm-email', component: ConfirmEmailComponent},
        ]
    },
    {
        path: 'settings',
        component: SettingsComponent,
        children: [
            {path: '', component: AccountSettingsComponent},
            {path: 'change-password', component: ChangePasswordComponent},

        ]
    },
    {path: 'search', component: SearchPageComponent},
    {path: 'internal-error', component: InternalErrorComponent},
    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];
