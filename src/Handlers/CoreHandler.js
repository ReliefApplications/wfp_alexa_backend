const request = require('request');
const Constants =       require('../Constants').Constants;

exports.CoreHandler = {
  'LaunchRequest': function () {
    //This is triggered when the user says: 'Open wfp asia pacific'
    this.emit(':ask', Constants.TEXTS.welcomeOutput, Constants.TEXTS.welcomeReprompt)
  },
  'ShowDashboard': async function () {
      let wfpcountrySlotRaw = this.event.request.intent.slots.wfpcountry.value;
      let userId = this.event.session.user.userId;
      let data = {}
      if (wfpcountrySlotRaw) {
          data[userId] = wfpcountrySlotRaw;
      }
      else {
          data[userId] = "home";
      }
      let params = {
            method: "put",
            uri: Constants.ENDPOINTS.jsonData,
            body: data,
            json: true,
            headers: {'content-type': 'application/json'}
        };

      var speechOutput = 'Here is the ' + wfpcountrySlotRaw + ' dashboard.';
      try {
          await request(params, ((err, data) => {
              if(err !== null){
                console.error("e", err);
              }
              else {
                  console.log(data);
                  this.emit(":ask", speechOutput);
              }
          }));
      }
      catch (e) {
          speechOutput = "There was an issue while displaying the dashboard";
          this.emit(":ask", speechOutput);
      }
  }
}