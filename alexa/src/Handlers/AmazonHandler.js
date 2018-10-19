exports.AmazonHandler = {
    FallbackIntent:
        function(request, response) {
            let speechOutput = 'Don\'t push your luck. For this type of information WFP will need to upgrade its system';
            response.say(speechOutput);
            response.reprompt(speechOutput);
            response.shouldEndSession(false);
            return response;
        }
    ,
    HelpIntent:
        function(request, response) {
          let speechOutput = 'Try to ask how many beneficiaries do we have in india. You can also say stop or exit to quit.';
          response.say(speechOutput);
          response.reprompt(speechOutput);
          response.shouldEndSession(false);
          return response;
        }
    ,
    CancelIntent:
        function(request, response) {
          let speechOutput = 'OK, bye';
          response.say(speechOutput);
          response.reprompt(speechOutput);
          response.shouldEndSession(true);
          return response;
        }
    ,
    StopIntent:
        function(request, response) {
          let speechOutput = 'Thank you for using the WFP Dashboard';
          response.say(speechOutput);
          response.reprompt(speechOutput);
          response.shouldEndSession(true);
          return response;
        }
};
