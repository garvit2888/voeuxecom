/**
 * VOEUX® Google Apps Script
 * - doPost: Saves warranty registrations to Sheet & emails Warranty Certificate to customer with exact Expiry Date
 * - doGet:  Returns live Flipkart price (server-side, no CORS)
 * - refreshPrice(): Auto-fetches price
 */

var FLIPKART_URL = 'https://www.flipkart.com/voeux-premium-x80-series-dual-knob-10-1-android-stereo-ahd-camera-4gb-64gb-car/p/itmac82d9bb03bba?pid=CDPHJTY3R9RNTTGT';

// ========== LIVE PRICE FETCHER ==========
function fetchFlipkartPrice() {
  try {
    var options = {
      'method': 'GET',
      'muteHttpExceptions': true,
      'followRedirects': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9'
      }
    };

    var response = UrlFetchApp.fetch(FLIPKART_URL, options);
    var html = response.getContentText();

    var price = null;
    var originalPrice = null;

    var m1 = html.match(/"finalPrice"\s*:\s*\{[^}]*"value"\s*:\s*(\d+)/);
    if (m1) price = parseInt(m1[1]);

    if (!price) {
      var m2 = html.match(/"effectivePrice"\s*:\s*(\d+)/);
      if (m2) price = parseInt(m2[1]);
    }

    if (!price) {
      var m3 = html.match(/"price"\s*:\s*"?(\d{3,6})"?/);
      if (m3) price = parseInt(m3[1]);
    }

    var mrp1 = html.match(/"mrp"\s*:\s*(\d+)/);
    if (mrp1) originalPrice = parseInt(mrp1[1]);

    if (price && price > 500) {
      return { success: true, price: price, originalPrice: originalPrice, fetchedAt: new Date().toISOString() };
    }

    return { success: false, error: 'Price not found in page' };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function refreshPrice() {
  var result = fetchFlipkartPrice();
  Logger.log(JSON.stringify(result));
  return result;
}

// ========== doGet: API endpoint called by the website ==========
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  if (action === 'getPrice') {
    var result = fetchFlipkartPrice();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'VOEUX API running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== doPost: Warranty Registration & Automatic Email Delivery ==========
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
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
      var subject = "VOEUX® Official Warranty Certificate - " + (data.certificateId || '');
      var body = 
        "Dear " + (data.name || 'Valued Customer') + ",\n\n" +
        "Congratulations! Your 1-Year Official Warranty for your VOEUX® product has been activated successfully.\n\n" +
        "==========================================\n" +
        "VOEUX® WARRANTY CERTIFICATE\n" +
        "==========================================\n" +
        "Certificate ID: " + (data.certificateId || 'VX-WRTY-ACTIVE') + "\n" +
        "Product Name: " + (data.productPurchased || 'VOEUX Electronics') + "\n" +
        "Date of Purchase: " + (data.purchaseDate || '') + "\n" +
        "Warranty End Date: " + (data.warrantyExpires || '') + "\n" +
        "Purchased From: " + (data.storeOutlet || '') + "\n" +
        "Order / Invoice ID: " + (data.orderId || 'N/A') + "\n" +
        "Warranty Status: ACTIVE (1-Year Official Warranty)\n" +
        "==========================================\n\n" +
        "Please keep this email for your records.\n\n" +
        "Need technical assistance or warranty support?\n" +
        "WhatsApp Support: +91 9999484530 (Mon-Sat 11 AM - 6 PM)\n" +
        "Website: https://voeux.in\n\n" +
        "Thank you for choosing VOEUX® Car Electronics!\n\n" +
        "Best Regards,\n" +
        "VOEUX® Customer Support Team";

      MailApp.sendEmail(data.email, subject, body);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
