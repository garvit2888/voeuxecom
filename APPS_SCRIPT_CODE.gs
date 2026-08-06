function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // 1. Save warranty registration row to Google Sheet
  sheet.appendRow([
    data.certificateId,
    data.name,
    data.email,
    data.phone,
    data.purchaseDate,
    data.warrantyExpires,
    data.productPurchased,
    data.storeOutlet,
    data.orderId,
    data.submittedAt,
    data.warrantyStatus
  ]);

  // 2. Send Warranty Certificate Email to Customer
  if (data.email) {
    var subject = "VOEUX Warranty Certificate - " + data.certificateId;
    var message = "Hello " + data.name + ",\n\n" +
      "Your VOEUX® 1-Year Warranty is successfully registered!\n\n" +
      "==========================================\n" +
      "Certificate ID: " + data.certificateId + "\n" +
      "Product: " + data.productPurchased + "\n" +
      "Purchase Date: " + data.purchaseDate + "\n" +
      "Warranty End Date: " + data.warrantyExpires + "\n" +
      "Store / Outlet: " + data.storeOutlet + "\n" +
      "Status: ACTIVE\n" +
      "==========================================\n\n" +
      "WhatsApp Support: +91 9999484530\n\n" +
      "Thank you for choosing VOEUX® Car Electronics!";
      
    MailApp.sendEmail(data.email, subject, message);
  }

  return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
}
