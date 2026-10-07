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
    
    // ==================== 1. NEW ORDER NOTIFICATION, GOOGLE SHEET LOGGING & VOUCHER EMAIL ====================
    if (data.action === 'new_order' && data.order) {
      var order = data.order;
      var recipient = order.userEmail || (order.shippingAddress ? order.shippingAddress.email : '');
      var orderId = order.id || 'VX-ORDER';
      
      var emailBody = "Dear Customer,\n\n" +
        "Thank you for ordering with VOEUX® Car Electronics!\n\n" +
        "==========================================\n" +
        "VOEUX® DIRECT ORDER RECEIPT #" + orderId + "\n" +
        "==========================================\n" +
        "Order Date: " + (order.createdAt || new Date().toISOString()) + "\n" +
        "Total Amount: ₹" + (order.totalAmount || 0) + "\n" +
        "Payment Method: " + (order.paymentMethod || 'COD') + "\n" +
        "Payment ID: " + (order.paymentId || 'N/A') + "\n\n" +
        "SHIPPING ADDRESS:\n" +
        (order.shippingAddress ? order.shippingAddress.fullName + "\n" + order.shippingAddress.street + ", " + order.shippingAddress.city + " - " + order.shippingAddress.pincode : "N/A") + "\n\n";

      if (order.referral && order.referral.rewardVoucherCode) {
        emailBody += "==========================================\n" +
          "🎁 REFERRAL BONUS VOUCHER UNLOCKED!\n" +
          "==========================================\n" +
          "Voucher Code: " + order.referral.rewardVoucherCode + "\n" +
          "Value: ₹500 OFF on your next VOEUX purchase\n" +
          "Use this code during checkout or on WhatsApp to claim ₹500 OFF!\n" +
          "==========================================\n\n";
      }

      emailBody += "WhatsApp Customer Support: +91 9999484530\n" +
        "Official Office Email: voeuxoffice@gmail.com\n\n" +
        "Thank you for choosing VOEUX®!";

      // 1. ALWAYS Send Instant Order Alert to VOEUX Office
      var subjectOffice = "🚨 NEW ORDER RECEIVED #" + orderId + " — ₹" + (order.totalAmount || 0);
      var officeEmail = "voeuxoffice@gmail.com";
      try {
        MailApp.sendEmail({ to: officeEmail, subject: subjectOffice, body: emailBody, name: "VOEUX® Store Bot" });
      } catch(mErr1) {
        try {
          GmailApp.sendEmail(officeEmail, subjectOffice, emailBody, { name: "VOEUX® Store Bot" });
        } catch(e1){}
      }

      // 2. Send Order Receipt Email to Customer (if valid email provided)
      if (recipient && recipient.indexOf('@') > -1) {
        var subjectCust = "VOEUX® Order Receipt #" + orderId;
        try {
          MailApp.sendEmail({ to: recipient, subject: subjectCust, body: emailBody, name: "VOEUX® Official Store" });
        } catch(mErr2) {
          try {
            GmailApp.sendEmail(recipient, subjectCust, emailBody, { name: "VOEUX® Official Store" });
          } catch(e2){}
        }
      }

      // ========== SAVE ORDER DETAILS TO GOOGLE SHEET ==========
      try {
        var SPREADSHEET_ID = "1e0YB-NMRJd3PsWVL130zAGty_blg8XrQwNKvq4IA24E";
        var ss = null;
        try {
          ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        } catch(eOpen) {
          ss = SpreadsheetApp.getActiveSpreadsheet();
        }

        if (ss) {
          var orderSheet = ss.getSheetByName("Orders");
          if (!orderSheet) {
            orderSheet = ss.insertSheet("Orders");
          }
          if (orderSheet.getLastRow() === 0) {
            orderSheet.appendRow([
              "Order Date & Time",
              "Order ID",
              "Customer Name",
              "Customer Email",
              "Customer Phone",
              "Items Purchased",
              "Total Amount (₹)",
              "Payment ID",
              "Payment Method",
              "Shipping Address",
              "Order Status"
            ]);
          }
          
          var itemsFormatted = "";
          if (order.items && Array.isArray(order.items)) {
            itemsFormatted = order.items.map(function(it) {
              var pName = it.name || (it.product && it.product.name) || 'VOEUX Product';
              var qty = it.quantity || 1;
              var price = it.price || (it.product && it.product.price) || 0;
              return pName + " (Qty: " + qty + ", Price: ₹" + price + ")";
            }).join("; ");
          }

          var addrStr = order.shippingAddress ? (
            (order.shippingAddress.fullName || '') + ", " +
            (order.shippingAddress.street || '') + ", " +
            (order.shippingAddress.city || '') + " - " +
            (order.shippingAddress.pincode || '') + " (Ph: " +
            (order.shippingAddress.phone || order.shippingAddress.mobile || '') + ")"
          ) : 'N/A';

          orderSheet.appendRow([
            order.createdAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            orderId,
            order.shippingAddress ? (order.shippingAddress.fullName || order.userName || 'Customer') : (order.userName || 'Customer'),
            recipient,
            order.shippingAddress ? (order.shippingAddress.phone || order.shippingAddress.mobile || 'N/A') : 'N/A',
            itemsFormatted,
            order.totalAmount || 0,
            order.paymentId || 'N/A',
            order.paymentMethod || 'Razorpay',
            addrStr,
            order.status || 'ORDER PLACED'
          ]);
        }
      } catch(sheetErr) {
        Logger.log("Order Sheet Append Error: " + sheetErr.toString());
      }

      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", orderId: orderId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== 1B. ABANDONED CART AUTOMATED RECOVERY EMAIL ====================
    if (data.action === 'abandoned_cart_email' && data.cartSession) {
      var session = data.cartSession;
      var recipient = session.userEmail || session.email;
      var recipientName = session.userName || session.name || 'Valued Customer';
      var recoveryUrl = session.recoveryUrl || ('https://voeuxtechnologies.in/#restore-cart=' + (session.id || ''));
      var items = session.cart || [];
      
      var itemsListStr = items.map(function(item) {
        var p = item.product || item;
        var qty = item.quantity || 1;
        var price = p.price ? ('₹' + (typeof p.price === 'number' ? p.price.toLocaleString('en-IN') : p.price)) : '';
        return "• " + (p.name || 'VOEUX Product') + " (Qty: " + qty + ") " + price;
      }).join('\n');

      var emailSubject = "🛒 Don't leave your VOEUX® items behind! Complete your order now";
      var emailText = "Dear " + recipientName + ",\n\n" +
        "We noticed you left items in your shopping bag at VOEUX® Official Store:\n\n" +
        itemsListStr + "\n\n" +
        "Your reserved items are still waiting for you! Click the link below to resume your order directly with your items saved and account signed in:\n\n" +
        recoveryUrl + "\n\n" +
        "Need help completing your order? Chat with us on WhatsApp: +91 9999484530\n\n" +
        "Thank you for choosing VOEUX® Car Electronics!";

      if (recipient && recipient.indexOf('@') > -1) {
        try {
          GmailApp.sendEmail(recipient, emailSubject, emailText, {
            name: "VOEUX® Shopping Care",
            replyTo: "voeuxexperience@gmail.com"
          });
        } catch(mErr) {
          try {
            MailApp.sendEmail({
              to: recipient,
              subject: emailSubject,
              body: emailText,
              name: "VOEUX® Shopping Care",
              replyTo: "voeuxexperience@gmail.com"
            });
          } catch(e2){}
        }
      }

      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", sessionSent: session.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== 1C. PASSWORD RESET EMAIL NOTIFICATION ====================
    if (data.action === 'password_reset_email' && data.userEmail) {
      var recipient = data.userEmail;
      var recipientName = data.userName || 'Valued Customer';
      var emailSubject = "🔒 Your VOEUX® Account Password Has Been Reset";
      var emailText = "Dear " + recipientName + ",\n\n" +
        "Your password for your VOEUX® Official Store account has been updated successfully.\n\n" +
        "If you performed this action, no further steps are needed.\n" +
        "If you did not request this password change, please contact our support team immediately on WhatsApp: +91 9999484530.\n\n" +
        "Thank you for choosing VOEUX® Car Electronics!";

      if (recipient && recipient.indexOf('@') > -1) {
        try {
          GmailApp.sendEmail(recipient, emailSubject, emailText, { name: "VOEUX® Account Security" });
        } catch(mErr) {
          try {
            MailApp.sendEmail({ to: recipient, subject: emailSubject, body: emailText, name: "VOEUX® Account Security" });
          } catch(e2){}
        }
      }

      return ContentService
        .createTextOutput(JSON.stringify({ result: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ==================== 2. WAREHOUSE SHELF STORAGE SYNC ====================
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
    var SPREADSHEET_ID = "1e0YB-NMRJd3PsWVL130zAGty_blg8XrQwNKvq4IA24E";
    var sheet = null;
    try {
      var ssW = SpreadsheetApp.openById(SPREADSHEET_ID);
      sheet = ssW.getSheetByName("Warranty Registrations") || ssW.getActiveSheet();
    } catch(eW) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
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
        "Website: https://voeuxtechnologies.in\n\n" +
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
  var tokenUrl = 'https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api';
  var authHeader = 'Basic ' + Utilities.base64Encode(FLIPKART_APP_ID + ':' + FLIPKART_APP_SECRET);

  // Method 1: GET request with Basic Auth & query params (standard Flipkart Seller OAuth endpoint)
  var optionsGet = {
    method: 'GET',
    headers: {
      'Authorization': authHeader
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(tokenUrl, optionsGet);
    var code = response.getResponseCode();
    var body = response.getContentText();
    Logger.log('Auth GET response [' + code + ']: ' + body);

    if (code === 200) {
      var data = JSON.parse(body);
      if (data.access_token) return data.access_token;
    }
  } catch (e) {
    Logger.log('Auth GET exception: ' + e.toString());
  }

  // Method 2: POST request fallback
  var optionsPost = {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: 'grant_type=client_credentials&scope=Seller_Api',
    muteHttpExceptions: true
  };

  try {
    var postResponse = UrlFetchApp.fetch('https://api.flipkart.net/oauth-service/oauth/token', optionsPost);
    var postCode = postResponse.getResponseCode();
    var postBody = postResponse.getContentText();
    Logger.log('Auth POST response [' + postCode + ']: ' + postBody);

    if (postCode === 200) {
      var postData = JSON.parse(postBody);
      if (postData.access_token) return postData.access_token;
    }
  } catch (e) {
    Logger.log('Auth POST exception: ' + e.toString());
  }

  return null;
}

// ── STEP 2: Fetch Today's Shipments ──────────────────────────────────────
function fetchTodaysShipments(accessToken) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/filter/';
  var allShipments = [];
  
  var payload = {
    filter: {
      type: 'preDispatch',
      states: ['APPROVED', 'PACKED', 'READY_TO_DISPATCH']
    }
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
    Logger.log('Filter shipments (Page 1) [' + code + ']');

    if (code === 200) {
      var data = JSON.parse(body);
      allShipments = allShipments.concat(data.shipments || data.data || []);
      
      var hasMore = data.hasMore;
      var nextUrl = data.nextPageUrl;
      var page = 2;
      
      // Handle Pagination
      while (hasMore && nextUrl) {
        var fetchNextUrl = FLIPKART_BASE_URL.replace('/sellers', '') + nextUrl;
        if (nextUrl.indexOf('/sellers') > -1) {
          fetchNextUrl = 'https://api.flipkart.net' + nextUrl;
        }
        
        var nextOptions = {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
          },
          muteHttpExceptions: true
        };
        
        var nextResp = UrlFetchApp.fetch(fetchNextUrl, nextOptions);
        var nextCode = nextResp.getResponseCode();
        
        if (nextCode === 200) {
          var nextData = JSON.parse(nextResp.getContentText());
          allShipments = allShipments.concat(nextData.shipments || nextData.data || []);
          hasMore = nextData.hasMore;
          nextUrl = nextData.nextPageUrl;
          Logger.log('Filter shipments (Page ' + page + ') fetched.');
          page++;
        } else {
          Logger.log('Pagination failed with code ' + nextCode);
          hasMore = false;
        }
      }
    }
    return allShipments;
  } catch (e) {
    Logger.log('fetchShipments exception: ' + e.toString());
    return allShipments;
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
  var shipmentsList = shipmentIds.map(function(id) {
    return { shipmentId: id };
  });
  var payload = { shipments: shipmentsList };

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
    Logger.log('Pack response [' + response.getResponseCode() + ']: ' + response.getContentText().substring(0, 300));
  } catch (e) {
    Logger.log('packOrders exception: ' + e.toString());
  }
}

// ── STEP 5: Download Invoice PDFs ─────────────────────────────────────────
// Uses GET /v3/shipments/{ids}/labels — fetches Flipkart-generated merged label PDF
// for already-approved/packed shipments (does NOT require Pack API to succeed first)
function downloadInvoicePDFs(accessToken, shipmentIds) {
  var pdfAttachments = [];

  if (shipmentIds.length === 0) return pdfAttachments;

  // Strategy 1: GET merged PDF for all shipments at once (Flipkart-generated labels)
  try {
    var batchIds = shipmentIds.slice(0, 25).join(','); // max 25 per GET
    var mergedUrl = FLIPKART_BASE_URL + '/v3/shipments/' + batchIds + '/labels';
    var mergedResp = UrlFetchApp.fetch(mergedUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
      },
      muteHttpExceptions: true
    });
    var mergedCode = mergedResp.getResponseCode();
    Logger.log('Merged GET labels HTTP ' + mergedCode);
    if (mergedCode === 200) {
      var mergedBlob = mergedResp.getBlob();
      var mergedSize = mergedBlob.getBytes().length;
      if (mergedSize > 0) {
        mergedBlob.setContentType('application/pdf');
        mergedBlob.setName('Flipkart_All_Labels.pdf');
        pdfAttachments.push(mergedBlob);
        Logger.log('Merged labels PDF OK (' + mergedSize + ' bytes)');
      } else {
        Logger.log('Merged GET labels returned 0 bytes');
      }
    }
  } catch(e) {
    Logger.log('Merged GET labels exception: ' + e.toString());
  }

  // Strategy 2: Individual GET labels per shipment
  for (var i = 0; i < shipmentIds.length; i++) {
    var sid = shipmentIds[i];

    // Try GET /labels first (fetch Flipkart-generated label)
    try {
      var getUrl = FLIPKART_BASE_URL + '/v3/shipments/' + sid + '/labels';
      var getResp = UrlFetchApp.fetch(getUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
        },
        muteHttpExceptions: true
      });
      var getCode = getResp.getResponseCode();
      Logger.log('GET label [' + sid + '] HTTP ' + getCode);

      if (getCode === 200) {
        var getBlob = getResp.getBlob();
        var getSize = getBlob.getBytes().length;
        if (getSize > 0) {
          getBlob.setContentType('application/pdf');
          getBlob.setName('Label_' + sid + '.pdf');
          pdfAttachments.push(getBlob);
          Logger.log('Got label for ' + sid + ' (' + getSize + ' bytes)');
          if (i < shipmentIds.length - 1) Utilities.sleep(200);
          continue;
        }
      }
    } catch(e2) {
      Logger.log('GET label exception for ' + sid + ': ' + e2.toString());
    }

    // Fallback: POST labelOnly/pdf
    try {
      var postUrl = FLIPKART_BASE_URL + '/v3/shipments/' + sid + '/labelOnly/pdf';
      var postResp = UrlFetchApp.fetch(postUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
          'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
        },
        payload: JSON.stringify({ shipmentIds: [sid] }),
        muteHttpExceptions: true
      });
      var postCode = postResp.getResponseCode();
      Logger.log('POST labelOnly/pdf [' + sid + '] HTTP ' + postCode);

      if (postCode === 200) {
        var postBlob = postResp.getBlob();
        var postSize = postBlob.getBytes().length;
        if (postSize > 0) {
          postBlob.setContentType('application/pdf');
          postBlob.setName('Invoice_' + sid + '.pdf');
          pdfAttachments.push(postBlob);
          Logger.log('Got fallback PDF for ' + sid + ' (' + postSize + ' bytes)');
        } else {
          Logger.log('Label not ready for ' + sid + ' (both methods returned 0 bytes)');
        }
      }
    } catch(e3) {
      Logger.log('POST labelOnly/pdf exception for ' + sid + ': ' + e3.toString());
    }

    if (i < shipmentIds.length - 1) Utilities.sleep(200);
  }

  Logger.log('Total PDF attachments collected: ' + pdfAttachments.length);
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
    Logger.log('Dispatch response [' + response.getResponseCode() + ']: ' + response.getContentText().substring(0, 300));
  } catch (e) {
    Logger.log('dispatchOrders exception: ' + e.toString());
  }
}

