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
}
