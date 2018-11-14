const Constants = require('../Constants').Constants;
const webpush = require("web-push");
const Utils = require('../Utils').Utils;

exports.DashboardHandler = {
    'FocusDashboard':
    // This is triggered when a user ask for some data to be focused in the dashboard
        function(request, response) {
            let column = request.slots.column.value;
            let userId = request.userId;

            let speechOutput = "The data is now focused";
            Utils.emitFocusDash(userId, column, "", {});
            response.say(speechOutput);
            response.reprompt(speechOutput);
            response.card('Dashboard !', speechOutput);
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
            let column = request.slots.column.value;


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
                    {
                        googleKey: '1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ',
                        googleSheet: ''
                    },
                    {
                        googleKey: '1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg',
                        googleSheet: ''
                    },
                    {
                        googleKey: '1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU',
                        googleSheet: ''
                    },
                    {
                        googleKey: '14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY',
                        googleSheet: ''
                    },
                    {
                        googleKey: '1XDY3mJBaLC7-8VV22wJvNuO7DTNmR5G2cCUFAqjzSP8',
                        googleSheet: 'Countries'
                    }];
                let tabResults = [];
                googleFiles.forEach((file) => {
                    tabResults.push(new Promise((resolve, reject) => {
                        Utils.requestGSheet(
                            file.googleKey,
                            (results) => {
                                let values = results.data.filter(row => row['Country'] === wfpcountrySlotRaw || row['CO'] === wfpcountrySlotRaw);
                                resolve(values);
                                },
                            file.googleSheet
                            );
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
                            else if (data[0] && data[0]['Narrative']) {
                                res.narrative = data[0]['Narrative'];
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
                        response.say(result.say);
                        response.reprompt(result.say);
                        response.card('Dashboard !', result.say);
                        response.shouldEndSession(false);

                        webpush.setVapidDetails('mailto:axel.reliefapps@gmail.com', Constants.PUBLICVAPIDKEY, Constants.PRIVATEVAPIDKEY);
                        const payload = JSON.stringify({
                            title: "Your dashboard is ready",
                            message: "Go to the site to see the data",
                            url: "http://localhost:3630/"
                        });
                        webpush.sendNotification(Constants.SUBSCRIPTION, payload)
                            .catch(error => {
                                console.error(error.stack);
                            });

                        if (column) {
                            Utils.emitFocusDash(userId, column, country, result.res);
                        } else {
                            Utils.emitNewDash(userId, country, result.res);
                        }
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
