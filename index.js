const Alexa = require('alexa-sdk');

/** import handlers */
const AmazonHandler =       require('./src/Handlers/AmazonHandler');
const BeneficiaryHandler =  require('./src/Handlers/BeneficiaryHandler');
const CoreHandler =         require('./src/Handlers/CoreHandler');

const handlers = {
  /** Amazon handlers */
  'AMAZON.FallbackIntent':  AmazonHandler.FallbackIntent,
  'AMAZON.HelpIntent':      AmazonHandler.HelpIntent,
  'AMAZON.CancelIntent':    AmazonHandler.CancelIntent,
  'AMAZON.StopIntent':      AmazonHandler.StopIntent,

  /** Beneficiary Handlers */
  'GetFoodnCashDistribution': BeneficiaryHandler.GetFoodnCashDistribution,
  'GetTransferData':        BeneficiaryHandler.GetTransferData,
  'GetBeneficiaries':       BeneficiaryHandler.GetBeneficiaries,

  /** Dashboard & Requests Handlers */
  'ShowDashboard':          CoreHandler.ShowDashboard,
  'LaunchRequest':          CoreHandler.LaunchRequest
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.execute();
}