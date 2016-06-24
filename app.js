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
    // received a sms
    console.log ('Received a SMS');
    // Sender's phone number
    var from_number = request.body.From;
    // Receiver's phone number - Plivo number
    var to_number = request.body.To;
    // The text which was received
    var text = request.body.Text;

    console.log ('From : ' + from_number + ' To : ' + to_number + ' Text : ' + text);

    // process the incoming message
    var response_text = processTextMessage(text);

    // send the processed response
    send_sms(from_number, to_number, response_text);

    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
    response.write('<html><head><title>Processing the following message</title></head><body>');
    response.write('<p>From : ' + from_number + ' To : ' + to_number + ' Text : ' + text + '</p>');
    response.write('</body></html>');
    response.end();
});

function processTextMessage(text) {
    var query = text.toLowerCase();
    var response;

    if (query.includes("refund")) {
        response = "Your refund of $27.33 was initiated on June 24 2016. The current status of the refund is 'Paid'";
    } else {
        if (query.includes("resend")) {
            response = "Your Itinerary details have been sent to the email address on record: kkulkarni@expedia.com";
        } else {
            if (query.includes("trip")) {
            response = "Hotel: TI - Treasure Island Hotel and Casino" +
                "Checkin Date: August 10, 2016" +
                "Checkout Date: August 15, 2016" +
                "Address: 3300 Las Vegas Blvd S Las Vegas, NV - 89109" +
                "Phone: 1702894-7111";
            } else {
                response = "Our customer service agents can help you with this. We have made a note of it. Please call us at 1-800-EXPEDIA.";
            }
        }
    }
    return response;
}

function send_sms(from_number, to_number, response_text) {
    // Send a sms
    console.log ('Attempting to send a SMS');
    var p = plivo.RestAPI({
        authId: process.env.PVLIO_AUTH_ID,
        authToken: process.env.PVLIO_AUTH_TKN
    });

    var params = {
        'src' : to_number,    // Sender's phone number with country code
        'dst' : from_number,  // Receiver's phone Number with country code
        'text' : response_text, // Your SMS Text Message
        'url' : "https://smstron.herokuapp.com/report/", // The URL to which with the status of the message is sent
        'log' : false,
        'method' : "GET" // The method used to call the url
    };

    // prints the complete response
    p.send_message(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
    });
}

app.all('/report/', function(request, response) {
    console.log('SMS delivery status : ', request, response);

    var from_number = request.body.From;
    var to_number = request.body.To;
    var status = request.body.Status;

    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
    response.write('<html><head><title>Report for following message</title></head><body>');
    response.write('<p>From : ' + from_number + ' To : ' + to_number + ' Status : ' + status + '</p>');
    response.write('</body></html>');
    response.end();
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});