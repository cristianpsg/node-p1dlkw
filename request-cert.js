'use strict';

const tls = require('tls');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var certs = {};
//Create an event handler:
var myEventHandler = function () {
  console.log('On Event');
  console.log(JSON.stringify(certs));
  console.log('Good Bye World');
};
eventEmitter.on('GotTheCert', myEventHandler);

console.log('Hello World!');

const socket = tls.connect(
  {
    host: 'example.com',
    port: 443,
    rejectUnauthorized: true,
  },
  () => {
    certs = socket.getPeerCertificate();
    console.log('Inside ');
    console.log(JSON.stringify(certs));

    eventEmitter.emit('GotTheCert');
  }
);
