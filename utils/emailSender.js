const nodemailer = require("nodemailer");

const emailSender = async function (options) {
  // Transporter. Contains the configurations for sending email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS, // generated ethereal password
    },
  });
  // Options for the email
  const optionsForEmail = {
    from: '"Himeth Dahanayake 👻" <foo@example.com>', // sender address
    to: options.userEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
    //   html: "<b>Hello world?</b>", // html body
  };
  console.log("options", optionsForEmail);
  // Send email
  let sent = await transporter.sendMail(optionsForEmail);
  console.log("sent", sent);
};

module.exports = emailSender;
