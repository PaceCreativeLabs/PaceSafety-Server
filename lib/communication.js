/* EMAIL, SMS, Voicecall */

var postmark = require("postmark")('f8536579-7284-4950-9e3d-977cc96332d0'); //Email Service
// Twilio Credentials for SMS, Voicecalls
var accountSid = 'AC5e9029c9829afec2e18de5cda722088c'; 
var authToken = '61feffbfb19e9e6dfc82141581510ffa'; 
var twilioPhoneNumber = '+12013659419'; //'+16465863267';
var serverUrl = global.myUrl;
var client = require('twilio')(accountSid, authToken);

function sendEmail (data,callback) {
	postmark.send({
        "From": data.from? data.from : 'bm09148n@pace.edu',
        "To": data.to? data.to : 'bm09148n@pace.edu',
        "Subject": data.subject? data.subject : 'Default Subject',
        "TextBody": data.body? data.body : 'Default Body',
        "Tag": data.tag? data.tag : 'Important'
    }, callback);
}

function sendSMS (data, callback) {
	client.messages.create({ 
		to: (data.to != null)? data.to : "+12012948083", 
		from: twilioPhoneNumber, 
		body: (data.body != null)? data.body : 'this is a message',   
	}, function(err, message) { 
		if (callback != null) callback(err,message);
	});
}
function sendCall (data, callback) {
	var id = data['id'];
	if (id == null) id = 'testid';

	client.calls.create({ 
		to: (data.to != null)? data.to : "+12012948083", 
		from: twilioPhoneNumber, 
		url: (serverUrl + "/voicemessagexml/" + id),
		method: "GET",  
		fallbackMethod: "GET",  
		statusCallbackMethod: "GET",    
		record: "false" 
	}, function(err, call) {
		if (callback != null) callback(err,call);
	});
}

function createMessageXML (messageString) {
	// Create a twilio xml for voice messages
	var xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice" language="en" loop="2">' + messageString + '</Say></Response>';
	return xml;
}

module.exports = {
	sendEmail : sendEmail,
	sendSMS : sendSMS,
	sendCall : sendCall,
	createMessageXML : createMessageXML
};