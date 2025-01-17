import { google } from 'googleapis';
import readline from 'readline';
import { promisify } from 'util';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

let redirect_uris;
try {
    redirect_uris = JSON.parse(process.env.REDIRECT_URIS)?.urls || [];
    if (!redirect_uris.length) throw new Error('REDIRECT_URIS is empty');
} catch (error) {
    console.error('Invalid REDIRECT_URIS in environment variables:', error);
    redirect_uris = ['https://developers.google.com/oauthplayground/flowName=GeneralOAuthFlow']; // Fallback
}

const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

let TOKEN_PATH;
try {
    TOKEN_PATH = JSON.parse(process.env.TOKEN_PATH || '{}');
} catch (error) {
    console.error('Invalid TOKEN_PATH in environment variables:', error);
    TOKEN_PATH = null;
}

export let authorized = false;

export async function getAccessToken(oAuth2Client = oAuth2) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this URL:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question = promisify(rl.question);
    const code = await rl.question('Enter the code from that page here: ');
    rl.close();

    return new Promise((resolve, reject) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error retrieving access token:', err);
                reject(err);
                return;
            }
            oAuth2Client.setCredentials(token);
            process.env.TOKEN_PATH = JSON.stringify(token);
            console.log('Token stored successfully.');
            resolve(token);
        });
    });
}

export async function authorize() {
    if (TOKEN_PATH && TOKEN_PATH.access_token) {
        const tokenExpirationDate = new Date(TOKEN_PATH.expiry_date);
        const currentDate = new Date();

        if (currentDate > tokenExpirationDate) {
            console.log('Token expired, refreshing...');
            await getAccessToken(oAuth2); // Refresh the token
        } else {
            oAuth2.setCredentials(TOKEN_PATH);
            google.options({ auth: oAuth2 });
            authorized = true;
            console.log('Successfully Authorized');
            return oAuth2;
        }
    } else {
        try {
            await getAccessToken(oAuth2);
            return oAuth2;
        } catch (error) {
            console.error('Authorization failed:', error);
            throw error;
        }
    }
}
