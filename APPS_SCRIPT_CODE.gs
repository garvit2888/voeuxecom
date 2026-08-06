// ========== Google Apps Script for VOEUX Warranty Registration & Emailing ==========
// Official Sender Account: voeuxexperience@gmail.com

// IMPORTANT: Run this 'testEmail' function ONCE by clicking 'Run' at the top of Apps Script 
// while logged in as voeuxexperience@gmail.com to grant Google permission to send emails!
function testEmail() {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "VOEUX Test Email Authorization",
    body: "Email authorization is active! Web app will now automatically email customers from voeuxexperience@gmail.com.",
    name: "VOEUX® Official Warranty Care",
    replyTo: "voeuxexperience@gmail.com"
  });
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // 1. Save warranty registration row to Google Sheet
    sheet.appendRow([
      data.certificateId || '',
      data.name || '',
      data.email || '',
      data.phone || '',
      data.purchaseDate || '',
      data.warrantyExpires || '',
      data.productPurchased || '',
      data.storeOutlet || '',
      data.orderId || '',
      data.submittedAt || '',
      data.warrantyStatus || 'ACTIVE'
    ]);

    // 2. Send Warranty Certificate Email to Customer from voeuxexperience@gmail.com
    if (data.email && data.email.indexOf('@') > -1) {
      var subject = "VOEUX Warranty Certificate - " + (data.certificateId || '');
      var message = "Dear " + (data.name || 'Valued Customer') + ",\n\n" +
        "Your VOEUX® 1-Year Warranty has been registered successfully!\n\n" +
        "==========================================\n" +
        "VOEUX® OFFICIAL WARRANTY CERTIFICATE\n" +
        "==========================================\n" +
        "Certificate ID: " + (data.certificateId || '') + "\n" +
        "Customer Name: " + (data.name || '') + "\n" +
        "Product Purchased: " + (data.productPurchased || '') + "\n" +
        "Date of Purchase: " + (data.purchaseDate || '') + "\n" +
        "Warranty End Date: " + (data.warrantyExpires || '') + "\n" +
        "Store / Outlet: " + (data.storeOutlet || '') + "\n" +
        "Status: ACTIVE (1-Year Official Warranty)\n" +
        "==========================================\n\n" +
        "WhatsApp Customer Support: +91 9999484530 (Mon-Sat 11 AM - 6 PM)\n" +
        "Official Email: voeuxexperience@gmail.com\n" +
        "Website: https://voeux.in\n\n" +
        "Thank you for choosing VOEUX® Car Electronics!";
        
      MailApp.sendEmail({
        to: data.email,
        subject: subject,
        body: message,
        name: "VOEUX® Official Warranty Care",
        replyTo: "voeuxexperience@gmail.com"
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
