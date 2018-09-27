let welcomeOutput = "Welcome to the World Food Programme dashboard ! What would you like to know about W F P ?";
let welcomeReprompt = "You can ask a question like how many outputs WFP serves in Nepal ?";
let speechOutput;
let reprompt;

'use strict';
const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');

const handlers = {
    'LaunchRequest': function () {
        //This is triggered when the user says: 'Open wfp asia pacific'
        this.emit(':ask', welcomeOutput, welcomeReprompt)
    },
    'GetIndicatorCountry': function () {
        //This is triggered when the user says: 'tell me how many {indicator} has in {wfpcountry}?'

        const fs = require('fs');
        let rawdata = fs.readFileSync('data.json');
        let content = JSON.parse(rawdata);
		let indicatorSlotRaw = this.event.request.intent.slots.indicator.value;
		let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;

        // Check if the indicator exists
		if (!content.hasOwnProperty(indicatorSlotRaw)){
		    speechOutput = 'The ' + indicatorSlotRaw + ' indicator is not available yet';
		    this.emit(":ask", speechOutput);
		}
        // Check if the country is a part of the project
		else if (!content[indicatorSlotRaw].hasOwnProperty(wfpcountrySlotRaw)){
		    speechOutput = 'The country ' + wfpcountrySlotRaw + ' is not yet part of WFP';
		    this.emit(":ask", speechOutput);
		}
        // GIve the answer for the data required
		else {
		    speechOutput = 'There is ' + content[indicatorSlotRaw][wfpcountrySlotRaw]  + ' ' + indicatorSlotRaw  + ' in ' + wfpcountrySlotRaw;
            this.emit(":ask", speechOutput);
		}
    },
    'ShowDashboard': function () {
        var docClient = new AWS.DynamoDB.DocumentClient();
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        var params = {
            TableName: "wfpDashboardProofOfWork",
            Key:{
                "countryId": 0,
            },
            UpdateExpression: "set countryToShow = :newCountryId",
            ExpressionAttributeValues: {
                ":newCountryId" : wfpcountrySlotRaw
            }
        };

        speechOutput = 'Here is the ' + wfpcountrySlotRaw + ' dashboard.';
        docClient.update(params, (() => {
           this.emit(":ask", speechOutput);
        }));
    },
    'GetNonCompliantIntent': function () {
            speechOutput = 'Don\'t push your luck. For this type of information WFP will need to upgrade its system';
            this.emit(":ask", speechOutput);
    },
    'AMAZON.HelpIntent': function () {
        //This is triggered when the user says: 'Help'
        speechOutput = 'Try to ask how many beneficiaries do we have in india';
        this.emit(':tell', speechOutput);

    },
    'AMAZON.CancelIntent': function () {
        //This is triggered when the user says: 'Cancel'
        speechOutput = 'OK, bye';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        //This is triggered when the user says: 'Stop'
        speechOutput = 'Thank you for using the WFP Dashboard';
        this.emit(':tell', speechOutput);
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
