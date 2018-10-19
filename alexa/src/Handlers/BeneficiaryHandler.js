var Utils = require('../Utils').Utils;

exports.BeneficiaryHandler = {
    GetFoodnCashDistribution:
          function(request, response) {
              // We go this deep to avoid checking for every synonyms in our functions and use the core value
              let unitSlotRaw = request.slots.unit.resolution(0).first().name;
              let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0).first().name;
              let timeframeSlotRaw = request.slots.timeframe.resolution(0).first().name;
              var speechOutput = "No data";
              return new Promise((resolve, reject) => {
                    Utils.requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
                        let data = results.data;
                        let columnName = "";
                        let middlePhrase = "";
                        let endPhrase = "";
                        switch (timeframeSlotRaw.toLowerCase()) {
                            case 'actual':
                                switch (unitSlotRaw.toLowerCase()) {
                                    case 'cash':
                                        columnName="Actual CBT";
                                        break;
                                    case 'food':
                                        columnName="Actual food";
                                        break;
                                }
                                middlePhrase = " were given ";
                                endPhrase = " until now ";
                                break;
                            case 'planned':
                                switch (unitSlotRaw.toLowerCase()) {
                                    case 'cash':
                                        columnName="Planned CBT";
                                        break;
                                    case 'food':
                                        columnName="Planned food";
                                        break;
                                }
                                middlePhrase = " will be given ";
                                break;
                        }
                        let values = data.filter(row => row['Country'] === wfpcountrySlotRaw);
                        let displayedValue = Utils.calculateSum(values, columnName);
                        speechOutput = "The " + wfpcountrySlotRaw + middlePhrase + displayedValue + " " + unitSlotRaw + endPhrase;
                        resolve(speechOutput);
                    })
                })
              .then((result) => {
                    response.say(result);
                    response.reprompt(result);
                    response.card('Food and cash distribution !', result);
                    response.shouldEndSession(false);
                    return response;
                },
              (error) => {
                console.error('err', error);
                speechOutput = "There was an issue whith the request about the food and cash distribution";
                response.say(speechOutput);
                response.reprompt(speechOutput);
                response.card('GetFoodnCashDistribution error !', speechOutput);
                response.shouldEndSession(false);
                return response;
            });
        }
    ,
    GetTransferData:
        function(request, response) {
            let programTypeSlotRaw = request.slots.programType.resolution(0).first().name;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0).first().name;
            speechOutput = "No data";
            return new Promise((resolve, reject) => {
                Utils.requestGSheet('1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg', (results) => {
                    let data = results.data;
                    let columnName = "";
                    switch (programTypeSlotRaw.toLowerCase()) {
                        case 'capacity strengthening':
                            columnName="Total Capacity Strengthening (USD)";
                            break;
                    }
                    let values = data.filter(row => row['CO'] === wfpcountrySlotRaw);
                    let displayedValue = Utils.calculateSum(values, columnName);
                    speechOutput = "The amount of " + programTypeSlotRaw + " in " + wfpcountrySlotRaw + " is " + displayedValue + " USD.";
                    resolve(speechOutput);
                })
            })
            .then((result) => {
                response.say(result);
                response.reprompt(result);
                response.card('Transfer Data !', result);
                response.shouldEndSession(false);
                return response;
            },
            (error) => {
            console.error('err', error);
            speechOutput = "There was an issue whith the request about the transfer data.";
            response.say(speechOutput);
            response.reprompt(speechOutput);
            response.card('Transfer Data error !', speechOutput);
            response.shouldEndSession(false);
        });
        }
    ,
    GetBeneficiaries:
        function(request, response) {
            let residenceStatusSlotRaw = request.slots.residenceStatus.resolution(0) ?
            request.slots.residenceStatus.resolution(0).first().name : undefined;
            let residenceStatusSlotValue = request.slots.residenceStatus.value;
            let disaggregationDataSlotRaw = request.slots.disaggregationData.resolution(0) ?
            request.slots.disaggregationData.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
            request.slots.wfpcountry.resolution(0).first().name : undefined;
            let unitSlotRaw = request.slots.unit.resolution(0) ?
                request.slots.unit.resolution(0).first().name : undefined;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                if (disaggregationDataSlotRaw) {
                    // If the user want an information about the sex or the age groups
                    Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                        let columnName = "";
                        let headerName = "";
                        // We are filtering according to the country the user typed
                        let values = results.data;
                        if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() !== "Asia") {
                            values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        }
                        let values1 = [];
                        let values2 = [];
                        switch (disaggregationDataSlotRaw.toLowerCase()) {
                            case 'age':
                                headerName = "Age groups";
                                values1 = values.filter(row => row[headerName] === "Adults (>18)");
                                values2 = values.filter(row => row[headerName] === "Children (5-18)" || row[headerName] === "Children (< 5)");
                                break;
                            case 'gender':
                                headerName="Sex";
                                values1 = values.filter(row => row[headerName] === "Male");
                                values2 = values.filter(row => row[headerName] === "Female");
                                break;
                        }
                        console.log('OUI', columnName, residenceStatusSlotRaw, values1, values2);
                        let displayedValue1 = Utils.calculateSum(values1, 'Number of beneficiaries');
                        let displayedValue2 = Utils.calculateSum(values2, 'Number of beneficiaries');
                        if (wfpcountrySlotRaw === "Asia") {
                            wfpcountrySlotRaw = "globally";
                        }
                        if (headerName === "Sex") {
                            speechOutput = "There are " + displayedValue1 + " men and " + displayedValue2 + " women " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                        }
                        else if (headerName === "Age groups") {
                            speechOutput = "There are " + displayedValue1 + " adults and " + displayedValue2 + " children " + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                        }
                        resolve(speechOutput);
                    });
                }
                else {
                    Utils.requestGSheet('14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY', (results) => {
                        let columnName = "";
                        let values = results.data;
                        // We are filtering according to the country the user typed
                        if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() !== "Asia") {
                            values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        }
                        switch (residenceStatusSlotRaw.toLowerCase()) {
                            case 'residents':
                                columnName="Residents";
                                break;
                            case 'returnees':
                                columnName="Returnees";
                                break;
                            case 'refugees':
                                columnName="Refugees";
                                break;
                            case 'idp':
                                columnName="IDP";
                                break;
                            case 'beneficiaries':
                                break;
                        }
                        if (columnName !== "") {
                            values = values.filter(row => row['Residence Status'] === columnName);
                        }
                        let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                        if (residenceStatusSlotValue.toLowerCase() === "households" || residenceStatusSlotValue.toLowerCase() === "participants") {
                            speechOutput = "I'm sorry, the only data WFP has is about the beneficiaries. ";
                        }
                        else {
                            speechOutput = "";
                        }
                        let subjects = ["WFP", "The World Food Programme", "We"];
                        let randomNumber = new Date().getMilliseconds()%3;
                        console.log(randomNumber);
                        if (wfpcountrySlotRaw === "Asia") {
                            wfpcountrySlotRaw = "globally";
                        }
                        if (randomNumber%2 === 0) {
                            speechOutput += subjects[randomNumber] + " served " + displayedValue + " " + residenceStatusSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                        }
                        else {
                            if (randomNumber === 0) {
                                subjects[0] = subjects[0]+" has";
                            }
                            else {
                                subjects[randomNumber] = subjects[randomNumber]+" have";
                            }
                            speechOutput += subjects[randomNumber] + " " + displayedValue + " " + residenceStatusSlotRaw + (wfpcountrySlotRaw ? " in " +  wfpcountrySlotRaw : '');
                        }
                        resolve(speechOutput);
                    });
                }
            })
            .then((result) => {
                response.say(result);
                response.reprompt(result);
                response.card('Beneficiaries !', result);
                response.shouldEndSession(false);
                return response;
            },
            (error) => {
                console.error('err', error);
                speechOutput = "There was an issue whith the request about the beneficiaries.";
                response.say(speechOutput);
                response.reprompt(speechOutput);
                response.card('Transfer Data error !', speechOutput);
                response.shouldEndSession(false);
            });
        }
};
