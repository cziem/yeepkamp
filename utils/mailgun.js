require('../config/config')
var API_KEY = process.env.MAIL_GUN_API_KEY;
var DOMAIN = process.env.MAIL_GUN_DOMAIN;
var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

const data = {
  from: 'Techam <phavorsparks@gmail.com>',
  to: 'phavorsparks@gmail.com',
  subject: 'Hello World!',
  text: 'We are 70% ready to fly eagle...'
};

mailgun.messages().send(data, (error, body) => {
  if (error) {
    // console.log(error)
  } else {
    console.log(body);
  }
});

