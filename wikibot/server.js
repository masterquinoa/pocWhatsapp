var express = require('express');
var app = express();
var request = require('request');
const bodyParser = require('body-parser');


const accountSid = process.env.SID;
const authToken = process.env.KEY;
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/incoming', async (req, res) => {
  try {
    const twiml = new MessagingResponse();
    if (
      req.body.Body.toLowerCase().trim() != "hi" &&
      req.body.Body.toLowerCase().trim() != "hello" &&
      req.body.Body.toLowerCase().trim() != "test" &&
      req.body.Body.toLowerCase().trim() != "help") {
      request(
        'https://api.duckduckgo.com/?skip_disambig=1&format=json&pretty=1&q=' +
        req.body.Body, function (error, response, body) {
          body = JSON.parse(body)
          console.log('body:', body["Abstract"]);

          if (body["Abstract"] == "") {
            body["Abstract"] = body["RelatedTopics"][0]["Text"]
          }

          var msg = twiml.message(`*` + body["Heading"] + `*

`   + body["Abstract"]);
          res.writeHead(200, { 'Content-Type': 'text/xml' });
          res.end(twiml.toString());
        });
    }
    else {
      var msg = twiml.message(`*Hey 👋*

          I am a bot which summarizes WikiPedia pages to help you find quick information, right within WhatsApp.

          Try it out - send me anything you want to know about`)
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  } catch (e) {
    console.log(e)
  }
});

app.post('/check', function (req, res) {
  console.log(req.body.Body)
});

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/sendwhatsapp', async (req, res) => {
  try {
    let message = await client.messages.create(
      {
        from: req.body.from,
        body: req.body.text,
        to: req.body.to
      }
    );
    console.log(message.sid);
    res.send('OK')
  } catch (e) {
    console.log(e);
    res.send('ERROR sending whatsapp')
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

