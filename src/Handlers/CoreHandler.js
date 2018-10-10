const request = require('request');
const Constants = require('../Constants').Constants;

exports.CoreHandler = {
  'LaunchRequest': {
  //This is triggered when the user says: 'Open wfp asia pacific'
    canHandle(handlerInput) {
          return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
                          .speak(Constants.TEXTS.welcomeOutput)
                          .reprompt(Constants.TEXTS.welcomeReprompt)
                          .withSimpleCard('Welcome to WFP !', Constants.TEXTS.welcomeOutput)
                          .getResponse();
    }
  },
  'ShowDashboard': {
    canHandle(handlerInput, error) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ShowDashboard';
    },
    handle(handlerInput, error) {
          let wfpcountrySlotRaw = handlerInput.requestEnvelope.request.intent.slots.wfpcountry.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          let userId = handlerInput.requestEnvelope.session.user.userId;
          let data = {}
          if (wfpcountrySlotRaw) {
              data[userId] = wfpcountrySlotRaw;
          }
          else {
              data[userId] = "home";
          }
          let params = {
                method: "put",
                uri: Constants.ENDPOINTS.jsonData,
                body: data,
                json: true,
                headers: {'content-type': 'application/json'}
            };

          let speechOutput = 'Here is the ' + wfpcountrySlotRaw + ' dashboard.';
          return new Promise((resolve, reject) => {
              request(params, ((err, data) => {
                  if(err !== null){
                    console.error("e", err);
                    reject(e);
                  }
                  else {
                      resolve(speechOutput);
                  }
              }));
          })
          .then((result) => {
              return handlerInput.responseBuilder
                                .speak(result)
                                .reprompt(result)
                                .withSimpleCard('Dashboard !', result)
                                .getResponse();
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue while displaying the dashboard";
                        return handlerInput.responseBuilder
                                        .speak(speechOutput)
                                        .reprompt(speechOutput)
                                        .withSimpleCard('Dashboard error !', speechOutput)
                                        .getResponse();
                        });
          }
      }
  }
