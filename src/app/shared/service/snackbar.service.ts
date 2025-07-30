import {Injectable} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    constructor(private _snackBar: MatSnackBar) {}

    message(message: string, action: string = 'Close') {
        this._snackBar.open(message, action, {
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
    }

    showError(message: string, action: string = 'Close') {
        this._snackBar.open(message, action, {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
            duration: 5000
        });
    }

    showSuccess(message: string, action: string = 'Close') {
        this._snackBar.open(message, action, {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
            duration: 3000
        });
    }
}
