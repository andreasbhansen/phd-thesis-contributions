# APK Framework Identifier Software

### Software requirements:
- Git is recommended to clone this repository
- Node.js and `npm`: Recommended install through [`nvm`](https://github.com/nvm-sh/nvm) for simple version management.
- `$ npm install -g ts-node `: Recommended to run `.ts` files directly from terminal


### How to use:
1. Install Node.js, npm and `ts-node`
2. Clone this current repository
3. Install required `npm` modules inside the repository directory: `$ npm install`
4. Update `storage.ts` with database connection details.
5. Run the script (see command below), and remember to pass in a directory holding `.apk` files.

**Run command**: `$ ts-node index.ts /<full>/<path>/<to>/<apk_directory>`