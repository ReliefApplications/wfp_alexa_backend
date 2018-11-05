/** import handlers */
const AmazonHandler =       require('./src/Handlers/AmazonHandler').AmazonHandler;
const BeneficiaryHandler =  require('./src/Handlers/BeneficiaryHandler').BeneficiaryHandler;
const CoreHandler =         require('./src/Handlers/CoreHandler').CoreHandler;
const DashboardHandler =    require('./src/Handlers/DashboardHandler').DashboardHandler;
const applicationId = "amzn1.ask.skill.ecf62345-0300-4561-8bd0-3acdce03288b";

exports.handler = function (alexaApp) {

    alexaApp.pre = function (request, response, type) {
        if (request.sessionDetails.application.applicationId !== applicationId) {
            // Fail ungracefully
            throw 'Invalid applicationId: ' + request.sessionDetails.application.applicationId;
        }
    };

    alexaApp.error = function (exception, request, response) {
        response.say("Sorry, an error was encountered while handling your request. Try again later");
    };

    alexaApp.launch(function(request, response) {
        return CoreHandler.LaunchRequest(request, response);
    });

    alexaApp.intent("ShowDashboard", function(request, response) {
        return CoreHandler.ShowDashboard(request, response);
    });

    alexaApp.intent("GetFoodnCashDistribution", function(request, response) {
        return BeneficiaryHandler.GetFoodnCashDistribution(request, response);
    });

    alexaApp.intent("GetTransferData", function(request, response) {
        return BeneficiaryHandler.GetTransferData(request, response);
    });

    alexaApp.intent("GetBeneficiaries", function(request, response) {
        return BeneficiaryHandler.GetBeneficiaries(request, response);
    });

    alexaApp.intent("FocusDashboard", function(request, response) {
        return DashboardHandler.FocusDashboard(request, response);
    });

    alexaApp.intent("SendReport", function(request, response) {
        return CoreHandler.SendReport(request, response);
    });

    alexaApp.intent("AMAZON.FallbackIntent", function(request, response) {
        return AmazonHandler.FallbackIntent(request, response);
    });

    alexaApp.intent("AMAZON.HelpIntent", function(request, response) {
        return AmazonHandler.HelpIntent(request, response);
    });

    alexaApp.intent("AMAZON.CancelIntent", function(request, response) {
        return AmazonHandler.CancelIntent(request, response);
    });

    alexaApp.intent("AMAZON.StopIntent", function(request, response) {
        return AmazonHandler.StopIntent(request, response);
    });
};