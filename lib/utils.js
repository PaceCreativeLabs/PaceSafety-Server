/* utilities */
var fs = require('fs');
var locations;

function createReport (data) {
	if (data == null || data == {}) return null;
	return {
		metadata: {
			'type' : 'report',
			'state' : 1
		},
		data: data
	};
}

function createAlert (data) {
	if (data == null || data == {}) return null;
	return {
		metadata: {
			'type' : 'alert',
			'state' : 1
		},
		data: data
	};
}

function formatAlert (alert) {
	var string = 'Alert \n';
	for (var key in alert) {
    	var value = alert[key];
    	if (value != null && value != 'null' && value != undefined) {
        	string += formatKeys(key) + ': ' + value.toString();
        	string += '  \n';
    	}
    }
    return string;
}
function formatReport (report) {
	var string = 'REPORT \n';
	for (var key in report) {
    	var value = report[key];
    	if (value != null && value != 'null' && value != undefined) {
        	string += formatKeys(key) + ': ' + value.toString();
        	string += '  \n';
    	}
    }
    return string;
}
function formatKeys (key) {
	var newKey = '';
	for (var i = 0; i < key.length; i++) {
		if (key.charAt(i) == '_') {
			newKey += ' ';
		} else {
			newKey += key.charAt(i);	
		}
	}
	return newKey.capitalizeFirstLetter();
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function createVerificationCode (list,codeLength) {
	var code = '',
	chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	if (codeLength == null) codeLength = 6;
	for (var i = 0; i < codeLength; i ++) {
		var randomPosition = Math.floor( Math.random() * (chars.length-1) );
		code += chars.charAt(randomPosition);
	}
	// Regenerate if code already exists..
	if (list[code]) return CreateVerificationCode(codeLength);
	else return code;
}

function getLocations() {
	if (!locations) locations = fs.readFileSync('db/locations.json');
	return locations;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
	createReport: createReport,
	createAlert: createAlert,
	formatReport: formatReport,
	formatAlert: formatAlert,
	getRandomInt: getRandomInt,
	getLocations: getLocations
}