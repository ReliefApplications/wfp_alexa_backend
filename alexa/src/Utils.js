const Baby = require('babyparse');
const request = require('request');
const Constants = require('./Constants').Constants;
const io = require('socket.io-client');
const socket = io.connect('https://wfp-alexa-socket.test.humanitarian.tech/');
// const webpush = require("web-push");

exports.Utils = {
    /**
     * This function is used to fetch data from a CSV file and parse it into
       an array of JSON objects.
       This function is async because we get data from a request.
     * @param filekey string, We are using the google spreasheets,
                        we need the key for the file we will fetch into.
                        You can find it between de slashes after "d" and before "edit"
     * @param callback function, This function will be executed before returning the value
     * @param sheetname string, Since a CSV export is done on only one sheet, we can specify the sheetname
     */
    requestGSheet: function (filekey, callback, sheetname) {
        let uriRequest = Constants.ENDPOINTS.googleEndPoint + filekey + Constants.ENDPOINTS.googleSheetEndUrl + (sheetname ? sheetname : '');
        return new Promise((resolve, reject) => {
            request(
                {uri: uriRequest},
                ((err, data) => {
                    Baby.parse(data.body, {
                    download      : false,
                    header        : true,
                    dynamicTyping : true,
                    complete      : (results) => {
                        resolve(callback(results));
                    },
                    error         : (error) => {
                        reject(error);
                    }
                });
                if(err !== null){
                    console.error(err);
                }
            }));
        });
    },
    /**
     * This function is used to calculate the sum of values in an array of objects
     * @param values array, This is the array containing the values we want to sum
     * @param columnName string, This is the name of the key of the attribute we want to sum
                                Because it's an array we will call it columnName.
     */
    calculateSum: function(values, columnName) {
        let result = 0;
        for (let i = 0; i<values.length; i++) {
            // If the number got spaces, it will be stored as a string and not a number
            // That's why we remove thoses spaces from the string to get the number
            if (typeof values[i][columnName] === 'string' && values[i][columnName] !== '') {
                result += parseInt(values[i][columnName].replace(/\s/g, ''), 10);
            }
            // Otherwise it's a number so we just convert it into an int in order to avoid float numbers
            else if (typeof values[i][columnName] === 'number') {
                result += parseInt(values[i][columnName], 10);
            }
        }
        return result;
    },
    /**
     * This function is used to send the data to the dashboard
     * @param userId string, Each user has a dashboard so only the user asking should see his dashboard change.
     * @param country string, Country displayed
     * @param data Object, data that will be used in the dashboard
     */
    emitNewDash: function(userId, country, data) {
        socket.open();
        socket.emit('newDashboard', userId, country, JSON.stringify(data));
    },
    /**
     * This function is used to send the focus to the dashboard
     * @param userId string, Each user has a dashboard so only the user asking should see his dashboard change.
     * @param number number, number of people
     */
    emitFocusDash: function(userId, number) {
        socket.open();
        socket.emit('focusDashboard', userId, number);
    },
    /**
     * This function is used in order to generate a random numer in order to choose which answer Alexa will say.
     * @param maxNumber number
     * @returns {number}
     */
    getPseudoRandomNumber: function(maxNumber) {
        return new Date().getMilliseconds()%maxNumber;
    }
};
