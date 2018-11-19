var express = require("express");
var alexa = require("alexa-app");
var cors = require('cors');
const Constants = require('./alexa/src/Constants').Constants;

var PORT = process.env.PORT || 12113;
var app = express();

app.use(cors());
// You choose here what will be the endpoint for Alexa. If empty it will be the root: '/'
var alexaApp = new alexa.app("/alexa");
alexaApp.express({
    expressApp: app,

    // verifies requests come from amazon alexa. Must be enabled for production.
    // You can disable this if you're running a dev environment and want to POST
    // things to test behavior. enabled by default.
    checkCert: true,

    // sets up a GET route when set to true. This is handy for testing in
    // development, but not recommended for production. disabled by default
    debug: false
});

app.use(require('body-parser').json());
app.post('/subscribe', (req, res) => {
    Constants.SUBSCRIPTION = req.body;
    res.status(201).json({data: { success: true }});
});

var alexa = require('./alexa/index.js').handler(alexaApp);
app.use(require('express-static')('./'));

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));