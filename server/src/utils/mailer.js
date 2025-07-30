import nodemailer from 'nodemailer';


/**
 * @description Utility function to send an email.
 * It uses nodemailer to create a transporter and send mail.
 * The configuration for the transporter should be stored in environment variables.
 * @param {object} options - The options for the email.
 * @param {string} options.email - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.message - The plain text body of the email. You can also add an 'html' property for HTML content.
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
    // 1. Create a transporter object using SMTP transport.
    // This is the service that will send the email (e.g., Gmail, SendGrid, Mailtrap).
    // It's highly recommended to use a development service like Mailtrap.io
    // before using a production service like SendGrid or AWS SES.
    const transporter = nodemailer.createTransport({
        // These details should be stored in your .env file for security
        host: process.env.MAIL_HOST, // e.g., 'smtp.mailtrap.io' or 'smtp.gmail.com'
        port: process.env.MAIL_PORT, // e.g., 2525 or 587
        auth: {
            user: process.env.MAIL_USER, // Your SMTP username
            pass: process.env.MAIL_PASS, // Your SMTP password
        },
    });

    // 2. Define the email options.
    const mailOptions = {
        // Use your actual sending email address here
        from: `"HD" <${process.env.MAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.html.replace(/<[^>]*>?/gm, ''),
        html: options.html,
    };


    // 3. Send the email.
    // sendMail returns a promise, but since we're in an asyncHandler,
    // any errors will be automatically caught and passed to the error handling middleware.
    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${options.email}`);
};

export { sendEmail };

