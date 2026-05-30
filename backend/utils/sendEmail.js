const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD, 
        },
    });

    // Define the email options
    const mailOptions = {
        from: `"Personal Finance Planner" <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;