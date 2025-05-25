import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from "fs";
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/lib/auth/auth';

@Injectable()
export class FirebaseService {

    private _app: App;
    private _auth: Auth;

    constructor() {
        const serviceAccountPath = path.join(
            process.cwd(),
            'libs',
            'firebase',
            'src',
            'configs',
            'firebase.json'
        );
        if (!fs.existsSync(serviceAccountPath)) {
            throw new Error(`Firebase config file not found at: ${serviceAccountPath}`);
        }
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        if (!this._app) {
            this._app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        this._auth = admin.auth(this._app);
    }

    async register(email: string, password: string, displayName: string) {
        try {
            const user = await this._auth.createUser({ email, password, displayName });
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }
        } catch (e: unknown) {
            throw new Error("An error occurred while registering the user... " + e);
        }
    }

    async createCustomToken(uid: string): Promise<string> {
        try {
            const token = await this._auth.createCustomToken(uid, {
                expiresIn: 5 * 60,
            });
            return token;
        } catch (e: unknown) {
            throw new Error("An error occurred while creating the custom token... " + e);
        }
    }
}
