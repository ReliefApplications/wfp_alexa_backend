const Constants = require('../Constants').Constants;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

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
    'SendReport':
    // This is triggered when a user ask for the report on his mailbox
    function(request, response) {
        var transport = nodemailer.createTransport(smtpTransport({
            host: Constants.SMTP_HOST,
            port: 587,
            auth: {
                user: Constants.AWS_SMTP_USERNAME,
                pass: Constants.AWS_SMTP_PASSWORD
            },
            secureConnection: 'false',
            tls: {
                ciphers: 'SSLv3'
            }
        }));

        var mailOptions = {
            from: 'WFP Asia Pacific AI <'+Constants.EMAIL_SENDER+'>', // sender address
            to: ['hatem.kotb@wfp.org'], // list of receivers
            bcc: ['raphael.bonnaud@gmail.com', 'axel.reliefapps@gmail.com'],
            subject: 'Pakistan 2017 Report', // Subject line
            html: 'Hi Hatem, <br/>' +
                'Here is the 2017 report for Pakistan: ' +
                '<a href="https://docs.wfp.org/api/documents/WFP-0000071741/download/">https://docs.wfp.org/api/documents/WFP-0000071741/download/</a> <br/>' +
                'Have a nice day and don\'t hesitate to ask me anything. <br/>' +
                '<br/> WFP Asia Pacific AI' // html body
        };

        transport.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            }
            else{
                console.log('Message sent: ' + info.response);
            }
        });
      let speechOutput = "Okay, I'll do that right away, please, check you mailbox.";
      response.say(speechOutput);
      response.reprompt(speechOutput);
      response.card('Dashboard !', speechOutput);
      response.shouldEndSession(false);
      return response;
    }
};
