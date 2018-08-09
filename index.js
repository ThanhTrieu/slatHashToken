"use strict";
var crypto = require('crypto');

function str_replace (search, replace, subject, countObj) {

  var i = 0
  var j = 0
  var temp = ''
  var repl = ''
  var sl = 0
  var fl = 0
  var f = [].concat(search)
  var r = [].concat(replace)
  var s = subject
  var ra = Object.prototype.toString.call(r) === '[object Array]'
  var sa = Object.prototype.toString.call(s) === '[object Array]'
  s = [].concat(s)

  var $global = (typeof window !== 'undefined' ? window : global)
  $global.$locutus = $global.$locutus || {}
  var $locutus = $global.$locutus
  $locutus.php = $locutus.php || {}

  if (typeof (search) === 'object' && typeof (replace) === 'string') {
    temp = replace
    replace = []
    for (i = 0; i < search.length; i += 1) {
      replace[i] = temp
    }
    temp = ''
    r = [].concat(replace)
    ra = Object.prototype.toString.call(r) === '[object Array]'
  }

  if (typeof countObj !== 'undefined') {
    countObj.value = 0
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + ''
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
      s[i] = (temp).split(f[j]).join(repl)
      if (typeof countObj !== 'undefined') {
        countObj.value += ((temp.split(f[j])).length - 1)
      }
    }
  }
  return sa ? s : s[0]
}

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

module.exports.createToken = function(product, encryptionMethod, secret){
    if(secret.length > 32){
        secret = secret.substr(0, 32);
    }
    var iv = secret.substr(0, 16);
    var timeLifeToken = getCurrentDate();
    var textToEncrypt = product + '|' + dateAdd(timeLifeToken,'minute',3);

    var encryptor  = crypto.createCipheriv(encryptionMethod, secret, iv);
    var encryptors = encryptor.update(textToEncrypt, 'utf8', 'base64') + encryptor.final('base64');
    return str_replace(['+','/'],['-','_'],encryptors);
}

module.exports.tokenValid = function(encryptedMessage, encryptionMethod, product, secret){
    encryptedMessage = str_replace(['-','_'],['+','/'],encryptedMessage);
    var decodeToken = decryptToken(encryptedMessage, encryptionMethod, secret);
    var plainText = decodeToken.substr(0,13).trim();
    var timeToken = decodeToken.substr(14,decodeToken.length).trim();
    var currentTime = Date.parse(new Date());
    var lifeTimeToken  = Date.parse(timeToken);
    if(lifeTimeToken > currentTime && plainText === product){
        return true;
    }
    return false;
}