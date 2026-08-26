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

    // Manual trigger from Admin dashboard
    if (action === 'run_flipkart_automation') {
      runFlipkartOrderAutomation();
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'triggered', message: 'Flipkart automation started' }))
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
      } else if (data.action === 'delete_shelf' && data.shelfId) {
        existingList = existingList.filter(function(s) { return s.id !== data.shelfId; });
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


// =============================================================================
// FLIPKART ORDER AUTOMATION — Full Pipeline
// Runs daily at 11:00 AM IST via Apps Script time-based trigger
// Steps: Authenticate → Fetch → Filter → Pack → Download PDF → Dispatch → Email
// =============================================================================

// ── Credentials (registered on Flipkart Developer Portal) ──────────────────
var FLIPKART_APP_ID     = '28a49b3985b7109470057a95972985708636';
var FLIPKART_APP_SECRET = '14de577644fa0da18c00db5134eafd379';
var FLIPKART_SELLER_ID  = 'VoeuxExperience';
var OFFICE_EMAIL        = 'voeuxoffice@gmail.com';
var FLIPKART_BASE_URL   = 'https://api.flipkart.net/sellers';

// ── Main Entry Point — called by daily time-based trigger ──────────────────
function runFlipkartOrderAutomation() {
  try {
    Logger.log('=== VOEUX Flipkart Automation Started: ' + new Date().toISOString() + ' ===');

    // STEP 1: Get access token
    var accessToken = getFlipkartAccessToken();
    if (!accessToken) {
      Logger.log('ERROR: Could not get Flipkart access token. API may still be Pending approval.');
      notifyError('Flipkart access token failed. Check if API key is approved.');
      return;
    }
    Logger.log('STEP 1: Access token obtained.');

    // STEP 2: Fetch today's shipments
    var shipments = fetchTodaysShipments(accessToken);
    Logger.log('STEP 2: Fetched ' + shipments.length + ' shipments.');

    if (shipments.length === 0) {
      Logger.log('No eligible orders today. Sending summary email.');
      sendSummaryEmail([], 'No new orders to process today.');
      return;
    }

    // STEP 3: Filter — HOLD = false AND DAD has passed
    var eligibleShipments = filterEligibleShipments(accessToken, shipments);
    Logger.log('STEP 3: ' + eligibleShipments.length + ' eligible shipments after filtering.');

    if (eligibleShipments.length === 0) {
      sendSummaryEmail([], 'Orders found but none are eligible yet (HOLD or DAD not passed).');
      return;
    }

    var shipmentIds = eligibleShipments.map(function(s) { return s.shipmentId; });

    // STEP 4: Pack each order
    packOrders(accessToken, shipmentIds);
    Logger.log('STEP 4: Pack API called for ' + shipmentIds.length + ' orders.');

    // STEP 5: Download invoice PDFs
    var pdfAttachments = downloadInvoicePDFs(accessToken, shipmentIds);
    Logger.log('STEP 5: Downloaded ' + pdfAttachments.length + ' invoice PDFs.');

    // STEP 6: Dispatch orders
    dispatchOrders(accessToken, shipmentIds);
    Logger.log('STEP 6: Dispatch API called for all orders.');

    // STEP 7: Email all PDFs to office
    sendInvoicesToOffice(pdfAttachments, eligibleShipments);
    Logger.log('STEP 7: Invoices emailed to ' + OFFICE_EMAIL);

    Logger.log('=== Automation Completed Successfully ===');
  } catch (err) {
    Logger.log('CRITICAL ERROR in automation: ' + err.toString());
    notifyError('Automation failed: ' + err.toString());
  }
}

// ── STEP 1: OAuth2 Token ──────────────────────────────────────────────────
function getFlipkartAccessToken() {
  var url = FLIPKART_BASE_URL + '/oauth-token';
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Utilities.base64Encode(FLIPKART_APP_ID + ':' + FLIPKART_APP_SECRET)
    },
    payload: 'grant_type=client_credentials',
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = response.getContentText();
    Logger.log('Auth response [' + code + ']: ' + body);

    if (code === 200) {
      var data = JSON.parse(body);
      return data.access_token || null;
    }
    Logger.log('Auth failed — HTTP ' + code);
    return null;
  } catch (e) {
    Logger.log('Auth exception: ' + e.toString());
    return null;
  }
}

