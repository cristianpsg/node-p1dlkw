'use strict';

const https = require('https');
const validator = require('validator');

const getDaysBetween = (validFrom, validTo) => {
  return Math.round(Math.abs(+validFrom - +validTo) / 8.64e7);
};

const getDaysRemaining = (validFrom, validTo) => {
  const daysRemaining = getDaysBetween(validFrom, validTo);
  if (new Date(validTo).getTime() < new Date().getTime()) {
    return -daysRemaining;
  }
  return daysRemaining;
};

const getSSLCertificateInfo = (host) => {
  if (!validator.isFQDN(host)) {
    return Promise.reject(new Error('Invalid host.'));
  }

  const options = {
    agent: false,
    method: 'HEAD',
    port: 443,
    rejectUnauthorized: false,
    hostname: host,
  };

  return new Promise((resolve, reject) => {
    try {
      const req = https.request(options, (res) => {
        const crt = res.connection.getPeerCertificate(),
          vFrom = crt.valid_from,
          vTo = crt.valid_to;
        var validTo = new Date(vTo);
        console.log(crt);

        resolve({
          daysRemaining: getDaysRemaining(new Date(), validTo),
          valid: res.socket.authorized || false,
          validFrom: new Date(vFrom).toISOString(),
          validTo: validTo.toISOString(),
        });
      });
      req.on('error', reject);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
};

const checkCertificateValidity = async (host) => {
  let isValid = true;
  try {
    const res = await getSSLCertificateInfo(host);
    if (res.daysRemaining <= 0 || !res.valid) {
      isValid = false;
    }
  } catch (err) {
    isValid = false;
  }

  console.log('TEST:', isValid);
  return isValid;
};
const args = { host: 'ho!' };

console.log(checkCertificateValidity('jsonplaceholder.typicode.com'));
