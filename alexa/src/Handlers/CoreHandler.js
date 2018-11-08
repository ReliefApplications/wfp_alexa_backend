const Constants = require('../Constants').Constants;
const webpush = require("web-push");
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
              let answers = ["Displaying the data for ", "This is the dashboard for ", "Here's your data for "];
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
                      let tmp = 0;
                      let res = {};
                      res.raw = data;
                      if (data[0] && data[0]['Actual food']) {
                          tmp += Utils.calculateSum(data, "Actual food");
                          res.food = tmp;
                          tmp = 0;
                          tmp += Utils.calculateSum(data, "Actual CBT");
                          res.cbt = tmp;
                      }
                      else if (data[0] && data[0]['Total Capacity Strengthening (USD)']) {
                          tmp += Utils.calculateSum(data, "Total Capacity Strengthening (USD)");
                          res.capacity_strengthening = tmp;
                      }
                      else if (data[0] && data[0]['Residence Satus']) {
                          tmp += Utils.calculateSum(data, "Residence Satus");
                          res.total = tmp;
                      }
                      else if (data[0] && data[0]['Number of beneficiaries']) {
                          tmp += Utils.calculateSum(data, "Number of beneficiaries");
                          res.total = tmp;
                      }
                      return res;
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

              webpush.setVapidDetails('mailto:axel.reliefapps@gmail.com', Constants.PUBLICVAPIDKEY, Constants.PRIVATEVAPIDKEY);
              const payload = JSON.stringify({
                  title: "Your dashboard is ready",
                  message: "Go to the site to see the data"
              });
              webpush.sendNotification(Constants.SUBSCRIPTION, payload)
                  .catch(error => {
                      console.error(error.stack);
                  });
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
