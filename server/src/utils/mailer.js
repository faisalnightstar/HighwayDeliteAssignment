import nodemailer from "nodemailer";

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
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    // 2. Define the email options.
    const mailOptions = {
        // Use your actual sending email address here
        from: `"HD" <${process.env.MAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.html.replace(/<[^>]*>?/gm, ""),
        html: options.html,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${options.email}`);
};

export { sendEmail };
