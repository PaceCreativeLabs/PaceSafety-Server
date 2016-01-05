/* dispatcher */
var fs = require('fs');
var comm = require('./communication');
var utils = require('./utils');
var dispatchObjects = {};
var voiceMessages = {'testid': 'I just called to say I love you'};
var fileLocation = 'db/cache';


loadDispatchObjects();
setInterval(cleanupTimer,60 * 1000);


function dispatch (data,callback,id) {
	switch (data.metadata.type) {
		case 'report': 
			if (id == null) id = createRequestId();
			data.metadata['id'] = id;
			addDispatchObject(data,id);
			dispatchReport(data,function (err) {
				if (!err) {
					setDispatchObjectState(id,0);
					//removeDispatchObject(id);
				}
			});
			if (callback) callback('recieved report. but maybe not sent yet');
			break;
		case 'alert': 
			if (id == null) id = createRequestId();
			data.metadata['id'] = id;
			addDispatchObject(data,id);
			dispatchAlert(data,function (err) {
				if (!err) {
					setDispatchObjectState(id,0);
					//removeDispatchObject(id);
				}
			});
			if (callback) callback('recieved alert. but maybe not sent yet');
			break;
		case 'webreport': break;
		default: break;
	}
}

function dispatchReport (report,callback) {
	var emailData = {
		subject : 'Report from Pace Safety',
		body: utils.formatReport(report.data)
	}
	comm.sendEmail(emailData, function(err) {
		callback(err);
	})
}
   
function dispatchAlert (alert,callback) {
	var emailData = {
		subject : 'Alert! from Pace Safety',
		body: utils.formatAlert(alert.data)
	}
	var smsData = {
		to: alert.data['to'],
		body: '\nMister Meeseeks here. \n Look at Mee!'
	}
	var voice = alert.data.name + ' is in trouble! Please Help!';

	addVoiceMessage(alert.metadata.id,voice);

	comm.sendSMS(smsData,function(err,msg) {
		comm.sendCall(alert.metadata.id,function(err,call) {
			callback(err);
			setTimeout(function() {
				removeVoiceMessage(alert.metadata.id);
			}, 60 * 1000);
		});
	});
} 

function verifyWebreport (code) {
	// verify code?
   // send report by email
   // callback
} 
function dispatchWebreport (report) {
   // send verification code email
   // callback
}
   
function addDispatchObject(obj,id) {
	if (dispatchObjects[id] != null) return;
	dispatchObjects[id] = obj;
	printObjects();
    save();
}
function removeDispatchObject(id) {
	delete dispatchObjects[id];
	printObjects();
}
function setDispatchObjectState(id,state) {
	var obj = dispatchObjects[id];
	if (obj == null) return;
	obj.metadata.state = state;
	printObjects();
	save();
}

function addVoiceMessage(id,msg) {
	voiceMessages[id] = msg;
	printVoice();
}
function removeVoiceMessage(id) {
	delete voiceMessages[id];
	printVoice();
}
function printVoice() {
	console.log('===Voice MEssages==');
	console.log(voiceMessages);
	console.log('=======');
}

function save () {
	try {
		var dataString = JSON.stringify(dispatchObjects);
		fs.writeFileSync(fileLocation, dataString);	
		console.log('Saved.')
	}
	catch (e) {
		console.log('Save Error: ' + e);
	}
}
function loadDispatchObjects () {
	try {
		var json = fs.readFileSync(fileLocation);
		if (json == null) console.log('Load Error!');
		var data = JSON.parse(json);
		dispatchObjects = data;
		printObjects();
	}catch(e) {
		console.log('Parse/Load Error');
	}
}

function cleanupTimer () {
	console.log('cleanup');
	var changed = false;
	for (id in dispatchObjects) {
		var obj = dispatchObjects[id];
		var type = obj.metadata.type;
		switch (obj.metadata.state) {
			case 0: 
				removeDispatchObject(id);
				changed = true;
				break;
			case 1:
				if (type == 'report' || type == 'alert') {
					dispatch(obj,null,id);
					changed = true;
				}
				break;
			case 2: break;
		}
	}
	if (changed) save();
}

function getVoiceMessageXML(id) {
	var msg = voiceMessages[id];
	if (!msg) msg = 'Sorry, ERROR';
	return comm.createMessageXML(msg);
}

function printObjects() {
	console.log('*** Open Dispatch Objects ***');
	console.log(dispatchObjects);
	console.log('*******************************')
}

function createRequestId () {
	var id = utils.getRandomInt(0,1000000000).toString();
	if (dispatchObjects[id] != null) return createRequestId();
	return id;
}

module.exports = {
	dispatch: dispatch,
	verifyWebreport: verifyWebreport,
	getVoiceMessageXML: getVoiceMessageXML
}