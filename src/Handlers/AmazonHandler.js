exports.AmazonHandler = {

  FallbackIntent: function () {
    speechOutput = 'Don\'t push your luck. For this type of information WFP will need to upgrade its system';
    this.emit(":ask", speechOutput);
  },

  HelpIntent: function () {
    //This is triggered when the user says: 'Help'
    speechOutput = 'Try to ask how many beneficiaries do we have in india';
    this.emit(':tell', speechOutput);

  },

  CancelIntent: function () {
    //This is triggered when the user says: 'Cancel'
    speechOutput = 'OK, bye';
    this.emit(':tell', speechOutput);
  },

  StopIntent: function () {
    //This is triggered when the user says: 'Stop'
    speechOutput = 'Thank you for using the WFP Dashboard';
    this.emit(':tell', speechOutput);
  }
}