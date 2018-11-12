exports.Constants = {
  TEXTS: {
    welcomeOutput: "Welcome to the World Food Programme dashboard ! What would you like to know about WFP ?",
    welcomeReprompt: "You can ask a question like how many outputs WFP serves in Nepal ?",
    subjects: ["WFP", "The World Food Programme", "We"]
  },

  ENDPOINTS: {
    googleEndPoint: 'https://docs.google.com/spreadsheets/d/',
    googleSheetEndUrl: '/gviz/tq?tqx=out:csv&sheet='
  },

  SUBSCRIPTION: {},

  PUBLICVAPIDKEY : process.env.PUBLIC_VAPID_KEY,

  PRIVATEVAPIDKEY: process.env.PRIVATE_VAPID_KEY
};