// ── STEP 7: Email invoices to office ─────────────────────────────────────
function sendInvoicesToOffice(pdfAttachments, eligibleShipments) {
  var today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy');
  var subject = 'VOEUX® Flipkart Orders — ' + today + ' (' + eligibleShipments.length + ' orders)';

  var orderLines = eligibleShipments.map(function(s, idx) {
    var item = (s.orderItems && s.orderItems[0]) || (s.items && s.items[0]) || {};
    var itemTitle = item.sku || item.title || item.fsn || s.productName || 'VOEUX Item';
    var orderId = s.orderId || item.orderId || s.shipmentId || s.id || 'N/A';
    return (idx + 1) + '. Order ID: ' + orderId + ' | Product: ' + itemTitle;
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

// =============================================================================
// ABANDONED CART CRON DISPATCHER — Runs hourly via Apps Script Time Trigger
// Checks Firebase /abandoned_carts.json for carts older than 1 hour (3600000 ms)
// with status === 'PENDING' and emailSent !== true
// =============================================================================
function processAbandonedCartsCron() {
  try {
    var firebaseUrl = 'https://voeux-warehouse-default-rtdb.firebaseio.com/abandoned_carts.json';
    var response = UrlFetchApp.fetch(firebaseUrl, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return;
    
    var data = JSON.parse(response.getContentText());
    if (!data) return;

    var now = Date.now();
    var ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour

    Object.keys(data).forEach(function(key) {
      var session = data[key];
      if (!session) return;

      var isPending = session.status === 'PENDING';
      var notSent = !session.emailSent;
      var age = now - (session.timestamp || 0);

      if (isPending && notSent && age >= ONE_HOUR_MS && session.userEmail) {
        var recipient = session.userEmail;
        var recipientName = session.userName || 'Valued Customer';
        var recoveryUrl = session.recoveryUrl || ('https://voeuxtechnologies.in/#restore-cart=' + key);
        var items = session.cart || [];

        var itemsListStr = items.map(function(item) {
          var p = item.product || item;
          var qty = item.quantity || 1;
          var price = p.price ? ('₹' + (typeof p.price === 'number' ? p.price.toLocaleString('en-IN') : p.price)) : '';
          return "• " + (p.name || 'VOEUX Product') + " (Qty: " + qty + ") " + price;
        }).join('\n');

        var emailSubject = "🛒 Don't leave your VOEUX® items behind! Complete your order now";
        var emailText = "Dear " + recipientName + ",\n\n" +
          "We saved the items in your VOEUX® shopping bag:\n\n" +
          itemsListStr + "\n\n" +
          "Click the link below to resume your checkout directly with all your products ready and account signed in:\n\n" +
          recoveryUrl + "\n\n" +
          "WhatsApp Customer Support: +91 9999484530\n\n" +
          "Thank you for choosing VOEUX® Car Electronics!";

        try {
          GmailApp.sendEmail(recipient, emailSubject, emailText, { name: "VOEUX® Shopping Care" });
        } catch(e) {}

        // Mark as emailSent = true in Firebase
        try {
          UrlFetchApp.fetch('https://voeux-warehouse-default-rtdb.firebaseio.com/abandoned_carts/' + key + '/emailSent.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify(true)
          });
        } catch(e2){}
      }
    });
  } catch(err) {
    Logger.log('Abandoned Cart Cron Error: ' + err.toString());
  }
}
