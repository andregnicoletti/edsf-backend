import { google, sheets_v4, Auth } from "googleapis";
import { env } from "../env";
import { ChannelLeadWriteType } from "../@types/channel-lead-write-type";

// Escopos necessários para acessar a API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export class GoogleSheetService {

    private googleSheets: sheets_v4.Sheets

    constructor() {
        this.googleSheets = google.sheets({ version: 'v4' })
    }

    getAuth = async () => {

        const auth = await new google.auth.JWT(
            env.GCP_CLIENT_EMAIL,
            undefined,
            env.GCP_PRIVATE_KEY,
            SCOPES
        );

        return auth
    }

    metadata = async (auth: Auth.JWT) => {

        const metadata = await this.googleSheets.spreadsheets.get({
            auth,
            spreadsheetId: env.GCP_SPREADSHEET_ID,
        })

        return metadata.data;
    }

    readSheet = async (auth: Auth.JWT, valueRenderOption = 'UNFORMATTED_VALUE', dateTimeRenderOption = 'FORMATTED_STRING') => {

        const getRows = await this.googleSheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: env.GCP_SPREADSHEET_ID,
            range: env.GCP_SPREADSHEET_RANGE,
            valueRenderOption,
            dateTimeRenderOption,
        })

        return getRows.data;
    }

    writeSheet = async (auth: Auth.JWT, values: ChannelLeadWriteType, valueInputOption = 'USER_ENTERED') => {

        const { name, company, phone, email, referralSource, message } = values;

        const data = new Date().toLocaleString('pt-BR')

        await this.googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId: env.GCP_SPREADSHEET_ID,
            range: env.GCP_SPREADSHEET_RANGE,
            valueInputOption,
            requestBody: {
                values: [
                    [name, company, phone, email, referralSource, message, data]
                ]
            }
        })

        return { name, company, phone, email, referralSource, message, data };
    }

}