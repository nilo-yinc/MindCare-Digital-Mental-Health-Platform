/**
 * MindCare Google Apps Script Webhook
 * 
 * Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project.
 * 3. Paste this code into the editor.
 * 4. Click 'Deploy' -> 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Execute as: 'Me'.
 * 7. Who has access: 'Anyone'.
 * 8. Copy the Web App URL and paste it into your backend .env as APPS_SCRIPT_WEBHOOK_URL.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    var body = data.body || "No plain text body provided.";

    // Send the email
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Email sent" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function to verify it's working
function testEmail() {
  MailApp.sendEmail({
    to: "YOUR_EMAIL_HERE",
    subject: "Test from MindCare",
    body: "If you receive this, the script is working!"
  });
}
