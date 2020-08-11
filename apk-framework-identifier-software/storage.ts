import * as mysql from 'mysql2/promise';
import IAppData from "./models/IAppData";

// Query the MySQL database to get additional metadata for the apps
export class metadataStorage {
    private connection: mysql.Connection;

    constructor() {

    }

    async createConnection(): Promise<void> {
        this.connection = await mysql.createConnection({
            host: '',
            user: '',
            password: '',
            database: ''
        });
    }

    async getAndrozooMetadataForAPK({ sha256 }): Promise<IAppData | null> {
        try {
            const [rows, fields] = await this.connection.execute(`
                SELECT * FROM latest_1
                WHERE sha256 = ?
                LIMIT 1
        `, [sha256]);

            return rows?.[0] as IAppData;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getPlayStoreMetadataForAPK({ pkg_name }): Promise<string | null> {
        try {
            const [rows, fields] = await this.connection.execute(`
                SELECT storeCategory FROM marketplace_data
                WHERE pkg_name = ?
                LIMIT 1
        `, [pkg_name]);

            return rows?.[0].storeCategory;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

export class storeDataInCSV {
    private csvWriter;

    constructor({ csvFilePath }) {
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;

        this.csvWriter = createCsvWriter({
            path: csvFilePath,
            fieldDelimiter: ';',
            header: [
                { id: 'sha', title: 'SHA' },
                { id: 'framework', title: 'FRAMEWORK' },
                { id: 'dex_date', title: 'DEX_DATE' },
                { id: 'apk_size', title: 'APK_SIZE' },
                { id: 'pkg_name', title: 'PKG_NAME' },
                { id: 'dex_date_year_only', title: 'DEX_DATE_YEAR_ONLY' },
                { id: 'play_store_category', title: 'PLAY_STORE_CATEGORY' },
                { id: 'permissions', title: 'PERMISSIONS' },
                { id: 'permission_count', title: 'PERMISSION_COUNT' },
            ]
        });
    }

    insertCSVRow({ analyzedAPKAppData }: { analyzedAPKAppData: IAppData }): void {
        this.csvWriter.writeRecords(
            [
                {
                    sha: analyzedAPKAppData.filename,
                    framework: analyzedAPKAppData.frameworks,
                    dex_date: analyzedAPKAppData.dex_date,
                    apk_size: analyzedAPKAppData.apk_size,
                    pkg_name: analyzedAPKAppData.pkg_name,
                    dex_date_year_only: analyzedAPKAppData.dex_date_year_only,
                    play_store_category: analyzedAPKAppData.store_category,
                    permissions: analyzedAPKAppData.permissions,
                    permission_count: analyzedAPKAppData.permissionCount
                }
            ]
        );
    }
}