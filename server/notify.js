// Emails the showroom owner when a customer sends an enquiry.
// Configured with environment variables (see .env.example); with none set it does nothing.
const nodemailer = require('nodemailer');

const TYPE_LABEL = { general: 'General enquiry', test_ride: 'Test ride', price: 'Price / offers', finance: 'Finance / EMI',
                     exchange: 'Exchange', service: 'Service', contact: 'Message' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();

let transport;
function configured() {
  return !!(process.env.NOTIFY_TO && process.env.SMTP_USER && process.env.SMTP_PASS);
}
function getTransport() {
  return transport ||= nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: String(process.env.SMTP_PASS).replace(/\s+/g, '') },
  });
}

// e: { name, phone, type, bike, preferred_date, message }. Never throws: a mail problem must not break the customer's enquiry.
async function sendEnquiryEmail(e) {
  if (!configured()) return false;
  const type = TYPE_LABEL[e.type] || e.type;
  const rows = [['Request', type], ['Name', e.name], ['Mobile', e.phone], ['Bike', e.bike], ['Preferred date', e.preferred_date], ['Message', e.message]]
    .filter(([, v]) => v);
  const text = rows.map(([k, v]) => `${k}: ${oneLine(v)}`).join('\n') + `\n\nCall or WhatsApp: https://wa.me/91${e.phone}`;
  const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:520px">
    <h2 style="margin:0 0 12px">New enquiry: ${esc(type)}</h2>
    <table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`).join('')}</table>
    <p style="margin-top:18px"><a href="tel:+91${esc(e.phone)}" style="background:#d62828;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Call ${esc(e.phone)}</a>
      &nbsp; <a href="https://wa.me/91${esc(e.phone)}" style="background:#1fa855;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">WhatsApp</a></p>
    <p style="color:#888;font-size:12px">Divya Shakti Motors website. Update the status in the admin panel, Enquiries tab.</p></div>`;
  try {
    await getTransport().sendMail({
      from: `"Divya Shakti Motors website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO,
      subject: oneLine(`New enquiry: ${type} - ${e.name}${e.bike ? ' - ' + e.bike : ''}`).slice(0, 150),
      text, html,
    });
    return true;
  } catch (err) {
    console.error('Enquiry email failed:', err.message);
    return false;
  }
}

module.exports = { sendEnquiryEmail, configured };
