import * as fs from "fs";
import * as ApkReader from "adbkit-apkreader";
import { eachLimit } from "async";
import { react_native, capacitor, ionic, qtmobile, cordova, weex, flutter, xamarin, titanium, codename1, fuse, tabris, nativescript, adobe_air, phonegap } from "./framework-test-cases";
import ISupportedFrameworks from "./models/ISupportedFrameworks";
import IAppData from "./models/IAppData";
import { storeDataInCSV, metadataStorage } from "./storage";

process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

['SIGINT', 'SIGTERM']
    .forEach((signal: any) => process.on(signal, () => {
        console.log(signal);
        //process.exit();
    }));

/**********************************************************************
* Setup and initialization
***********************************************************************/
//#region "Execute Script"
const executeIdentificationAlgorithm = ({ APK_DIRECTORY }: { APK_DIRECTORY: string }): void => {
    fs.readdir(APK_DIRECTORY, async (readdirError: NodeJS.ErrnoException, filenames: string[]) => {
        if (readdirError) {
            throw new Error(readdirError.message);
        }

        // Keep only Android Package files (apk)
        const filteredFilenameList: string[] = filenames.filter((filename: string) =>
            filename.includes(".apk")
        );

        // Initialize a new CSV file we'll use for storing results
        const csvDataStore = new storeDataInCSV({ csvFilePath: `./test-results-${new Date().toISOString()}__${filteredFilenameList.length}-apps.csv` });

        // Initialize DB connection to get AndroZoo metadata and Google Play Store metadata (both saved in the same DB)
        const storage = new metadataStorage();
        await storage.createConnection();

        // Output count of filenames gathered from APK_DIRECTORY folder
        console.log(`Files from APK_DIRECTORY: ${filteredFilenameList.length}`);

        // To get a sense of how far into the analysis the software is
        let counter = 0;

        // Execute five async tasks at the same time. One async task equals one APK analysis.
        eachLimit(filteredFilenameList, 5, async (filename: string, callback): Promise<void> => {

            counter = counter + 1;
            if (counter % 100 === 0) {
                console.log(`Analysed ${counter} apps [${new Date().toISOString()}]`);
            } else if (counter === filteredFilenameList.length) {
                console.log("Done with the eachLimit");
            }

            try {

                // Extract assumed technology (cross-platform framework or unknown/native) from APK file
                const analyzedAPKAppData: IAppData = await initTestOnFileByFilename(filename, APK_DIRECTORY);

                // Retrieve metadata from Androzoo stored in a MySQL database
                const apkAndrozooMetadata = await storage.getAndrozooMetadataForAPK({ sha256: filename.split('.apk')[0] });
                analyzedAPKAppData.apk_size = apkAndrozooMetadata.apk_size;
                analyzedAPKAppData.dex_date = apkAndrozooMetadata.dex_date;
                analyzedAPKAppData.dex_date_year_only = new Date(apkAndrozooMetadata.dex_date).getFullYear().toString();
                analyzedAPKAppData.pkg_name = apkAndrozooMetadata.pkg_name;

                const permissionsList: string[] = analyzedAPKAppData.manifest?.usesPermissions.map(permission => permission.name);
                if (permissionsList?.length > 0) {
                    analyzedAPKAppData.permissions = permissionsList;
                    analyzedAPKAppData.permissionCount = permissionsList.length;
                }

                // Retrieve metadata from Google Play Store stored in a MySQL database
                const apkGooglePlayCategory = await storage.getPlayStoreMetadataForAPK({ pkg_name: analyzedAPKAppData.pkg_name });
                analyzedAPKAppData.store_category = apkGooglePlayCategory;

                // Save the row to an open CSV
                await csvDataStore.insertCSVRow({ analyzedAPKAppData });

                callback();
            } catch (e) {
                console.error(e);
                callback();
            }
        });
    });
}

executeIdentificationAlgorithm({ APK_DIRECTORY: process.argv.slice(2)[0] }); // Pass path to APK directory
//#endregion "Execute Script"


/**********************************************************************
* Initialization of app/APK and APK reader instance
***********************************************************************/
//#region "Initialize Tests on Specific APK File"
const initTestOnFileByFilename = async (filename: string, APK_DIRECTORY: string): Promise<IAppData> => {

    // Object to hold app-specific values
    const appData: IAppData = { filename, frameworks: null, manifest: null };

    try {
        const apkReaderInstance: any = await ApkReader.open(`${APK_DIRECTORY}/${filename}`); // Open specific APK file, provides an instance to the opened APK file.
        const manifestFromReader: object = await apkReaderInstance.readManifest(); // Get the APK's AndroidManifest file.
        const manifest: string = JSON.stringify(manifestFromReader); // A stringified version of the AndroidManifest is easier to search through in the test cases.
        appData.manifest = manifestFromReader;
        appData.frameworks = await runFrameworkIdentificationTests({ reader: apkReaderInstance, manifest, filename, APK_DIRECTORY });
        return appData;

    } catch (e) {
        //throw new Error(e);
        console.error(e);
    }
}
//#endregion "Initialize Tests on Specific APK File"

/**********************************************************************
* Test execution step
***********************************************************************/
//#region "Run Identification Tests on Specific APK File"
const runFrameworkIdentificationTests = async (
    { reader, manifest, filename, APK_DIRECTORY }:
        { reader: any, manifest: string, filename: string, APK_DIRECTORY: string }
): Promise<string[] | string> => {

    try {

        // Execute a method for 
        const supportedFrameworks: ISupportedFrameworks = {
            tabris: await tabris(reader, manifest),
            nativescript: await nativescript(manifest),
            fuse: await fuse(manifest),
            codename1: await codename1(manifest),
            titanium: await titanium(manifest),
            xamarin: await xamarin(manifest),
            flutter: await flutter(manifest),
            weex: await weex(manifest),
            qtmobile: await qtmobile(manifest),
            cordova: await cordova(reader),
            capacitor: await capacitor(reader),
            ionic: await ionic(reader, manifest),
            adobe_air: await adobe_air(reader, manifest),
            phonegap: await phonegap(reader, manifest, filename, APK_DIRECTORY)
            //react_native: await react_native(reader, manifest, filename, APK_DIRECTORY)
        };

        // An array which contain the frameworks an APK actually uses
        const frameworks: string[] = [];

        // Convert the object above into an array of all the frameworks identified for a given APK.
        Object.keys(supportedFrameworks).forEach((key: string): void => {
            if (key) {
                const framework: string = supportedFrameworks[key];
                if (framework) {
                    frameworks.push(key);
                }
            }
        });

        // Check here for React Native to avoid running the RN test if another framework has been found.
        // This is due to the computational power needed to check for RN apps (unzipping and multiple file reads)
        if (frameworks.length === 0) {
            const isRNApp = await react_native(reader, manifest, filename, APK_DIRECTORY);
            if (isRNApp) {
                frameworks.push("react_native");
            }
        }

        // In case the 'frameworks' array is empty, none of our tests have successfully identified the technology used. Return 'unknown'.
        return frameworks.length > 0 ? frameworks : 'unknown';
    } catch (e) {
        console.error(e);
        return [];
    }
}
//#endregion "Run Identification Tests on Specific APK File"