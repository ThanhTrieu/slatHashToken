"use strict";

var ssoToken = require("./");
var token = ssoToken.createToken('192.168.6.161','AES-256-CBC','38754d453834736e4363437964796642505756735a7458396159674448724555');
console.log(token);
var deToken = ssoToken.tokenValid(token,'AES-256-CBC','192.168.6.161','38754d453834736e4363437964796642505756735a7458396159674448724555');
console.log(deToken);