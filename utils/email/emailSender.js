const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

// Transporter Contains the configurations for sending email
const createTransporter = async (optionsForEmail) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
      },
    });
    resolve(transporter.sendMail(optionsForEmail));
  });
};

// Email to verify singning up
const verifySignUp = async function (options) {
  // Get the html file
  const html = pug.renderFile(`${__dirname}/verifyTemp.pug`, {
    userName: options.userName,
    subject: options.subject,
    url: options.url,
    contact: options.contact,
  });

  // Options for the email
  const optionsForEmail = {
    from: '"AlgoNoob Admin 👻" <admin@algonoob.com>', // sender address
    to: options.userEmail, // list of receivers
    subject: options.subject, // Subject line
    text: htmlToText(html), // plain text body
    html, // html body
  };
  // Send email
  await createTransporter(optionsForEmail);
};
// Email to reset password
const resetPasswordEmail = async function (options) {
  // Options for the email
  const optionsForEmail = {
    from: '"AlgoNoob Admin 👻" <admin@algonoob.com>', // sender address
    to: options.userEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
    //   html: "<b>Hello world?</b>", // html body
  };
  // Send email
  await createTransporter(optionsForEmail);
};
// Email to delete user
const deleteUser = async function (options) {
  // Get the html file
  const html = pug.renderFile(`${__dirname}/deleteTemp.pug`, {
    userName: options.userName,
    subject: options.subject,
    url: options.url,
    contact: options.contact,
  });

  // Options for the email
  const optionsForEmail = {
    from: '"AlgoNoob Admin 👻" <admin@algonoob.com>', // sender address
    to: options.userEmail, // list of receivers
    subject: options.subject, // Subject line
    text: htmlToText(html), // plain text body
    html, // html body
  };
  // Send email
  await createTransporter(optionsForEmail);
};

module.exports = { verifySignUp, resetPasswordEmail, deleteUser };
