"use strict";

var crypto = require('crypto');
const SSO_DOMAIN = '192.168.6.161';
const SSO_KEY = '38754d453834736e4363437964796642505756735a7458396159674448724555';

function dateAdd(date, interval, units) {
    var ret = new Date(date); //don't change original date
    var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
    switch(interval.toLowerCase()) {
        case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
        case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
        case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
        case 'day'    :  ret.setDate(ret.getDate() + units);  break;
        case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
        case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
        case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
        default       :  ret = undefined;  break;
    }
    return ret;
}

function getCurrentDate(){
    var d   = new Date();
    var day = d.getDate();
    day = (day < 10) ? "0"+day : day;
    var month = d.getMonth() + 1;
    month = (month < 10) ? "0"+month : month;
    var year = d.getFullYear();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    var timeLifeToken = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
    return timeLifeToken;
}

function decryptToken (encryptedMessage, encryptionMethod, secret){
    if(secret.length > 32){
        secret = secret.substr(0, 32);
    }
    var iv = secret.substr(0, 16);
    var decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
}

module.exports.createToken = function(plain_text, encryptionMethod, secret){
    if(secret.length > 32){
        secret = secret.substr(0, 32);
    }
    var iv = secret.substr(0, 16);
    var timeLifeToken = getCurrentDate();
    var textToEncrypt = plain_text + '|' + dateAdd(timeLifeToken,'minute',3);

    var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    return encryptor.update(textToEncrypt, 'utf8', 'base64') + encryptor.final('base64');
}

module.exports.tokenValid = function(encryptedMessage, encryptionMethod, secret){
    var decodeToken = decryptToken(encryptedMessage, encryptionMethod, secret);
    var plainText = decodeToken.substr(0,13).trim();
    var timeToken = decodeToken.substr(14,decodeToken.length).trim();
    var currentTime = Date.parse(new Date());
    var lifeTimeToken  = Date.parse(timeToken);
    if(lifeTimeToken > currentTime && plainText === SSO_DOMAIN){
        return true;
    }
    return false;
}