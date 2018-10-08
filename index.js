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
const calculateSum = function(values, columnName) {
    let result = 0;
    values.forEach((val) => {
        if (typeof val[columnName] === 'string') {
            result += parseInt(val[columnName].replace(/\s/g, ''), 10);
        }
        else {
            result += parseInt(val[columnName], 10);
        }
    });
    return result;
}

const handlers = {
    'LaunchRequest': function () {
        //This is triggered when the user says: 'Open wfp asia pacific'
        this.emit(':ask', welcomeOutput, welcomeReprompt)
    },
    'ShowDashboard': async function () {
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
        let userId = this.event.session.user.userId;
        let data = {}
        if (wfpcountrySlotRaw) {
            data[userId] = wfpcountrySlotRaw;
        }
        else {
            data[userId] = "home";
        }
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
    'GetFoodnCashDistribution': async function () {
        // We go this deep to avoid checking for every synonyms in our functions and use the core value
		let unitSlotRaw = this.event.request.intent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
		let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
		let timeframeSlotRaw = this.event.request.intent.slots.timeframe.resolutions.resolutionsPerAuthority[0].values[0].value.name;
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
                            case 'metric tons of food':
                                columnName="Planned food";
                                break;
                        }
                        middlePhrase = " will be given ";
                        break;
                }
                let values = data.filter(row => row['Country'] === wfpcountrySlotRaw);
                let displayedValue = calculateSum(values, columnName);
                speechOutput = "The " + wfpcountrySlotRaw + middlePhrase + displayedValue + " " + unitSlotRaw + endPhrase;
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the food and cash distribution";
            this.emit(":ask", speechOutput);
        }
    },
    'GetTransferData': async function () {
		let programTypeSlotRaw = this.event.request.intent.slots.programType.resolutions.resolutionsPerAuthority[0].values[0].value.name;
		let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
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
                let displayedValue = calculateSum(values, columnName);
                speechOutput = "The amount of " + programTypeSlotRaw + " in " + wfpcountrySlotRaw + " is " + displayedValue + " USD.";
                this.emit(":ask", speechOutput);
            })
            .catch((error) => {
                console.error(error);
            });
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the transfer data.";
            this.emit(":ask", speechOutput);
        }
    },
    'GetBeneficiaries': async function () {
        let residenceStatusSlotRaw = this.event.request.intent.slots.residenceStatus.resolutions ?
         this.event.request.intent.slots.residenceStatus.resolutions.resolutionsPerAuthority[0].values[0].value.name : undefined;
        let disaggregationDataSlotRaw = this.event.request.intent.slots.disaggregationData.resolutions ?
         this.event.request.intent.slots.disaggregationData.resolutions.resolutionsPerAuthority[0].values[0].value.name : undefined;
        let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        speechOutput = "No data";
        try {
            if (disaggregationDataSlotRaw) {
                // If the user want an information about the sex or the age groups
                await requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                    let columnName = "";
                    let headerName = "";
                    // We are filtering according to the country the user typed
                    let values = results.data;
                    if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                    }
                    let values1 = [];
                    let values2 = [];
                    switch (disaggregationDataSlotRaw.toLowerCase()) {
                        case 'age':
                            headerName = "Age groups";
                            values1 = values.filter(row => row[headerName] === "Adults (>18)");
                            values2 = values.filter(row => row[headerName] === "Children (5-18)" || row[headerName] === "Children (< 5)");
                            break;
                        case 'sex':
                            headerName="Sex";
                            values1 = values.filter(row => row[headerName] === "Male");
                            values2 = values.filter(row => row[headerName] === "Female");
                            break;
                    }
                    let displayedValue1 = calculateSum(values1, 'Number of beneficiaries');
                    let displayedValue2 = calculateSum(values2, 'Number of beneficiaries');
                    if (headerName === "Sex") {
                        speechOutput = "There are " + displayedValue1 + " men and " + displayedValue2 + " women " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    }
                    else if (headerName === "Age groups") {
                        speechOutput = "There are " + displayedValue1 + " adults and " + displayedValue2 + " children " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    }
                    this.emit(":ask", speechOutput);
                })
                .catch((error) => {
                    console.error(error);
                    throw error;
                });
            }
            else {
                await requestGSheet('14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY', (results) => {
                    let columnName = "";
                    let values = results.data;
                    if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                    }
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
                    let displayedValue = calculateSum(values, 'Number of beneficiaries');
                    speechOutput = "There are " + displayedValue + " " + residenceStatusSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    this.emit(":ask", speechOutput);
                })
                .catch((error) => {
                    console.error(error);
                    throw error;
                });
            }
        }
        catch (e) {
            speechOutput = "There was an issue whith the request about the beneficiaries.";
            this.emit(":ask", speechOutput);
        }
    },
    'AMAZON.FallbackIntent': function () {
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
