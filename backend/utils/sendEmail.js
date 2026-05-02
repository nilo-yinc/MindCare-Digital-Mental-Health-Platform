const axios = require('axios');

/**
 * Sends an email using Google Apps Script Webhook.
 * Expects APPS_SCRIPT_WEBHOOK_URL in .env
 */
const sendEmail = async (options) => {
  try {
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('APPS_SCRIPT_WEBHOOK_URL not found in .env. Falling back to console log.');
      console.log('--- EMAIL MOCK ---');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
      console.log('------------------');
      return true;
    }

    const payload = {
      to: options.email,
      subject: options.subject,
      body: options.message,
      htmlBody: options.html || options.message,
      type: 'notification'
    };

    console.log('Sending email via Apps Script to:', options.email);

    const response = await axios.post(webhookUrl, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'text/plain', // Apps Script often handles text/plain better to avoid preflight OPTIONS
      },
    });
    
    console.log('Apps Script response status:', response.status);
    
    // Apps Script usually returns 200 even if it redirects or fails internally if not handled.
    // But we check if it was successful.
    return true; 
  } catch (error) {
    console.error('Error sending email via Apps Script:', error.response ? error.response.data : error.message);
    // Even if email fails, let's log it but maybe return true so registration doesn't 500?
    // No, better to return false so user knows email failed.
    return false;
  }
};

module.exports = sendEmail;
