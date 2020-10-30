require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = (to, from, subject, text) => {
  const msg = {
    to,
    from,
    subject,
    html: text,
  };

  sgMail.send(msg, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};

module.exports = sendMail;
