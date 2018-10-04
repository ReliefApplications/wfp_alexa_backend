let welcomeOutput = "Welcome to the World Food Programme dashboard ! What would you like to know about WFP ?";
let welcomeReprompt = "You can ask a question like how many outputs WFP serves in Nepal ?";
let speechOutput;
let reprompt;
const jsonData = "https://s3-ap-northeast-1.amazonaws.com/wfp-alexa-demo/data.json";
const googleEndPoint = 'https://docs.google.com/spreadsheets/d/';
const googleSheetEndUrl = '/gviz/tq?tqx=out:csv';

'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');
const Baby = require('babyparse');

const requestGSheet = function(filekey, callback) {
    let uriRequest = googleEndPoint + filekey + googleSheetEndUrl;
    return new Promise((resolve, reject) => {
        request(
            {uri: uriRequest},
            ((err, data) => {
                Baby.parse(data.body, {
                  download      : false,
                  header        : true,
                  dynamicTyping : true,
                  complete      : (results) => {
                      resolve(callback(results));
                  },
                  error         : (error) => {
                      reject(error);
                  }
              });
              if(err !== null){
                  console.error(err);
              }
          }));
      });
}

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

        // Check if the country is a part of the project
		if (!content.hasOwnProperty(wfpcountrySlotRaw)){
		    speechOutput = 'The country ' + wfpcountrySlotRaw + ' is not yet part of WFP';
		    this.emit(":ask", speechOutput);
		}
        // Check if the indicator exists
		else if (!content[wfpcountrySlotRaw].hasOwnProperty(indicatorSlotRaw)){
		    speechOutput = 'The ' + indicatorSlotRaw + ' indicator is not available yet';
		    this.emit(":ask", speechOutput);
		}
        // GIve the answer for the data required
		else {
		    speechOutput = 'There is ' + content[wfpcountrySlotRaw][indicatorSlotRaw]  + ' ' + indicatorSlotRaw  + ' in ' + wfpcountrySlotRaw;
            this.emit(":ask", speechOutput);
		}
    },
    'ShowDashboard': async function () {
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        let userId = this.event.session.user.userId;
        let data = {}
        data[userId] = wfpcountrySlotRaw;
        let params = {
              method: "put",
              uri: jsonData,
              body: data,
              json: true,
              headers: {'content-type': 'application/json'}
          };

        speechOutput = 'Here is the ' + wfpcountrySlotRaw + ' dashboard.';
        try {
            await request(params, ((err, data) => {
                if(err !== null){
                  console.error("e", err);
                }
                else {
                    console.log(data);
                    this.emit(":ask", speechOutput);
                }
            }));
        }
        catch (e) {
            speechOutput = "There was an issue while displaying the dashboard";
            this.emit(":ask", speechOutput);
        }
    },
    'ShowHomePage': async function () {
        let userId = this.event.session.user.userId;
        let data = {}
        data[userId] = "home";
        let params = {
              method: "put",
              uri: jsonData,
              body: data,
              json: true,
              headers: {'content-type': 'application/json'}
          };

        speechOutput = 'Here you go';
        try {
            await request(params, ((err, data) => {
                if(err !== null){
                  console.error("e", err);
                }
                else {
                    console.log(data);
                    this.emit(":ask", speechOutput);
                }
            }));
        }
        catch (e) {
            speechOutput = "There was an issue while displaying the dashboard";
            this.emit(":ask", speechOutput);
        }
    },
    'GetFoodnCashDistribution': async function () {
		let unitSlotRaw = this.event.request.intent.slots.unit.value;
		let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
		let timeframeSlotRaw = this.event.request.intent.slots.timeframe.value;
        speechOutput = "No data";
        try {
            await requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
                let data = results.data;
                let columnName = "";
                let middlePhrase = "";
                let endPhrase = "";
                switch (timeframeSlotRaw.toLowerCase()) {
                    case 'actual':
                        switch (unitSlotRaw.toLowerCase()) {
                            case 'usd':
                                columnName="Actual CBT";
                                break;
                            case 'metric tons':
                                columnName="Actual food";
                                break;
                        }
                        middlePhrase = " were given ";
                        endPhrase = " until now ";
                        break;
                    case 'planned':
                        switch (unitSlotRaw.toLowerCase()) {
                            case 'usd':
                                columnName="Planned CBT";
                                break;
                            case 'metric tons':
                                columnName="Planned food";
                                break;
                        }
                        middlePhrase = " will be given ";
                        break;
                }
                let values = data.filter(row => row['Country'] === wfpcountrySlotRaw);
                let displayedValue = 0;
                values.forEach((val) => {
                    displayedValue += parseInt(val[columnName].replace(/\s/g, ''), 10);
                });
                speechOutput = "The " + wfpcountrySlotRaw + middlePhrase + displayedValue + " " + unitSlotRaw + endPhrase;
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the food and cash distribution";
        }
    },
    'GetTransferData': async function () {
		let programTypeSlotRaw = this.event.request.intent.slots.programType.value;
		let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        speechOutput = "No data";
        try {
            await requestGSheet('1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg', (results) => {
                let data = results.data;
                let columnName = "";
                switch (programTypeSlotRaw.toLowerCase()) {
                    case 'capacity strengthening':
                        columnName="Total Capacity Strengthening (USD)";
                        break;
                }
                let values = data.filter(row => row['CO'] === wfpcountrySlotRaw);
                let displayedValue = 0;
                values.forEach((val) => {
                    displayedValue += parseInt(val[columnName].replace(/\s/g, ''), 10);
                });
                speechOutput = "The amount of " + programTypeSlotRaw + " in " + wfpcountrySlotRaw + " is " + displayedValue + " USD.";
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the transfer data.";
        }
    },
    'GetBeneficiaries': async function () {
        let residenceStatusSlotRaw = this.event.request.intent.slots.residenceStatus.value;
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        speechOutput = "No data";
        try {
            await requestGSheet('14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY', (results) => {
                let data = results.data;
                let columnName = "";
                let values = data;
                if (wfpcountrySlotRaw) {
                    values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                }
                if (residenceStatusSlotRaw) {
                    switch (residenceStatusSlotRaw.toLowerCase()) {
                        case 'residents':
                            columnName="Residents";
                            break;
                        case 'returnees':
                            columnName="Returnees";
                            break;
                        case 'refugees':
                            columnName="Refugees";
                            break;
                        case 'idp':
                            columnName="IDP";
                            break;
                        case 'beneficiaries':
                            break;
                    }
                    if (columnName !== "") {
                        values = values.filter(row => row['Residence Status'] === columnName);
                    }
                }
                let displayedValue = 0;
                values.forEach((val) => {
                    displayedValue += parseInt(val['Number of beneficiaries'], 10);
                });
                speechOutput = "There is " + displayedValue + " " + residenceStatusSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '') ;
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the transfer data.";
        }
    },
    'GetBeneficiariesDisaggregated': async function () {
        let disaggregationDataSlotRaw = this.event.request.intent.slots.disaggregationData.value;
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        speechOutput = "No data";
        try {
            await requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                let data = results.data;
                let columnName = "";
                let headerName = "";
                let values = data;
                if (wfpcountrySlotRaw) {
                    values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                }
                if (disaggregationDataSlotRaw) {
                    switch (disaggregationDataSlotRaw.toLowerCase()) {
                        case 'adults':
                            columnName="Adults (>18)";
                            headerName="Age groups";
                            break;
                        case 'children':
                            columnName="Children";
                            headerName="Age groups";
                            break;
                        case 'male':
                        case 'men':
                            columnName="Male";
                            headerName="Sex";
                            break;
                        case 'female':
                        case 'women':
                            columnName="Female";
                            headerName="Sex";
                            break;
                        case 'beneficiaries':
                            break;
                    }
                    if (columnName === "Children") {
                        values = values.filter(row => row[headerName] === "Children (5-18)" || row[headerName] === "Children (< 5)");
                    }
                    else if (columnName !== "") {
                        values = values.filter(row => row[headerName] === columnName);
                    }
                }
                let displayedValue = 0;
                values.forEach((val) => {
                    displayedValue += parseInt(val['Number of beneficiaries'], 10);
                });
                speechOutput = "There are " + displayedValue + " " + disaggregationDataSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '') ;
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the transfer data.";
        }
    },
    'GetCountryPrograms': async function () {
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        speechOutput = "No data";
        try {
            await requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
                let data = results.data;
                let values = data;
                values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                let displayedValue = [];
                values.forEach((val) => {
                    displayedValue.push(val['Project Type']);
                    console.log("v", displayedValue);
                });
                console.log("vd", displayedValue.join());
                speechOutput = "The program for " + wfpcountrySlotRaw + " are: " + displayedValue.join();
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the country program.";
        }
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
