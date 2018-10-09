exports.AmazonHandler = {

  FallbackIntent: {
    canHandle(handlerInput, error) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FallbackIntent';
    },
    handle(handlerInput, error) {
        let speechOutput = 'Don\'t push your luck. For this type of information WFP will need to upgrade its system';
        return handlerInput.responseBuilder
                          .speak(speechOutput)
                          .reprompt(speechOutput)
                          .getResponse();
    }
  },
  HelpIntent: {
      //This is triggered when the user says: 'Help'
    canHandle: function(handlerInput) {
          return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelpIntent';
    },
    handle: function(handlerInput) {
        let speechOutput = 'Try to ask how many beneficiaries do we have in india';
        return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(speechOutput);
    }
  },

  CancelIntent: {
    //This is triggered when the user says: 'Cancel'
  canHandle(handlerInput, error) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'CancelIntent';
  },
  handle(handlerInput, error) {
        let speechOutput = 'OK, bye';
        return handlerInput.responseBuilder
                            .speak(speechOutput)
                            .reprompt(speechOutput);
    }
  },
  StopIntent: {
    //This is triggered when the user says: 'Stop'
  canHandle(handlerInput, error) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'StopIntent';
  },
  handle(handlerInput, error) {
    let speechOutput = 'Thank you for using the WFP Dashboard';
    return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(speechOutput);
    }
  }
};
