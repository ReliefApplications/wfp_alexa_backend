var Utils = require('../Utils').Utils;

exports.BeneficiaryHandler = {
  GetFoodnCashDistribution: {
    canHandle(handlerInput, error) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetFoodnCashDistribution';
    },
    handle(handlerInput, error) {
        // We go this deep to avoid checking for every synonyms in our functions and use the core value
        let unitSlotRaw = handlerInput.requestEnvelope.request.intent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        let wfpcountrySlotRaw = handlerInput.requestEnvelope.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        let timeframeSlotRaw = handlerInput.requestEnvelope.request.intent.slots.timeframe.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        var speechOutput = "No data";
        return new Promise((resolve, reject) => {
            Utils.requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
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
                let displayedValue = Utils.calculateSum(values, columnName);
                speechOutput = "The " + wfpcountrySlotRaw + middlePhrase + displayedValue + " " + unitSlotRaw + endPhrase;
                resolve(speechOutput);
            })
        })
        .then((result) => {
            return handlerInput.responseBuilder
                              .speak(result)
                              .reprompt(result)
                              .withSimpleCard('Food and cash distribution !', result)
                              .getResponse();
        },
        (error) => {
            console.error('err', error);
            speechOutput = "There was an issue whith the request about the food and cash distribution";
            return handlerInput.responseBuilder
                              .speak(speechOutput)
                              .reprompt(speechOutput)
                              .withSimpleCard('GetFoodnCashDistribution error !', speechOutput)
                              .getResponse();
            });
    }
  },
  GetTransferData: {
    canHandle(handlerInput, error) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetTransferData';
    },
    handle(handlerInput, error) {
      let programTypeSlotRaw = handlerInput.requestEnvelope.request.intent.slots.programType.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      let wfpcountrySlotRaw = handlerInput.requestEnvelope.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        speechOutput = "No data";
        return new Promise((resolve, reject) => {
            Utils.requestGSheet('1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg', (results) => {
                let data = results.data;
                let columnName = "";
                switch (programTypeSlotRaw.toLowerCase()) {
                    case 'capacity strengthening':
                        columnName="Total Capacity Strengthening (USD)";
                        break;
                }
                let values = data.filter(row => row['CO'] === wfpcountrySlotRaw);
                let displayedValue = Utils.calculateSum(values, columnName);
                speechOutput = "The amount of " + programTypeSlotRaw + " in " + wfpcountrySlotRaw + " is " + displayedValue + " USD.";
                resolve(speechOutput);
            })
        })
        .then((result) => {
            return handlerInput.responseBuilder
                              .speak(result)
                              .reprompt(result)
                              .withSimpleCard('Transfer Data !', result)
                              .getResponse();
        },
        (error) => {
            console.error('err', error);
            speechOutput = "There was an issue whith the request about the transfer data.";
            return handlerInput.responseBuilder
                              .speak(speechOutput)
                              .reprompt(speechOutput)
                              .withSimpleCard('Transfer Data error !', speechOutput)
                              .getResponse();
        });
    }
  },
  GetBeneficiaries: {
    canHandle(handlerInput, error) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetBeneficiaries';
    },
    handle(handlerInput, error) {
        let residenceStatusSlotRaw = handlerInput.requestEnvelope.request.intent.slots.residenceStatus.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        let disaggregationDataSlotRaw = handlerInput.requestEnvelope.request.intent.slots.disaggregationData.resolutions ?
        handlerInput.requestEnvelope.request.intent.slots.disaggregationData.resolutions.resolutionsPerAuthority[0].values[0].value.name : undefined;
        let wfpcountrySlotRaw = handlerInput.requestEnvelope.request.intent.slots.wfpcountry.resolutions ?
        handlerInput.requestEnvelope.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name : undefined;
        speechOutput = "No data";
        return new Promise((resolve, reject) => {
            if (disaggregationDataSlotRaw) {
                // If the user want an information about the sex or the age groups
                Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
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
                    let displayedValue1 = Utils.calculateSum(values1, 'Number of beneficiaries');
                    let displayedValue2 = Utils.calculateSum(values2, 'Number of beneficiaries');
                    if (headerName === "Sex") {
                        speechOutput = "There are " + displayedValue1 + " men and " + displayedValue2 + " women " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    }
                    else if (headerName === "Age groups") {
                        speechOutput = "There are " + displayedValue1 + " adults and " + displayedValue2 + " children " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    }
                    resolve(speechOutput);
                });
            }
            else {
                Utils.requestGSheet('14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY', (results) => {
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
                    console.log('OUI', columnName, residenceStatusSlotRaw, values);
                    let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                    speechOutput = "There are " + displayedValue + " " + residenceStatusSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                    resolve(speechOutput);
                });
            }
        })
        .then((result) => {
            return handlerInput.responseBuilder
                              .speak(result)
                              .reprompt(result)
                              .withSimpleCard('Beneficiaries !', result)
                              .getResponse();
                          },
                          (error) => {
                              console.error('err', error);
                              speechOutput = "There was an issue whith the request about the beneficiaries.";
                              return handlerInput.responseBuilder
                                              .speak(speechOutput)
                                              .reprompt(speechOutput)
                                              .withSimpleCard('Beneficiaries error !', speechOutput)
                                              .getResponse();
                          });
      }
  }
}