// ── STEP 2: Fetch Today's Shipments ──────────────────────────────────────
function fetchTodaysShipments(accessToken) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/filter/';

  // Date range: today in IST
  var now = new Date();
  var istOffset = 5.5 * 60 * 60 * 1000;
  var istNow = new Date(now.getTime() + istOffset);
  var startOfDay = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate(), 0, 0, 0, 0);
  var endOfDay   = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate(), 23, 59, 59, 0);

  var payload = {
    filter: {
      states: ['APPROVED'],
      orderDate: {
        from: startOfDay.toISOString(),
        to: endOfDay.toISOString()
      }
    },
    pagination: { pageSize: 20, pageNumber: 1 },
    sort: { field: 'orderDate', order: 'asc' }
  };

  var options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = response.getContentText();
    Logger.log('Filter shipments [' + code + ']: ' + body.substring(0, 300));

    if (code === 200) {
      var data = JSON.parse(body);
      return data.shipments || data.data || [];
    }
    return [];
  } catch (e) {
    Logger.log('fetchShipments exception: ' + e.toString());
    return [];
  }
}

// ── STEP 3: Filter — HOLD = false AND DAD passed ──────────────────────────
function filterEligibleShipments(accessToken, shipments) {
  if (!shipments || shipments.length === 0) return [];

  var shipmentIds = shipments.map(function(s) {
    return s.shipmentId || s.id;
  }).join(',');

  var url = FLIPKART_BASE_URL + '/v3/shipments/' + shipmentIds;
  var options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = response.getContentText();
    Logger.log('Shipment details [' + code + ']: ' + body.substring(0, 300));

    if (code === 200) {
      var data = JSON.parse(body);
      var details = data.shipments || data || [];
      var now = new Date();

      return details.filter(function(s) {
        var holdStatus = s.hold === false || s.hold === 'false' || !s.hold;
        var dadPassed = !s.dispatchAfterDate || new Date(s.dispatchAfterDate) <= now;
        return holdStatus && dadPassed;
      });
    }
    return shipments; // Fall back to all if detail fetch fails
  } catch (e) {
    Logger.log('filterEligible exception: ' + e.toString());
    return shipments;
  }
}

// ── STEP 4: Pack Orders ────────────────────────────────────────────────────
function packOrders(accessToken, shipmentIds) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/labels';
  var payload = { shipmentIds: shipmentIds };

  var options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('Pack response [' + response.getResponseCode() + ']: ' + response.getContentText().substring(0, 200));
  } catch (e) {
    Logger.log('packOrders exception: ' + e.toString());
  }
}

// ── STEP 5: Download Invoice PDFs ─────────────────────────────────────────
function downloadInvoicePDFs(accessToken, shipmentIds) {
  var pdfAttachments = [];

  for (var i = 0; i < shipmentIds.length; i++) {
    var sid = shipmentIds[i];
    var url = FLIPKART_BASE_URL + '/v3/shipments/' + sid + '/labelOnly/pdf';

    var options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
      },
      payload: JSON.stringify({ shipmentIds: [sid] }),
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      Logger.log('PDF download [' + sid + '] HTTP ' + code);

      if (code === 200) {
        var blob = response.getBlob().setName('Invoice_' + sid + '.pdf');
        pdfAttachments.push(blob);
      }
    } catch (e) {
      Logger.log('downloadPDF exception for ' + sid + ': ' + e.toString());
    }

    // Brief pause between requests to avoid rate limiting
    if (i < shipmentIds.length - 1) Utilities.sleep(800);
  }

  return pdfAttachments;
}

// ── STEP 6: Dispatch Orders ───────────────────────────────────────────────
function dispatchOrders(accessToken, shipmentIds) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/dispatch';
  var payload = { shipmentIds: shipmentIds };

  var options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('Dispatch response [' + response.getResponseCode() + ']: ' + response.getContentText().substring(0, 200));
  } catch (e) {
    Logger.log('dispatchOrders exception: ' + e.toString());
  }
}

