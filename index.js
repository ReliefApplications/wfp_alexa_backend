const Alexa = require('ask-sdk-core');

/** import handlers */
const AmazonHandler =       require('./src/Handlers/AmazonHandler').AmazonHandler;
const BeneficiaryHandler =  require('./src/Handlers/BeneficiaryHandler').BeneficiaryHandler;
const CoreHandler =         require('./src/Handlers/CoreHandler').CoreHandler;
const ErrorHandler =        require('./src/Handlers/ErrorHandler').ErrorHandler;
// const LaunchRequestIntent = {
// //This is triggered when the user says: 'Open wfp asia pacific'
//   canHandle(handlerInput, error) {
//         console.console.log('canHandle', handlerInput, error);
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//     && handlerInput.requestEnvelope.request.intent.name === 'LaunchRequest';
//   },
//   handle(handlerInput, error) {
//       console.console.log('handle', handlerInput, error);
//       return handlerInput.responseBuilder
//                         .speak(Constants.TEXTS.welcomeOutput)
//                         .reprompt(Constants.TEXTS.welcomeReprompt)
//                         .getResponse();
//   }
// };
const handlers = {
    /** Dashboard & Requests Handlers */
    'ShowDashboard':          CoreHandler.ShowDashboard,
    'LaunchRequest':          CoreHandler.LaunchRequest,

    /** Beneficiary Handlers */
    'GetFoodnCashDistribution': BeneficiaryHandler.GetFoodnCashDistribution,
    'GetTransferData':          BeneficiaryHandler.GetTransferData,
    'GetBeneficiaries':         BeneficiaryHandler.GetBeneficiaries,

    /** Amazon handlers */
    'AMAZON.FallbackIntent':  AmazonHandler.FallbackIntent,
    'AMAZON.HelpIntent':      AmazonHandler.HelpIntent,
    'AMAZON.CancelIntent':    AmazonHandler.CancelIntent,
    'AMAZON.StopIntent':      AmazonHandler.StopIntent
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        handlers.ShowDashboard,
        handlers.LaunchRequest,
        handlers.GetFoodnCashDistribution,
        handlers.GetTransferData,
        handlers.GetBeneficiaries,
        handlers.FallbackIntent,
        handlers.HelpIntent,
        handlers.CancelIntent,
        handlers.StopIntent
    )
    .addErrorHandlers(ErrorHandler)
    .withSkillId('amzn1.ask.skill.ecf62345-0300-4561-8bd0-3acdce03288b')
    .lambda();
