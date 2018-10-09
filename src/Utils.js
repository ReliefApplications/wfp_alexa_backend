const Baby = require('babyparse');
const request = require('request');
const Constants = require('./Constants');

exports.Utils = {
    /**
     * TODO: Document this function and parameters
     * @param filekey 
     * @param callback 
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
     * TODO: Document this function and parameters
     * @param values 
     * @param columnName 
     */
    calculateSum: function(values, columnName) {
        let result = 0;
        values.forEach((val) => {
            if (typeof val[columnName] === 'string') {
                result += parseInt(val[columnName].replace(/\s/g, ''), 10);
            }
            else {
                result += parseInt(val[columnName], 10);
            }
        });
        return result;
    }
}