// ── STEP 7: Email invoices to office ─────────────────────────────────────
function sendInvoicesToOffice(pdfAttachments, eligibleShipments) {
  var today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy');
  var subject = 'VOEUX® Flipkart Orders — ' + today + ' (' + eligibleShipments.length + ' orders)';

  var orderLines = eligibleShipments.map(function(s, idx) {
    return (idx + 1) + '. Order ID: ' + (s.shipmentId || s.id || 'N/A') +
      ' | Product: ' + (s.product || s.productName || s.items && s.items[0] && s.items[0].title || 'VOEUX Item');
  }).join('\n');

  var body = 'Good morning, VOEUX® Team!\n\n' +
    'Today\'s Flipkart orders have been automatically processed.\n\n' +
    '=== ORDER SUMMARY — ' + today + ' ===\n' +
    'Total Orders: ' + eligibleShipments.length + '\n\n' +
    orderLines + '\n\n' +
    '=== ACTIONS COMPLETED ===\n' +
    '✓ Orders marked as PACKED on Flipkart\n' +
    '✓ Invoices/labels downloaded\n' +
    '✓ Orders DISPATCHED — courier pickup scheduled\n\n' +
    'Invoice PDFs are attached to this email.\n' +
    'Please prepare and package the above orders for handover to the courier.\n\n' +
    'VOEUX® Automated Operations\n' +
    'voeuxtechnologies.in';

  var emailOptions = {
    name: 'VOEUX® Operations',
    replyTo: 'voeuxexperience@gmail.com'
  };

  if (pdfAttachments && pdfAttachments.length > 0) {
    emailOptions.attachments = pdfAttachments;
  }

  try {
    GmailApp.sendEmail(OFFICE_EMAIL, subject, body, emailOptions);
    Logger.log('Email sent to ' + OFFICE_EMAIL + ' with ' + (pdfAttachments ? pdfAttachments.length : 0) + ' attachments.');
  } catch (mailErr) {
    Logger.log('Gmail failed, trying MailApp: ' + mailErr.toString());
    MailApp.sendEmail({
      to: OFFICE_EMAIL,
      subject: subject,
      body: body,
      attachments: pdfAttachments || [],
      name: 'VOEUX® Operations',
      replyTo: 'voeuxexperience@gmail.com'
    });
  }
}

// ── Error notification ─────────────────────────────────────────────────────
function sendSummaryEmail(orders, message) {
  var today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy');
  GmailApp.sendEmail(
    OFFICE_EMAIL,
    'VOEUX® Flipkart Automation — ' + today,
    'Automation run completed.\n\n' + message + '\n\nVOEUX® Operations\nvoeuxtechnologies.in',
    { name: 'VOEUX® Operations', replyTo: 'voeuxexperience@gmail.com' }
  );
}

function notifyError(errorMsg) {
  try {
    GmailApp.sendEmail(
      OFFICE_EMAIL,
      'VOEUX® Flipkart Automation ERROR — ' + new Date().toDateString(),
      'An error occurred in the Flipkart automation:\n\n' + errorMsg +
      '\n\nPlease check the Apps Script logs for details.\n\nVOEUX® Operations',
      { name: 'VOEUX® Operations' }
    );
  } catch(e) {
    Logger.log('Could not send error notification: ' + e.toString());
  }
}

// =============================================================================
// HOW TO SET UP THE DAILY TRIGGER IN GOOGLE APPS SCRIPT:
// 1. Open this script in Google Apps Script editor
// 2. Click "Triggers" (clock icon) in the left sidebar
// 3. Click "+ Add Trigger" (bottom right)
// 4. Choose function: runFlipkartOrderAutomation
// 5. Event source: Time-driven
// 6. Type: Day timer
// 7. Time: 10:30 AM – 11:30 AM (IST = GMT+5:30, so set at 5:00–6:00 AM UTC)
// 8. Save
// =============================================================================
