const aws = require('aws-sdk');
const log = require('@kevinwang0316/log');
const nodemailer = require('nodemailer');

const wrapper = require('../middlewares/wrapper');

const ses = new aws.SES();

const handler = async (event, context) => {
  const { requestContext: { authorizer: { claims: { email } } } } = event;
  const mailOptions = {
    from: process.env.NOTIFICATION_EMAIL_ADDRESS,
    subject: 'A new Workflow instance is found',
    text: 'You have a new workflow instance is found by the Workflow Manager.',
    to: email,
    // bcc: Any BCC address you want here in an array,
  };
  const transporter = nodemailer.createTransport({
    SES: ses,
  });

  try {
    await transporter.sendMail(mailOptions);
    return { statusCode: 200 };
  } catch (err) {
    log.error(`${context.functionName}: ${err}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wrapper(handler);
