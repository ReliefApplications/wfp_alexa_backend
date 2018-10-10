const Alexa = require('ask-sdk-core');

/** import handlers */
const AmazonHandler =       require('./src/Handlers/AmazonHandler').AmazonHandler;
const BeneficiaryHandler =  require('./src/Handlers/BeneficiaryHandler').BeneficiaryHandler;
const CoreHandler =         require('./src/Handlers/CoreHandler').CoreHandler;
const ErrorHandler =        require('./src/Handlers/ErrorHandler').ErrorHandler;

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CoreHandler.LaunchRequest,
        CoreHandler.ShowDashboard,
        BeneficiaryHandler.GetFoodnCashDistribution,
        BeneficiaryHandler.GetTransferData,
        BeneficiaryHandler.GetBeneficiaries,
        AmazonHandler.FallbackIntent,
        AmazonHandler.HelpIntent,
        AmazonHandler.CancelIntent,
        AmazonHandler.StopIntent
    )
    .addErrorHandlers(ErrorHandler)
    .withSkillId('amzn1.ask.skill.ecf62345-0300-4561-8bd0-3acdce03288b')
    .lambda();
