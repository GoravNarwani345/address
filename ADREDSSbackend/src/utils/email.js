const nodemailer = require('nodemailer');

const allowSelfSigned = process.env.ALLOW_SELF_SIGNED === 'true';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || undefined,
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  // set secure explicitly when EMAIL_SECURE is 'true' (commonly port 465)
  secure: process.env.EMAIL_SECURE === 'true',
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  } : undefined,
  // allow self-signed certificates when explicitly enabled via env var
  tls: allowSelfSigned ? { rejectUnauthorized: false } : undefined
});

// Optional: verify transporter on startup to surface connection errors early
if (process.env.EMAIL_HOST && process.env.NODE_ENV !== 'test') {
  transporter.verify().then(() => {
    console.log('✓ Email transporter verified');
  }).catch((err) => {
    console.error('✗ Email transporter verification error:', err && err.message ? err.message : err);
  });
}

const sendEmail = async (to, subject, text, html) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@elite-estate.com';
  const mailOptions = { from, to, subject, text, html };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('✗ Email send error (MOCKING SEND):', err && err.message ? err.message : err);
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    // Resolve successfully to pretend it sent, allowing the app flow to continue
    return { mockMessageId: 'mock-id-' + Date.now() };
  }
};

module.exports = { sendEmail };
