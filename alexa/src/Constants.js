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

  PRIVATEVAPIDKEY: process.env.PRIVATE_VAPID_KEY,

  AWS_SMTP_USERNAME : process.env.AWS_SMTP_USERNAME,

  AWS_SMTP_PASSWORD: process.env.AWS_SMTP_PASSWORD,

  SMTP_HOST: 'email-smtp.eu-west-1.amazonaws.com',

  EMAIL_SENDER: 'support@emalsys.org'
}
