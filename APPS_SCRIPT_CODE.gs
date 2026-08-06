/**
 * VOEUX® Google Apps Script
 * - doPost: Saves warranty registrations
 * - doGet:  Returns live Flipkart price (server-side, no CORS)
 * - refreshPrice(): Auto-fetches price, stores in Sheet cell B1 (for fallback)
 *
 * SETUP STEPS:
 * 1. Paste this code in Apps Script editor
 * 2. Click Run > refreshPrice() once to authorize external URL access
 * 3. Click Review Permissions > Allow
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone) - New Version
 * 5. Optional: Set up a time trigger on refreshPrice() every 30 minutes
 */

var FLIPKART_URL = 'https://www.flipkart.com/voeux-premium-x80-series-dual-knob-10-1-android-stereo-ahd-camera-4gb-64gb-car/p/itmac82d9bb03bba?pid=CDPHJTY3R9RNTTGT';

// ========== LIVE PRICE FETCHER (called by doGet & trigger) ==========
function fetchFlipkartPrice() {
  try {
    var options = {
      'method': 'GET',
      'muteHttpExceptions': true,
      'followRedirects': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    var response = UrlFetchApp.fetch(FLIPKART_URL, options);
    var html = response.getContentText();

    var price = null;
    var originalPrice = null;

    // Pattern 1: finalPrice in JS bundle (most reliable)
    var m1 = html.match(/"finalPrice"\s*:\s*\{[^}]*"value"\s*:\s*(\d+)/);
    if (m1) price = parseInt(m1[1]);

    // Pattern 2: effectivePrice
    if (!price) {
      var m2 = html.match(/"effectivePrice"\s*:\s*(\d+)/);
      if (m2) price = parseInt(m2[1]);
    }

    // Pattern 3: Generic "price" JSON-LD
    if (!price) {
      var m3 = html.match(/"price"\s*:\s*"?(\d{3,6})"?/);
      if (m3) price = parseInt(m3[1]);
    }

    // Pattern 4: Flipkart price HTML class  
    if (!price) {
      var m4 = html.match(/₹([\d,]+)<\/div>\s*<div[^>]*>(?:[\d]+%)/);
      if (m4) price = parseInt(m4[1].replace(/,/g, ''));
    }

    // MRP / Original Price
    var mrp1 = html.match(/"mrp"\s*:\s*(\d+)/);
    if (mrp1) originalPrice = parseInt(mrp1[1]);

    if (!originalPrice) {
      var mrp2 = html.match(/"totalMrpValue"\s*:\s*(\d+)/);
      if (mrp2) originalPrice = parseInt(mrp2[1]);
    }

    if (price && price > 500) {
      // Store in Sheet row 1 as a price cache
      try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1') 
                    || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        // Use row 1 col 10 (J1) as price cache — won't interfere with warranty data
        sheet.getRange('J1').setValue(price);
        sheet.getRange('K1').setValue(originalPrice || '');
        sheet.getRange('L1').setValue(new Date().toLocaleString('en-IN'));
      } catch(e) {}

      return { success: true, price: price, originalPrice: originalPrice, fetchedAt: new Date().toISOString() };
    }

    return { success: false, error: 'Price not found in page', htmlLength: html.length };

  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

// ========== REFRESH TRIGGER (run this once manually to authorize) ==========
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

// ========== doPost: Warranty Registration ==========
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.certificateId,
    data.name,
    data.purchaseDate,
    data.productPurchased,
    data.storeOutlet,
    data.phone,
    data.orderId,
    data.submittedAt,
    data.warrantyStatus
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
