const fs = require('fs');

const keyFile = 'keyfile.json';

const generateGoogleCloudFunctionKeyfile = () => {
  const configs = process.env;

  const keyFileData = {
    type: configs.gcpKeyType,
    project_id: configs.gcpKeyProjectId,
    private_key_id: configs.gcpKeyPrivateKeyId,
    private_key: configs.gcpKeyPrivateKey,
    client_email: configs.gcpKeyClientEmail,
    client_id: configs.gcpKeyClientId,
    auth_uri: configs.gcpKeyAuthUri,
    token_uri: configs.gcpKeyTokenUri,
    auth_provider_x509_cert_url: configs.gcpKeyAuthProviderX509CertUrl,
    client_x509_cert_url: configs.gcpKeyClientX509CertUrl,
  };

  fs.writeFileSync(keyFile, JSON.stringify(keyFileData, null, 2));
};

const OPTION = (process.argv[2] || '').toLowerCase();
const COMMANDS = {
  gcp: generateGoogleCloudFunctionKeyfile,
};

COMMANDS[OPTION]();
