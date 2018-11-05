const Utils = require('../Utils').Utils;

exports.DashboardHandler = {
    'FocusDashboard':
    // This is triggered when a user ask for some data to be focused in the dashboard
        function(request, response) {
            let number = request.slots.number.value;
            let userId = request.userId;

            let speechOutput = "The data is now focused";
            Utils.emitFocusDash(userId, number);
            response.say(speechOutput);
            response.reprompt(speechOutput);
            response.card('Dashboard !', speechOutput);
            response.shouldEndSession(false);
            return response;
        }
};
