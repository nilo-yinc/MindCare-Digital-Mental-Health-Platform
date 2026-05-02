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
      body: options.message || options.subject || 'New notification from MindCare',
      htmlBody: options.html || options.message || options.subject,
      type: 'notification'
    };

    console.log(`[Email] Attempting to send to: ${options.email}`);

    const response = await axios.post(webhookUrl, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'text/plain',
      },
      timeout: 10000 // 10s timeout
    });
    
    console.log(`[Email] Apps Script responded: ${response.status}`);
    
    return true; 
  } catch (error) {
    const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Email] Failed to send: ${errorDetail}`);
    return false;
  }
};

module.exports = sendEmail;
