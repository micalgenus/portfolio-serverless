const path = require('path');

const getPath = p => {
  return /^\.?\.?\//.test(p) ? p : './' + p;
};

if (process.argv.length !== 4) throw new Error('Invalid argument: node gcloud.keyfile.js <keyfile_path> <key_name>');

const keyfilePath = process.argv[2];
const keyName = process.argv[3];
const keyfile = require(getPath(keyfilePath));

if (!keyfile[keyName]) throw new Error('Invalid key_name: ' + JSON.stringify(Object.keys(keyfile)));
console.log(keyfile[keyName]);
