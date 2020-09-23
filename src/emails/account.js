const { send } = require('@sendgrid/mail');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mfratt@gmail.com',
        subject: 'Welcome to Task App!',
        text: 'Your account has been registered!',
        html: `<h3>Welcome ${name}!</h3><p>Your account has been registed</p>`
    })
};

const sendGoodbyeEmail = ( email, name ) => {
    sgMail.send({
        to: email,
        from: 'mfratt@gmail.com',
        subject: 'Goodbye!',
        text: 'Account deleted',
        html: `<h3>Goodbye ${name}!</h3>`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}