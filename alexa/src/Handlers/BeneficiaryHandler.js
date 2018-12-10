const Constants = require('../Constants').Constants;
const Utils = require('../Utils').Utils;

exports.BeneficiaryHandler = {
    GetFoodnCashDistribution:
        function(request, response) {
            // We go this deep to avoid checking for every synonyms in our functions and use the core value
            let unitSlotRaw = request.slots.unit.resolution(0) ?
                request.slots.unit.resolution(0).first().name : undefined;
            let unitInputRaw = request.slots.unit.value;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let timeframeSlotRaw = request.slots.timeframe.resolution(0) ?
                request.slots.timeframe.resolution(0).first().name : undefined;
            let residenceStatusSlotRaw = request.slots.residenceStatus.resolution(0) ?
                request.slots.residenceStatus.resolution(0).first().name : undefined;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                Utils.requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
                    let values = results.data;
                    speechOutput = "";
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                            wfpcountrySlotRaw = " in Asia";
                            values = results.data;
                    } else if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw = " in " + wfpcountrySlotRaw;
                    }
                    let columnNamePrefix = "";
                    let columnNameSuffix = "";
                    if (timeframeSlotRaw) {
                        switch (timeframeSlotRaw.toLowerCase()) {
                            case 'actual':
                                columnNamePrefix = "Actual";
                                break;
                            case 'planned':
                                columnNamePrefix = "Planned";
                                break;
                        }
                    }
                    let displayedValue = 0;
                    if (unitSlotRaw) {
                        switch (unitSlotRaw.toLowerCase()) {
                            case 'cash':
                                columnNameSuffix = "CBT";
                                break;
                            case 'food':
                                columnNameSuffix = "food";
                                break;
                        }
                        if (!columnNamePrefix) {
                            displayedValue += Utils.calculateSum(values, "Planned " + columnNameSuffix);
                            displayedValue  += Utils.calculateSum(values, "Actual " + columnNameSuffix);
                            speechOutput += Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                + (Utils.getPseudoRandomNumber(2) === 0 ? " distributed " : " handed out ")
                                + displayedValue + (unitSlotRaw === "food" ?
                                    ((unitInputRaw.includes("food")) ?
                                        " tons of food "
                                        : " metric tons of " +
                                        (Utils.getPseudoRandomNumber(2) === 0 ? " food " : " commodities "))
                                    : " USD of cash and vouchers ")
                                + (residenceStatusSlotRaw ? " to " + residenceStatusSlotRaw : '') + wfpcountrySlotRaw;
                        }
                        else {
                            displayedValue  += Utils.calculateSum(values, columnNamePrefix + ' ' + columnNameSuffix);
                            if (columnNamePrefix.toLowerCase() === "planned") {
                                speechOutput += Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                    + (Utils.getPseudoRandomNumber(2) === 0 ? " will distribute " : " will hand out ")
                                    + displayedValue + (unitSlotRaw === "food" ?
                                        ((unitInputRaw.includes("food")) ?
                                            " tons of food "
                                            : " metric tons of " +
                                            (Utils.getPseudoRandomNumber(2) === 0 ? " food " : " commodities "))
                                        : " USD of cash and vouchers ")
                                    + (residenceStatusSlotRaw ? " to " + residenceStatusSlotRaw : '') + wfpcountrySlotRaw;
                            }
                            else {
                                speechOutput += Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                    + (Utils.getPseudoRandomNumber(2) === 0 ? " distributed " : " handed out ")
                                    + displayedValue + (unitSlotRaw === "food" ?
                                        ((unitInputRaw.includes("food")) ?
                                            " tons of food "
                                            : " metric tons of " +
                                            (Utils.getPseudoRandomNumber(2) === 0 ? " food " : " commodities "))
                                        : " USD of cash and vouchers ")
                                    + (residenceStatusSlotRaw ? " to " + residenceStatusSlotRaw : '') + wfpcountrySlotRaw
                                    + " until now.";
                            }
                        }
                    }
                    else {
                        speechOutput += "I do not know the total budget. " +
                            Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)];
                        columnNameSuffix = "food";
                        let columnNameSuffix2 = "CBT";
                        let displayedValue2 = 0;
                        if (!columnNamePrefix) {
                            displayedValue += Utils.calculateSum(values, "Planned " + columnNameSuffix);
                            displayedValue  += Utils.calculateSum(values, "Actual " + columnNameSuffix);
                            speechOutput += (Utils.getPseudoRandomNumber(2) === 0 ? " distributed " : " handed out ")
                            + displayedValue + " tons of food and distributed ";
                            displayedValue2 += Utils.calculateSum(values, "Planned " + columnNameSuffix2);
                            displayedValue2  += Utils.calculateSum(values, "Actual " + columnNameSuffix2);
                        }
                        else {
                            displayedValue  += Utils.calculateSum(values, columnNamePrefix + ' ' + columnNameSuffix);
                            speechOutput += (columnNamePrefix.toLowerCase() === "planned" ?
                                (Utils.getPseudoRandomNumber(2) === 0 ? " will distribute " : " will hand out ")
                                : (Utils.getPseudoRandomNumber(2) === 0 ? " distributed " : " handed out "))
                            + displayedValue + " tons of food and distributed ";
                            displayedValue2  += Utils.calculateSum(values, columnNamePrefix + ' ' + columnNameSuffix);
                        }
                        speechOutput += displayedValue2 + " USD of cash and vouchers" + wfpcountrySlotRaw;
                    }
                    if (yearSlotRaw) {
                        if (yearSlotRaw === "2017") {
                            speechOutput += " in 2017."
                        }
                        else {
                            speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                        }
                    }
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
                        speechOutput = "There was an issue with the request about the food and cash distribution";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('GetFoodnCashDistribution error !', speechOutput);
                        response.shouldEndSession(false);
                        return response;
                    });
        }
    ,
    RatioCalculation:
        function(request, response) {
            // We go this deep to avoid checking for every synonyms in our functions and use the core value
            let unitSlotRaw = request.slots.unit.resolution(0) ?
                request.slots.unit.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                Utils.requestGSheet('1WTPRmFwbBVhLFF3qRXUu6gUXx0PPOeM31cOD5Ih31YQ', (results) => {
                    let values = results.data;
                    speechOutput = "";
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia") {
                        wfpcountrySlotRaw = " for the Asia";
                        values = results.data;
                    }
                    else {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw = " for " + wfpcountrySlotRaw;
                    }
                    if (unitSlotRaw) {
                        let columnNameSuffix = "";
                        switch (unitSlotRaw.toLowerCase()) {
                            case 'cash':
                                columnNameSuffix = "CBT";
                                break;
                            case 'food':
                                columnNameSuffix = "food";
                                break;
                        }
                        let displayedValue = Utils.calculateSum(values, "Actual " + columnNameSuffix) / Utils.calculateSum(values, "Planned " + columnNameSuffix) * 100;
                        speechOutput += Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                            + (Utils.getPseudoRandomNumber(2) === 0 ? " distributed " : " handed out ")
                            + Math.round(displayedValue) + "% of the planned" + (unitSlotRaw === "food" ?
                                " food assistance "
                                : " USD of cash and vouchers ") + wfpcountrySlotRaw;
                    } else if (wfpcountrySlotRaw === " for the Asia") {
                        let nbCountries = 0;
                        let countries = [];
                        values.filter((row) => {
                            if (!countries.includes(row['Country'])) {
                                countries.push(row['Country']);
                                nbCountries++;
                            }
                        });
                        let randomNumber = Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length);
                        speechOutput += Constants.TEXTS.subjects[randomNumber]+" serve " + nbCountries + " countries in the Asia Pacific region";
                    }
                    resolve(speechOutput);
                })
            })
                .then((result) => {
                        response.say(result);
                        response.reprompt(result);
                        response.card('Food and cash ratio !', result);
                        response.shouldEndSession(false);
                        return response;
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue with the request about the food and cash ratio";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('RatioCalculation error !', speechOutput);
                        response.shouldEndSession(false);
                        return response;
                    });
        }
    ,
    GetTransferData:
        function(request, response) {
            let programTypeSlotRaw = request.slots.programType.resolution(0).first().name;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0).first().name;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                Utils.requestGSheet('1Cvqf2nCLWCA5GWSochdk10HLtUQCx6TUVdOAbRi21Gg', (results) => {
                    let columnName = "";
                    switch (programTypeSlotRaw.toLowerCase()) {
                        case 'capacity strengthening':
                            columnName="Total Capacity Strengthening (USD)";
                            break;
                    }
                    let values = results.data;
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                            wfpcountrySlotRaw = " in Asia";
                            values = results.data;
                    } else if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['CO'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                    }
                    let displayedValue = Utils.calculateSum(values, columnName);
                    speechOutput = "The amount of " + programTypeSlotRaw + wfpcountrySlotRaw + " is " + displayedValue + " USD";
                    if (yearSlotRaw) {
                        if (yearSlotRaw === "2017") {
                            speechOutput += " in 2017."
                        }
                        else {
                            speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                        }
                    }
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
                        speechOutput = "There was an issue with the request about the transfer data.";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Transfer Data error !', speechOutput);
                        response.shouldEndSession(false);
                    });
        }
    ,
    GetBeneficiaries:
        function(request, response) {
            const adults = "Adults (>18)";
            const teenagers = "Children (5-18)";
            const children = "Children (< 5)";
            let residenceStatusSlotRaw = request.slots.residenceStatus.resolution(0) ?
                request.slots.residenceStatus.resolution(0).first().name : undefined;
            let residenceStatusSlotValue = request.slots.residenceStatus.value;
            let disaggregationDataSlotRaw = request.slots.disaggregationData.resolution(0) ?
                request.slots.disaggregationData.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let unitSlotRaw = request.slots.unit.value;
            let typeSlotRaw = request.slots.type.resolution(0) ?
                request.slots.type.resolution(0).first().name : undefined;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                if (disaggregationDataSlotRaw) {
                    // If the user want an information about the sex or the age groups
                    Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                        let headerName = "";
                        // We are filtering according to the country the user typed
                        let values = results.data;
                        if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                            wfpcountrySlotRaw = " in Asia";
                            values = results.data;
                        } else if (wfpcountrySlotRaw) {
                            values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                            wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                        }
                        switch (disaggregationDataSlotRaw.toLowerCase()) {
                            case 'children':
                                headerName="Age groups";
                                values = values.filter(row => row[headerName] === teenagers || row[headerName] === children);
                                break;
                            case 'adults':
                                headerName="Age groups";
                                values = values.filter(row => row[headerName] === adults);
                                break;
                            case 'male':
                                headerName="Sex";
                                values = values.filter(row => row[headerName] === "Male");
                                break;
                            case 'female':
                                headerName="Sex";
                                values = values.filter(row => row[headerName] === "Female");
                                break;
                        }
                        let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                        if (displayedValue === 0) {
                            speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                + " did not distribute " + (unitSlotRaw ? "any " + unitSlotRaw : "something") + " to " + disaggregationDataSlotRaw + wfpcountrySlotRaw;
                        }
                        else {
                            switch(Utils.getPseudoRandomNumber(3)) {
                                case 0:
                                    speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                        + " distributed " + (unitSlotRaw ? unitSlotRaw : "")
                                        + " to " + displayedValue + " " + disaggregationDataSlotRaw
                                        + wfpcountrySlotRaw;
                                    break;
                                case 1:
                                    speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                        " received " + (unitSlotRaw ? unitSlotRaw : "assistance") + wfpcountrySlotRaw;
                                    break;
                                case 2:
                                    speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                        " got " + (unitSlotRaw ? unitSlotRaw : " helped ") + wfpcountrySlotRaw;
                                    break;
                            }
                        }
                        if (yearSlotRaw) {
                            if (yearSlotRaw === "2017") {
                                speechOutput += " in 2017."
                            }
                            else {
                                speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                            }
                        }
                        resolve(speechOutput);
                    });
                }
                else {
                    Utils.requestGSheet('14vVRftpNKYWj0ii2Fxi3r88U4H6u9GDnZJ1mB-LvepY', (results) => {
                        let columnName = "";
                        let values = results.data;
                        // We are filtering according to the country the user typed
                        if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                            wfpcountrySlotRaw = " in Asia";
                            values = results.data;
                        } else if (wfpcountrySlotRaw) {
                            values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                            wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                        }
                        if (typeSlotRaw) {
                            let types = [];
                            values.filter((row) => {
                                if (!types.includes(row['Residence Status'])) {
                                    types.push(row['Residence Status']);
                                }
                            });
                            let randomNumber = Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length);
                            speechOutput =  "The types of beneficiaries ";
                            if (randomNumber === 0) {
                                speechOutput += Constants.TEXTS.subjects[0]+" has ";
                            }
                            else {
                                speechOutput += Constants.TEXTS.subjects[randomNumber]+" have ";
                            }
                            speechOutput += wfpcountrySlotRaw + (types.length === 0 ? " are non existent." : " are: " + types.join());
                        }
                        else {
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
                            let randomNumber = Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length);
                            if (randomNumber%2 === 0) {
                                speechOutput += Constants.TEXTS.subjects[randomNumber] + " served " + (displayedValue ? displayedValue : "no") + " " + residenceStatusSlotRaw + " " + wfpcountrySlotRaw;
                            }
                            else {
                                if (randomNumber === 0) {
                                    speechOutput += Constants.TEXTS.subjects[0]+" has ";
                                }
                                else {
                                    speechOutput += Constants.TEXTS.subjects[randomNumber]+" have ";
                                }
                                speechOutput += (displayedValue ? displayedValue : "no") + " " + residenceStatusSlotRaw + wfpcountrySlotRaw;
                            }
                        }
                        if (yearSlotRaw) {
                            if (yearSlotRaw === "2017") {
                                speechOutput += " in 2017."
                            }
                            else {
                                speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                            }
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
                        speechOutput = "There was an issue with the request about the beneficiaries.";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Transfer Data error !', speechOutput);
                        response.shouldEndSession(false);
                    });
        }
    ,
    GetBeneficiariesOver:
        function(request, response) {
            const adults = "Adults (>18)";
            const teenagers = "Children (5-18)";
            const children = "Children (< 5)";
            let disaggregationDataSlotRaw = request.slots.disaggregationData.resolution(0) ?
                request.slots.disaggregationData.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let unitSlotRaw = request.slots.unit.value;
            let ageToSlotRaw = request.slots.age_to.value;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                // If the user want an information about the sex or the age groups
                Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                    let headerName = "";
                    // We are filtering according to the country the user typed
                    let values = results.data;
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                        wfpcountrySlotRaw = " in Asia";
                        values = results.data;
                    } else if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                    }
                    switch (disaggregationDataSlotRaw.toLowerCase()) {
                        case 'children':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === teenagers || row[headerName] === children);
                            break;
                        case 'adults':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === adults);
                            break;
                        case 'male':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Male");
                            break;
                        case 'female':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Female");
                            break;
                    }
                    if (ageToSlotRaw) {
                        if (ageToSlotRaw > 18) {
                            ageToSlotRaw = 18;
                            values = values.filter(row => row["Age groups"] === adults);
                        }
                        else if (ageToSlotRaw > 5) {
                            ageToSlotRaw = 5;
                            values = values.filter(row => row["Age groups"] === teenagers || row["Age groups"] === adults);
                        }
                        else {
                            ageToSlotRaw = 0;
                        }
                    }
                    let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                    if (displayedValue === 0) {
                        speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                            + " did not distribute " + (unitSlotRaw ? "any " + unitSlotRaw : "something") + " to " + disaggregationDataSlotRaw + wfpcountrySlotRaw;
                    }
                    else {
                        switch(Utils.getPseudoRandomNumber(3)) {
                            case 0:
                                speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                    + " distributed " + (unitSlotRaw ? unitSlotRaw : "")
                                    + " to " + displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageToSlotRaw !== undefined ?
                                        " over " + ageToSlotRaw + " years old"
                                        : ""
                                    )
                                    + wfpcountrySlotRaw;
                                break;
                            case 1:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageToSlotRaw !== undefined ?
                                        " over " + ageToSlotRaw + " years old"
                                        : ""
                                    )
                                    + " received " + (unitSlotRaw ? unitSlotRaw : "assistance") + wfpcountrySlotRaw;
                                break;
                            case 2:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageToSlotRaw !== undefined ?
                                        " over " + ageToSlotRaw + " years old"
                                        : ""
                                    )
                                    + " got " + (unitSlotRaw ? unitSlotRaw : " helped ") + wfpcountrySlotRaw;
                                break;
                        }
                    }
                    if (yearSlotRaw) {
                        if (yearSlotRaw === "2017") {
                            speechOutput += " in 2017."
                        }
                        else {
                            speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                        }
                    }
                    resolve(speechOutput);
                });
            })
                .then((result) => {
                        response.say(result);
                        response.reprompt(result);
                        response.card('Beneficiaries over !', result);
                        response.shouldEndSession(false);
                        return response;
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue with the request about the beneficiaries over a certain age.";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Beneficiaries over error !', speechOutput);
                        response.shouldEndSession(false);
                    });
        }
    ,
    GetBeneficiariesUnder:
        function(request, response) {
            const adults = "Adults (>18)";
            const teenagers = "Children (5-18)";
            const children = "Children (< 5)";
            let disaggregationDataSlotRaw = request.slots.disaggregationData.resolution(0) ?
                request.slots.disaggregationData.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let unitSlotRaw = request.slots.unit.value;
            let ageFromSlotRaw = request.slots.age_from.value;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                // If the user want an information about the sex or the age groups
                Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                    let headerName = "";
                    // We are filtering according to the country the user typed
                    let values = results.data;
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                        wfpcountrySlotRaw = " in Asia";
                        values = results.data;
                    } else if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                    }
                    switch (disaggregationDataSlotRaw.toLowerCase()) {
                        case 'children':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === teenagers || row[headerName] === children);
                            break;
                        case 'adults':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === adults);
                            break;
                        case 'male':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Male");
                            break;
                        case 'female':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Female");
                            break;
                    }
                    if (ageFromSlotRaw) {
                        if (ageFromSlotRaw <= 5) {
                            ageFromSlotRaw = 5;
                            values = values.filter(row => row["Age groups"] === children);
                        }
                        else if (ageFromSlotRaw <= 18) {
                            ageFromSlotRaw = 18;
                            values = values.filter(row => row["Age groups"] === children || row["Age groups"] === teenagers);
                        }
                        else {
                            ageFromSlotRaw = 200;
                        }
                    }
                    let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                    if (displayedValue === 0) {
                        speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                            + " did not distribute " + (unitSlotRaw ? "any " + unitSlotRaw : "something") + " to " + disaggregationDataSlotRaw + wfpcountrySlotRaw;
                    }
                    else {
                        switch(Utils.getPseudoRandomNumber(3)) {
                            case 0:
                                speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                    + " distributed " + (unitSlotRaw ? unitSlotRaw : "")
                                    + " to " + displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                        " under " + ageFromSlotRaw + " years old"
                                        : ""
                                    )
                                    + wfpcountrySlotRaw;
                                break;
                            case 1:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                        " under " + ageFromSlotRaw + " years old"
                                        : ""
                                    )
                                    + " received " + (unitSlotRaw ? unitSlotRaw : "assistance") + wfpcountrySlotRaw;
                                break;
                            case 2:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                        " under " + ageFromSlotRaw + " years old"
                                        : ""
                                    )
                                    + " got " + (unitSlotRaw ? unitSlotRaw : " helped ") + wfpcountrySlotRaw;
                                break;
                        }
                    }
                    if (yearSlotRaw) {
                        if (yearSlotRaw === "2017") {
                            speechOutput += " in 2017."
                        }
                        else {
                            speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                        }
                    }
                    resolve(speechOutput);
                });
            })
                .then((result) => {
                        response.say(result);
                        response.reprompt(result);
                        response.card('Beneficiaries over !', result);
                        response.shouldEndSession(false);
                        return response;
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue with the request about the beneficiaries over a certain age.";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Beneficiaries over error !', speechOutput);
                        response.shouldEndSession(false);
                    });
        }
    ,
    GetBeneficiariesBetween:
        function(request, response) {
            const adults = "Adults (>18)";
            const teenagers = "Children (5-18)";
            const children = "Children (< 5)";
            let disaggregationDataSlotRaw = request.slots.disaggregationData.resolution(0) ?
                request.slots.disaggregationData.resolution(0).first().name : undefined;
            let wfpcountrySlotRaw = request.slots.wfpcountry.resolution(0) ?
                request.slots.wfpcountry.resolution(0).first().name : undefined;
            let unitSlotRaw = request.slots.unit.value;
            let ageToSlotRaw = request.slots.age_to.value;
            let ageFromSlotRaw = request.slots.age_from.value;
            let yearSlotRaw = request.slots.year.value;
            let speechOutput = "No data";
            return new Promise((resolve, reject) => {
                // If the user want an information about the sex or the age groups
                Utils.requestGSheet('1l-G2-g8XrnmiD9RMzqq0ELMxNHjNKov7wGW5CqxrHcU', (results) => {
                    let headerName = "";
                    // We are filtering according to the country the user typed
                    let values = results.data;
                    if (wfpcountrySlotRaw && wfpcountrySlotRaw.toLowerCase() === "asia" || !wfpcountrySlotRaw) {
                        wfpcountrySlotRaw = " in Asia";
                        values = results.data;
                    } else if (wfpcountrySlotRaw) {
                        values = values.filter(row => row['Country'] === wfpcountrySlotRaw);
                        wfpcountrySlotRaw =  " in " + wfpcountrySlotRaw;
                    }
                    switch (disaggregationDataSlotRaw.toLowerCase()) {
                        case 'children':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === teenagers || row[headerName] === children);
                            break;
                        case 'adults':
                            headerName="Age groups";
                            values = values.filter(row => row[headerName] === adults);
                            break;
                        case 'male':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Male");
                            break;
                        case 'female':
                            headerName="Sex";
                            values = values.filter(row => row[headerName] === "Female");
                            break;
                    }
                    if (ageFromSlotRaw && ageToSlotRaw) {
                        if (ageFromSlotRaw > 18) {
                            ageFromSlotRaw = 18;
                            ageToSlotRaw = 200;
                            values = values.filter(row => row["Age groups"] === adults);
                        }
                        else if (ageFromSlotRaw < 5 && ageToSlotRaw < 5) {
                            ageFromSlotRaw = 0;
                            ageToSlotRaw = 5;
                            values = values.filter(row => row["Age groups"] === children);
                        }
                        else if (ageFromSlotRaw < 5 && ageToSlotRaw <= 18) {
                            ageFromSlotRaw = 0;
                            ageToSlotRaw = 18;
                            values = values.filter(row => row["Age groups"] === children || row["Age groups"] === teenagers);
                        }
                        else if (ageFromSlotRaw < 5 && ageToSlotRaw > 18) {
                            ageFromSlotRaw = 0;
                            ageToSlotRaw = 200;
                        }
                        else if (ageFromSlotRaw <= 18 && ageToSlotRaw <= 18) {
                            ageFromSlotRaw = 5;
                            ageToSlotRaw = 18;
                            values = values.filter(row => row["Age groups"] === teenagers);
                        }
                        else if (ageFromSlotRaw <= 18 && ageToSlotRaw > 18) {
                            ageFromSlotRaw = 5;
                            ageToSlotRaw = 200;
                            values = values.filter(row =>  row["Age groups"] === teenagers || row["Age groups"] === adults);
                        }
                    }
                    let displayedValue = Utils.calculateSum(values, 'Number of beneficiaries');
                    if (displayedValue === 0) {
                        speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                            + " did not distribute " + (unitSlotRaw ? "any " + unitSlotRaw : "something") + " to " + disaggregationDataSlotRaw + wfpcountrySlotRaw;
                    }
                    else {
                        switch(Utils.getPseudoRandomNumber(3)) {
                            case 0:
                                speechOutput = Constants.TEXTS.subjects[Utils.getPseudoRandomNumber(Constants.TEXTS.subjects.length)]
                                    + " distributed " + (unitSlotRaw ? unitSlotRaw : "")
                                    + " to " + displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                            (ageToSlotRaw !== undefined ?
                                                " from " + ageFromSlotRaw + " to " + ageToSlotRaw + " years old"
                                                : " under " + ageFromSlotRaw + " years old")
                                            : (ageToSlotRaw !== undefined ?
                                                " over " + ageToSlotRaw + " years old"
                                                : "")
                                    )
                                    + wfpcountrySlotRaw;
                                break;
                            case 1:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                            (ageToSlotRaw !== undefined ?
                                                " from " + ageFromSlotRaw + " to " + ageToSlotRaw + " years old"
                                                : " under " + ageFromSlotRaw + " years old")
                                            : (ageToSlotRaw !== undefined ?
                                                " over " + ageToSlotRaw + " years old"
                                                : "")
                                    )
                                    + " received " + (unitSlotRaw ? unitSlotRaw : "assistance") + wfpcountrySlotRaw;
                                break;
                            case 2:
                                speechOutput = displayedValue + " " + disaggregationDataSlotRaw +
                                    (ageFromSlotRaw !== undefined ?
                                            (ageToSlotRaw !== undefined ?
                                                " from " + ageFromSlotRaw + " to " + ageToSlotRaw + " years old"
                                                : " under " + ageFromSlotRaw + " years old")
                                            : (ageToSlotRaw !== undefined ?
                                                " over " + ageToSlotRaw + " years old"
                                                : "")
                                    )
                                    + " got " + (unitSlotRaw ? unitSlotRaw : " helped ") + wfpcountrySlotRaw;
                                break;
                        }
                    }
                    if (yearSlotRaw) {
                        if (yearSlotRaw === "2017") {
                            speechOutput += " in 2017."
                        }
                        else {
                            speechOutput = "I do not have data for "+ yearSlotRaw + ". " + speechOutput + " in 2017";
                        }
                    }
                    resolve(speechOutput);
                });
            })
                .then((result) => {
                        response.say(result);
                        response.reprompt(result);
                        response.card('Beneficiaries over !', result);
                        response.shouldEndSession(false);
                        return response;
                    },
                    (error) => {
                        console.error('err', error);
                        speechOutput = "There was an issue with the request about the beneficiaries over a certain age.";
                        response.say(speechOutput);
                        response.reprompt(speechOutput);
                        response.card('Beneficiaries over error !', speechOutput);
                        response.shouldEndSession(false);
                    });
        }
};
