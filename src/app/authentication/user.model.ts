export class User {
    constructor(public id: string,
                public email: string,
                public fullName: string,
                public organization: string,
                public imageUrl: string,
                private _token: string,
                private _tokenExpirationDate: Date) {}

    get token() {
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }

        return this._token;
    }

    get tokenExpirationDate() {
        return this._tokenExpirationDate;
    }

    createNewUserFromSelf(imageUrl: string) {
        return new User(this.id, this.email, this.fullName, this.organization, imageUrl, this._token, this._tokenExpirationDate);
    }
}

export interface BackEndUser {
    id: string;
    email: string;
    fullName: string;
    telephoneNumber: string;
    address: string;
    imageUrl: string;
}
