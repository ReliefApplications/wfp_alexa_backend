const Baby = require('babyparse');
const request = require('request');
const Constants = require('./Constants').Constants;

exports.Utils = {
    /**
     * This function is used to fetch data from a CSV file and parse it into
       an array of JSON objects.
       This function is async because we get data from a request.
     * @param filekey string, We are using the google spreasheets,
                        we need the key for the file we will fetch into.
                        You can find it between de slashes after "d" and before "edit"
     * @param callback function, This function will be executed before returning the value
     */
    requestGSheet: function (filekey, callback) {
        let uriRequest = Constants.ENDPOINTS.googleEndPoint + filekey + Constants.ENDPOINTS.googleSheetEndUrl;
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
        values.forEach((val) => {
            // If the number got spaces, it will be stored as a string and not a number
            // That's why we remove thoses spaces from the string to get the number
            if (typeof val[columnName] === 'string') {
                result += parseInt(val[columnName].replace(/\s/g, ''), 10);
            }
            // Otherwise it's a number so we just convert it into an int in order to avoid float numbers
            else {
                result += parseInt(val[columnName], 10);
            }
        });
        return result;
    }
}
