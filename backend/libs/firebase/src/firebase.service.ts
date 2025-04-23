import { Injectable } from '@nestjs/common';
import { credential, initializeApp } from 'firebase-admin';
import { App, ServiceAccount } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from "fs";

@Injectable()
export class FirebaseService {

    private _app: App;
    private _auth: Auth;

    constructor() {
        const serviceAccountPath = path.resolve(
            'libs/firebase/src/configs/firebase.json'
        );
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        this._app = initializeApp({
            credential: credential.cert(
                serviceAccount as ServiceAccount
            )
        });
        this._auth = getAuth(this._app);
    }
}
