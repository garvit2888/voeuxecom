// ========== Google Apps Script for VOEUX Warranty Registration & Warehouse QR Sync ==========
// Note: Deploy this script in Google Apps Script (voeuxexperience@gmail.com account) 
// as a Web App with access set to "Anyone" (even anonymous).

function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : '';
    
    // Fetch all warehouse shelf records from cloud storage
    if (action === 'get_shelves') {
      var props = PropertiesService.getScriptProperties();
      var rawShelves = props.getProperty('VOEUX_WAREHOUSE_SHELVES') || '[]';
      return ContentService
        .createTextOutput(rawShelves)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "VOEUX Apps Script Active" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // ==================== 1. WAREHOUSE SHELF STORAGE SYNC ====================
    if (data.action === 'sync_shelves' || data.action === 'save_shelf') {
      var props = PropertiesService.getScriptProperties();
      var existingRaw = props.getProperty('VOEUX_WAREHOUSE_SHELVES') || '[]';
      var existingList = [];
      try { existingList = JSON.parse(existingRaw); } catch(pErr) { existingList = []; }

      if (data.action === 'save_shelf' && data.shelf) {
        var shelf = data.shelf;
        var idx = existingList.findIndex(function(s) { return s.id === shelf.id; });
        if (idx > -1) {
          existingList[idx] = shelf;
        } else {
          existingList.unshift(shelf);
        }
      } else if (data.shelves && Array.isArray(data.shelves)) {
        existingList = data.shelves;
      }

      props.setProperty('VOEUX_WAREHOUSE_SHELVES', JSON.stringify(existingList));

      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", count: existingList.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== 2. WARRANTY REGISTRATION & EMAIL ====================
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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

    // Send Warranty Certificate Email to Customer
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
        
      try {
        GmailApp.sendEmail(data.email, subject, message, {
          name: "VOEUX® Official Warranty Care",
          from: "voeuxexperience@gmail.com",
          replyTo: "voeuxexperience@gmail.com"
        });
      } catch (mailErr) {
        MailApp.sendEmail({
          to: data.email,
          subject: subject,
          body: message,
          name: "VOEUX® Official Warranty Care",
          replyTo: "voeuxexperience@gmail.com"
        });
      }
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
