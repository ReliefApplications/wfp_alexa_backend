const Constants = require('../Constants').Constants;
const Utils = require('../Utils').Utils;

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
  'ShowDashboard':
  // This is triggered when a user ask for some data to be displayed
      function(request, response) {
          let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
              request.slots.wfpcountry.resolution(0).first().name : undefined;
          let userId = request.userId;

          let speechOutput = "";
          if (wfpcountrySlotRaw === undefined) {
              speechOutput = "Here is the home page."
          }
          else {
              let answers = ["Displaying the data for ", "Tis is the dashboard for ", "Here's your data for "];
              speechOutput = answers[Utils.getPseudoRandomNumber(answers.length)] + wfpcountrySlotRaw;
          }
          return new Promise((resolve, reject) => {
              let googleFiles = [
                  '1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ',
                  '1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg',
                  '1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU',
                  '14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY'];
              let tabResults = [];
              googleFiles.forEach((googleKey) => {
                  tabResults.push(new Promise((resolve, reject) => {
                      Utils.requestGSheet(googleKey, (results) => {
                          let values = results.data.filter(row => row['Country'] === wfpcountrySlotRaw || row['CO'] === wfpcountrySlotRaw);
                          resolve(values);
                      });
                  })
                  .then((data) => {
                      return data;
                  }));
              });

              Promise.all(tabResults).then((data) => {
                  resolve({
                             say: speechOutput,
                             res: data
                         });
              })
          })
          .then((result) => {
              let country = wfpcountrySlotRaw ? wfpcountrySlotRaw : 'Global';
              Utils.emitNewDash(userId, country, result.res);
              response.say(result.say);
              response.reprompt(result.say);
              response.card('Dashboard !', result.say);
              response.shouldEndSession(false);
              return response;
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue while displaying the dashboard";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Dashboard error !', speechOutput);
                        response.shouldEndSession(false);
                        return response;
                        });
          }
  };
