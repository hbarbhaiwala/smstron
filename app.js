var plivo = require('plivo');
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.post('/receive_sms/', function(request, response) {

    console.log ('Receiving a SMS: ', request);

    // Sender's phone number
    var from_number = request.body.from;
    // Receiver's phone number - Plivo number
    var to_number = request.body.to;
    // The text which was received
    var text = request.body.text;

    console.log ('From : ' + from_number + ' To : ' + to_number + ' Text : ' + text);

    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
    response.write('<html><head><title>Hello Noder!</title></head><body>');
    response.write('<p>From : ' + from_number + ' To : ' + to_number + ' Text : ' + text);
    response.write('</p></body></html>');
    response.end();
});

app.all('/send_sms/', function(request, response) {
    // Send a sms
    console.log ('Attempting to send a SMS');
    var p = plivo.RestAPI({
        authId: process.env.PVLIO_AUTH_ID,
        authToken: process.env.PVLIO_AUTH_TKN
    });

    var params = {
        'src': '18054915684', // Sender's phone number with country code
        'dst' : '17322814363', // Receiver's phone Number with country code
        'text' : "Hi, message from Plivo", // Your SMS Text Message - English
        //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
        //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
        'url' : "https://smstron.herokuapp.com/report/", // The URL to which with the status of the message is sent
        'method' : "GET" // The method used to call the url
    };

    // Prints the complete response
    p.send_message(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
    });
});

app.all('/report/', function(request, response) {
    console.log('SMS delivery status : ', request, response);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});