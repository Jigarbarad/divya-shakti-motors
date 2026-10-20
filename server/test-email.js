// npm run test-email              -> sends one sample enquiry email (fake customer number)
// npm run test-email -- 99XXXXXXXX -> same, but with a real number, to check the Call / WhatsApp buttons
try { process.loadEnvFile(require('path').join(__dirname, '..', '.env')); } catch (e) {}
const { sendEnquiryEmail, configured } = require('./notify');
if (!configured()) { console.log('Not set up yet. Fill NOTIFY_TO, SMTP_USER and SMTP_PASS in the .env file first.'); process.exit(1); }
const phone = /^[6-9]\d{9}$/.test(process.argv[2] || '') ? process.argv[2] : '9876543210';
sendEnquiryEmail({ name: 'Test Customer', phone, type: 'test_ride', bike: 'Hero Splendor+', preferred_date: '', message: 'This is a test email from your website.' })
  .then((ok) => { console.log(ok ? `Sent! Check the inbox of ${process.env.NOTIFY_TO}` : 'Failed, see the error above.'); process.exit(ok ? 0 : 1); });
