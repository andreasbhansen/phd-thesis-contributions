import * as Zip from "yauzl";

/****************
* Test: Capacitor
****************/
export const capacitor = async (reader): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        reader.readContent('assets/capacitor.config.json')
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                // We want to resolve either way, so that we get the boolean value back to the overview of identified frameworks
                resolve(false);
            });
    });
}

/****************
* Test: Cordova
****************/
export const cordova = async (reader): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        reader.readContent('assets/www/cordova.js')
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                resolve(false); // We want to resolve either way, so that we get the boolean value back to the overview of identified frameworks
            });
    });
}

/****************
* Test: TabrisJS
****************/
export const tabris = async (reader, manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        reader.readContent('assets/www/cordova.js')
            .then(() => {
                // Tabris-based apps will also contain the cordova.js file, so we must check the manifest for any signs of Tabris
                if (manifest.includes("tabrisjs2") || manifest.includes("@style/Theme.Tabris.Light.SplashScreen")) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(() => {
                resolve(false); // We want to resolve either way, so that we get the boolean value back to the overview of identified frameworks
            });
    })
}

/****************
* Test: NativeScript
****************/
export const nativescript = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // From the showcase apps found, this is the most recurring pattern for nativescript apps without having to decompile the apk
        if (manifest.includes("com.tns.NativeScriptApplication")) {
            resolve(true);
        } else {
            resolve(false);
        }
    })
}

/****************
* Test: NativeScript
****************/
export const xamarin = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // From the showcase apps found, this is the most recurring pattern for xamarin apps without having to decompile the apk
        if (manifest.includes("mono.MonoRuntimeProvider")) {
            resolve(true);
        } else {
            resolve(false);
        }
    })
}

/****************
* Test: Codename1
****************/
export const codename1 = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // From the showcase apps found, this is the most recurring pattern for xamarin apps without having to decompile the apk
        if (manifest.includes("codename1")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: Titanium
****************/
export const titanium = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // From the showcase apps found, this is the most recurring pattern for titanium apps without having to decompile the apk
        if (manifest.includes("@style/Theme.Titanium") || manifest.includes("org.appcelerator.titanium") || manifest.includes("ti.modules.titanium")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: Weex
****************/
export const weex = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        // From the showcase apps found, this is the most recurring pattern for weex apps without having to decompile the apk
        if (manifest.includes("weex")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: QtMobile
****************/
export const qtmobile = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (manifest.includes("QtAndroid") || manifest.includes("QtApplication") || manifest.includes("qt_libs_resource_id")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: Flutter
****************/
export const flutter = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (manifest.includes("io.flutter.app")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: Fuse
****************/
export const fuse = async (manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (manifest.includes("com.fuse.")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

/****************
* Test: Ionic
****************/
export const ionic = async (reader, manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {

        // Check first if the manifest includes a note on ionic
        if (manifest.includes("io.ionic.starter")) {
            resolve(true);
        } else {
            // If it doesn't, continue checking for specific files and paths
            reader.readContent('assets/www/plugins/cordova-plugin-ionic-keyboard/www/android/keyboard.js')
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    // Check if the main index.html contains the word 'ionic', which it should do if it is an Ionic app
                    reader.readContent('assets/www/index.html')
                        .then((indexContent) => {
                            if (indexContent.toString('utf8').toLowerCase().includes('ionic')) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(() => {
                            resolve(false);
                        });
                });
        }
    });
}

/****************
* Test: Adobe Air
****************/
export const adobe_air = async (reader, manifest: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {

        // Check first if the manifest includes a note on Adobe Air
        if (manifest.includes("com.adobe.air")) {
            resolve(true);
        } else {
            // If it doesn't, continue checking for specific files and paths
            reader.readContent('assets/adobeair.vch')
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    reader.readContent('assets/META-INF/AIR/application.xml')
                        .then((indexContent) => {
                            if (indexContent.toString('utf8').toLowerCase().includes('ns.adobe.com/air/application')) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(() => {
                            resolve(false);
                        });
                });
        }
    });
}

/****************
* Test: PhoneGap is an early distribution of Cordova.
We merge PhoneGap and Cordova results during SPSS aggregation, this makes sense for the timeline graph.
****************/
export const phonegap = async (reader, manifest: string, filename: string, APK_DIRECTORY: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {

        /* The first check is to see if the standard 'index.android.bundle' file exist.
        Some APKs might change the name or extension of this file during build, so we cannot be sure that it exist.
        */
        if (
            manifest.includes("com.phonegap.") ||
            manifest.includes("DroidGap")) {

            resolve(true);
        } else {
            let isPhonegapApp: boolean = false;
            Zip.open(`${APK_DIRECTORY}/${filename}`, { lazyEntries: true }, function (err, zipfile) {
                if (err) throw err;
                zipfile.readEntry();

                zipfile.on("error", function (error) {
                    console.log(error);
                    zipfile.close();
                });

                zipfile.on("entry", function (entry) {
                    if (/.*\.(js)$/.test(entry.fileName)) {
                        if (entry.fileName.includes("assets/www/phonegap")) {
                            isPhonegapApp = true;
                            zipfile.close();
                        } else {
                            zipfile.readEntry();
                        }
                    } else {
                        zipfile.readEntry();
                    }
                });

                zipfile.on("close", function () {
                    if (isPhonegapApp) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        }
    });
}

/****************
* Test: React Native
****************/
export const react_native = async (reader, manifest: string, filename: string, APK_DIRECTORY: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {

        /* The first check is to see if the standard 'index.android.bundle' file exist.
        Some APKs might change the name or extension of this file during build, so we cannot be sure that it exist.
        */
        reader.readContent('assets/index.android.bundle')
            .then((content) => {
                resolve(true);
            })
            .catch(() => {
                /* If the bundle file does _not_ exist, we must unzip the APK and perform additional tests.
                Unfortunately, this is CPU heavy and time consuming compared to the other framework tests.
                */
                Zip.open(`${APK_DIRECTORY}/${filename}`, { lazyEntries: true, validateEntrySizes: true }, (err, zipfile): void => {

                    if (err) {
                        console.error(err);
                    }

                    let isRNFile: boolean = false;
                    let errorFound: boolean = false;

                    zipfile.readEntry();


                    zipfile.on("entry", function (entry) {
                        if (/.*\.(bundle|js)$/.test(entry.fileName)) {

                            if (entry.fileName.includes(".js")) {

                                // Read the contents of the entry (file)
                                zipfile.openReadStream(entry, function (err, readStream) {
                                    if (err) {
                                        console.error(err);
                                    }

                                    readStream.on("data", function (data) {
                                        if (data.toString().includes("react_native")) {
                                            isRNFile = true;
                                            //readStream.destroy();
                                            //zipfile.close();
                                            //resolve(true);
                                        }
                                    });

                                    readStream.on("end", function () {
                                        if (isRNFile) {
                                            readStream.destroy();
                                            zipfile.close();
                                        } else {
                                            zipfile.readEntry();
                                        }
                                    });
                                });
                            } else {
                                // If the file is not a .js file, it should be a bundle file, hence an RN APK
                                isRNFile = true;
                                zipfile.close();
                            }

                        } else {
                            zipfile.readEntry();
                        }
                    });
                    zipfile.on("close", function () {
                        if (isRNFile) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                        //console.log(' DONE'.green);
                        //cb(null, database);
                    });

                });
            });
    })
};