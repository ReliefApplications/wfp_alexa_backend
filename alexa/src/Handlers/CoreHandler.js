const Constants = require('../Constants').Constants;

exports.CoreHandler = {
  'LaunchRequest':
  //This is triggered when the user says: 'Open wfp asia pacific'
    function(request, response) {
        response.say(Constants.TEXTS.welcomeOutput);
        response.reprompt(Constants.TEXTS.welcomeReprompt);
        response.card('Welcome to WFP !', Constants.TEXTS.welcomeOutput);
        response.shouldEndSession(false);
        return response;
    }
  ,
    'SendReport':
    // This is triggered when a user ask for the report on his mailbox
    function(request, response) {
      let speechOutput = "Okay, I'll do that right away, please, check you mailbox.";
      response.say(speechOutput);
      response.reprompt(speechOutput);
      response.card('Dashboard !', speechOutput);
      response.shouldEndSession(true);
      return response;
    }
};
