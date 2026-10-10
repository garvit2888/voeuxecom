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
        "Total Paid: ₹" + (order.totalAmount || 0) + "\n" +
        (order.appliedVoucherCode ? "Coupon/Referral Applied: " + order.appliedVoucherCode + "\n" : "") +
        (order.referral && order.referral.discountApplied ? "Discount Saved: -₹" + order.referral.discountApplied + "\n" : "") +
        "Payment Method: " + (order.paymentMethod || 'COD') + "\n" +
        "Payment ID: " + (order.paymentId || 'N/A') + "\n\n" +
        "ITEMS ORDERED:\n" +
        (order.items ? order.items.map(function(it) {
           var extras = [];
           if (it.carMake) extras.push("Make: " + it.carMake);
           if (it.carModel) extras.push("Model: " + it.carModel);
           if (it.carYear) extras.push("Year: " + it.carYear);
           if (it.selectedVariant) extras.push("Variant: " + it.selectedVariant);
           var extraStr = extras.length > 0 ? " [" + extras.join(", ") + "]" : "";
           return "- " + it.name + " (x" + (it.quantity||1) + ")" + extraStr;
        }).join("\n") : "N/A") + "\n\n" +
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
              "Total Paid (₹)",
              "Discount/Coupon Applied",
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
              
              var extras = [];
              if (it.carMake) extras.push("Make: " + it.carMake);
              if (it.carModel) extras.push("Model: " + it.carModel);
              if (it.carYear) extras.push("Year: " + it.carYear);
              if (it.selectedVariant) extras.push("Variant: " + it.selectedVariant);
              
              var extraStr = extras.length > 0 ? " [" + extras.join(", ") + "]" : "";

              return pName + " (Qty: " + qty + ", Price: ₹" + price + ")" + extraStr;
            }).join(" | ");
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
            order.appliedVoucherCode ? (order.appliedVoucherCode + " (-₹" + (order.referral ? order.referral.discountApplied || 0 : 0) + ")") : 'None',
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

    // STEP 3B: Ignore shipments already packed/handed to the team on a PREVIOUS day (left over)
    var processedLog = loadProcessedShipments();
    var todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
    var carryoverShipments = [];
    var todaysShipments = [];
    eligibleShipments.forEach(function(s) {
      var why = leftoverReason(s, processedLog, todayStr);
      Logger.log('Shipment ' + (s.orderId || (s.orderItems && s.orderItems[0] && s.orderItems[0].orderId) || '?') +
        ' | status=' + getShipmentStatus(s) + ' | updatedAt=' + getShipmentUpdatedAt(s) + ' | ' + (why ? 'IGNORED: ' + why : 'today'));
      if (why) carryoverShipments.push(s); else todaysShipments.push(s);
    });
    eligibleShipments = todaysShipments;
    Logger.log('STEP 3B: Ignoring ' + carryoverShipments.length + ' leftover shipment(s) from previous days; ' + eligibleShipments.length + ' for today.');

    var shipmentIds = eligibleShipments.map(function(s) { return s.shipmentId; });

    // STEP 4: Pack each order
    packOrders(accessToken, eligibleShipments);
    Logger.log('STEP 4: Pack API called for ' + shipmentIds.length + ' orders.');

    // STEP 5: Download invoice PDFs
    var downloadResult = downloadInvoicePDFs(accessToken, shipmentIds);
    var pdfAttachments = downloadResult.attachments;
    var readyShipmentIds = downloadResult.readySids;
    Logger.log('STEP 5: Downloaded merged PDF. Identified ' + readyShipmentIds.length + ' ready shipments.');

    // Remember today's handed-over shipments so tomorrow they are ignored
    saveProcessedShipments(processedLog, readyShipmentIds, todayStr);

    // STEP 5B: Identify Ready Shipments for Dispatch
    var readyShipments = eligibleShipments.filter(function(s) {
      return readyShipmentIds.indexOf(s.shipmentId || s.id) > -1;
    });

    // STEP 6: Dispatch orders (ONLY READY ONES)
    if (readyShipments.length > 0) {
      var locationGroups = {};
      readyShipments.forEach(function(s) {
        var loc = s.locationId || 'default';
        var sid = s.shipmentId || s.id;
        if (!locationGroups[loc]) locationGroups[loc] = [];
        locationGroups[loc].push(sid);
      });

      Object.keys(locationGroups).forEach(function(loc) {
        dispatchOrders(accessToken, locationGroups[loc], loc !== 'default' ? loc : null);
      });
      Logger.log('STEP 6: Dispatch API called for ' + readyShipments.length + ' ready orders across ' + Object.keys(locationGroups).length + ' locations.');
    } else {
      Logger.log('STEP 6: Skipped dispatch. No orders ready.');
    }

    // STEP 6A: Leftovers from earlier days are not in the email/PDF, but still try to dispatch them
    if (carryoverShipments.length > 0) {
      var coGroups = {};
      carryoverShipments.forEach(function(s) {
        var loc = s.locationId || 'default';
        if (!coGroups[loc]) coGroups[loc] = [];
        coGroups[loc].push(s.shipmentId || s.id);
      });
      Object.keys(coGroups).forEach(function(loc) {
        dispatchOrders(accessToken, coGroups[loc], loc !== 'default' ? loc : null);
      });
    }

    // STEP 6B: Fetch SKUs from Order API since Shipment API doesn't return them
    var allOrderItemIds = [];
    eligibleShipments.forEach(function(s) {
      (s.orderItems || []).forEach(function(it) { if (it.id) allOrderItemIds.push(it.id); });
    });
    var skuMap = fetchSKUs(accessToken, allOrderItemIds);
    var titleMap = fetchProductTitles(accessToken, Object.keys(skuMap).map(function(k) { return skuMap[k]; }));

    // STEP 7: Email all PDFs to office
    sendInvoicesToOffice(pdfAttachments, eligibleShipments, skuMap, readyShipmentIds, titleMap);
    Logger.log('STEP 7: Invoices emailed to ' + OFFICE_EMAIL);

    Logger.log('=== Automation Completed Successfully ===');
  } catch (err) {
    Logger.log('CRITICAL ERROR in automation: ' + err.toString());
    notifyError('Automation failed: ' + err.toString());
  }
}

// Order IDs to always ignore (e.g. already handed over before this feature existed)
var MANUAL_IGNORE_ORDER_IDS = ['OD438814891465862100'];

function getShipmentStatus(s) {
  var st = s.status || s.state || (s.orderItems && s.orderItems[0] && (s.orderItems[0].status || s.orderItems[0].state)) || '';
  return String(st).toUpperCase();
}

function getShipmentUpdatedAt(s) {
  return s.updatedAt || (s.orderItems && s.orderItems[0] && s.orderItems[0].updatedAt) || '';
}

// Returns a reason string if this shipment was already packed/handed over before today, else ''
function leftoverReason(s, processedLog, todayStr) {
  var sid = s.shipmentId || s.id;
  var orderId = s.orderId || (s.orderItems && s.orderItems[0] && s.orderItems[0].orderId) || '';

  if (orderId && MANUAL_IGNORE_ORDER_IDS.indexOf(orderId) > -1) return 'on manual ignore list';

  var seen = processedLog[sid];
  if (seen && seen < todayStr) return 'already given to team on ' + seen;

  // Flipkart says it was already packed, and last changed before today => packed on an earlier day
  var st = getShipmentStatus(s);
  var upd = getShipmentUpdatedAt(s);
  if (upd && (st === 'PACKED' || st === 'READY_TO_DISPATCH' || st === 'PACKING_IN_PROGRESS')) {
    var updDay = Utilities.formatDate(new Date(upd), 'Asia/Kolkata', 'yyyy-MM-dd');
    if (updDay < todayStr) return 'packed on ' + updDay;
  }
  return '';
}


// ── Tracks shipments already handed to the team, so they're not repeated on later days ──
function loadProcessedShipments() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('FLIPKART_PROCESSED_SHIPMENTS');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    Logger.log('loadProcessedShipments error: ' + e.toString());
    return {};
  }
}

function saveProcessedShipments(log, newSids, todayStr) {
  try {
    (newSids || []).forEach(function(sid) {
      if (!log[sid]) log[sid] = todayStr; // keep the FIRST day it was handed over
    });
    // Drop entries older than 45 days to keep storage small
    var cutoff = Utilities.formatDate(new Date(new Date().getTime() - 45 * 86400000), 'Asia/Kolkata', 'yyyy-MM-dd');
    Object.keys(log).forEach(function(k) { if (log[k] < cutoff) delete log[k]; });
    PropertiesService.getScriptProperties().setProperty('FLIPKART_PROCESSED_SHIPMENTS', JSON.stringify(log));
  } catch (e) {
    Logger.log('saveProcessedShipments error: ' + e.toString());
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
    } else {
      throw new Error('Flipkart returned HTTP ' + code + ' error: ' + body);
    }
    return allShipments;
  } catch (e) {
    Logger.log('fetchShipments exception: ' + e.toString());
    throw e; // Throw upwards so the main function triggers the error email
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

// ── STEP 4: Accept / Pack Orders ───────────────────────────────────────────
// Defaults used when Flipkart's shipment data doesn't give us the values.
var PACK_DEFAULT_TAX_RATE = 18;     // GST % — change if your products use another rate
var PACK_SELLER_STATE_CODE = 'IN-DL'; // Seller (Delhi) — same state => CGST+SGST, else IGST
var PACK_DEFAULT_DIMS = { length: 15, breadth: 16, height: 8, weight: 1.282 };

function findDimKey(obj, regex) {
  // Recursively find first numeric value whose key matches regex
  if (!obj || typeof obj !== 'object') return null;
  for (var k in obj) {
    var v = obj[k];
    if (regex.test(k) && v !== null && v !== '' && !isNaN(parseFloat(v)) && typeof v !== 'object') return parseFloat(v);
    if (v && typeof v === 'object') {
      var r = findDimKey(v, regex);
      if (r !== null) return r;
    }
  }
  return null;
}

var LISTING_DIMS_CACHE = {};
// Reads the package size/weight saved on the Flipkart listing for this SKU
function getListingDims(accessToken, sku) {
  if (!sku) return null;
  if (LISTING_DIMS_CACHE.hasOwnProperty(sku)) return LISTING_DIMS_CACHE[sku];
  var dims = null;
  try {
    var resp = UrlFetchApp.fetch('https://api.flipkart.net/sellers/listings/v3/' + encodeURIComponent(sku), {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID },
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    if (code === 200) {
      var data = JSON.parse(body);
      var l = findDimKey(data, /length/i), b = findDimKey(data, /breadth|width/i),
          h = findDimKey(data, /height/i), w = findDimKey(data, /weight/i);
      if (l && b && h && w) dims = { length: l, breadth: b, height: h, weight: w };
      else Logger.log('Listing ' + sku + ' had no full dimensions: ' + body.substring(0, 500));
    } else {
      Logger.log('Listing lookup failed ' + sku + ' [' + code + ']: ' + body.substring(0, 300));
    }
  } catch (e) {
    Logger.log('getListingDims exception: ' + e.toString());
  }
  LISTING_DIMS_CACHE[sku] = dims;
  return dims;
}

function buildPackEntry(s, skuMap, accessToken) {
  var sid = s.shipmentId || s.id;
  var items = s.orderItems || [];
  var orderId = s.orderId || (items[0] && items[0].orderId) || '';
  var buyerState = (s.deliveryAddress && s.deliveryAddress.stateCode) || '';
  var sameState = buyerState === PACK_SELLER_STATE_CODE;
  var rate = PACK_DEFAULT_TAX_RATE;
  var today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');

  // Priority: shipment's own dims -> SKU listing dims -> default
  var dims = null;
  if (s.subShipments && s.subShipments[0] && s.subShipments[0].dimensions) {
    dims = s.subShipments[0].dimensions;
  }
  if (!dims && items[0]) {
    dims = getListingDims(accessToken, skuMap[String(items[0].id || items[0].orderItemId)]);
  }
  if (!dims) {
    Logger.log('Using DEFAULT dimensions for shipment ' + sid);
    dims = PACK_DEFAULT_DIMS;
  }

  // Flipkart splits GST itself; the API only accepts orderItemId, taxRate, quantity
  var taxItems = items.map(function(it) {
    return {
      orderItemId: String(it.id || it.orderItemId),
      quantity: it.quantity || 1,
      taxRate: rate
    };
  });

  var entry = {
    shipmentId: sid,
    invoices: [{
      orderId: orderId,
      invoiceNumber: 'VX-' + String(sid).replace(/[^A-Za-z0-9]/g, '').substring(0, 12).toUpperCase(),
      invoiceDate: today
    }],
    taxItems: taxItems,
    subShipments: [{
      subShipmentId: 'A',
      dimensions: {
        length: Number(dims.length),
        breadth: Number(dims.breadth),
        height: Number(dims.height),
        weight: Number(dims.weight)
      }
    }]
  };
  if (s.locationId) entry.locationId = s.locationId;
  return entry;
}

function packOrders(accessToken, shipments) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/labels';
  var okCount = 0;
  var itemIds = [];
  shipments.forEach(function(sh) {
    (sh.orderItems || []).forEach(function(it) { if (it.id) itemIds.push(it.id); });
  });
  var skuMap = fetchSKUs(accessToken, itemIds);

  // One shipment per call so a single failure doesn't block the rest
  for (var i = 0; i < shipments.length; i++) {
    var s = shipments[i];
    var sid = s.shipmentId || s.id;
    try {
      var payload = { shipments: [buildPackEntry(s, skuMap, accessToken)] };
      var response = UrlFetchApp.fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
          'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      var code = response.getResponseCode();
      var body = response.getContentText();
      var packOk = false;
      if (code >= 200 && code < 300) {
        try {
          var rs = (JSON.parse(body).shipments || [])[0];
          packOk = !rs || rs.processingStatus !== 'FAILURE';
          if (!packOk) Logger.log('Pack rejected ' + sid + ': ' + rs.errorCode + ' - ' + rs.errorMessage);
        } catch (pe) { packOk = true; }
      } else {
        Logger.log('Pack FAILED ' + sid + ' [' + code + ']: ' + body.substring(0, 600));
        Logger.log('Pack payload was: ' + JSON.stringify(payload));
      }
      if (packOk) okCount++;
    } catch (e) {
      Logger.log('packOrders exception for ' + sid + ': ' + e.toString());
    }
  }
  Logger.log('Pack API accepted ' + okCount + '/' + shipments.length + ' shipments.');
  // Give Flipkart time to generate labels before we download them
  if (okCount > 0) Utilities.sleep(20000);
}

// ── STEP 5: Download Invoice PDFs ─────────────────────────────────────────
function downloadInvoicePDFs(accessToken, shipmentIds) {
  var pdfAttachments = [];
  var validSids = [];

  if (shipmentIds.length === 0) return { attachments: pdfAttachments, readySids: validSids };

  // Step A: Check each shipment individually to see if the label is ACTUALLY generated
  for (var i = 0; i < shipmentIds.length; i++) {
    var sid = shipmentIds[i];
    var isReady = false;
    
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
      if (getResp.getResponseCode() === 200 && getResp.getBlob().getBytes().length > 0) {
        isReady = true;
      } else {
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
        if (postResp.getResponseCode() === 200 && postResp.getBlob().getBytes().length > 0) {
          isReady = true;
        }
      }
    } catch(e) {}
    
    if (isReady) {
      validSids.push(sid);
    }
  }

  // Step B: Download ONE merged PDF for all valid shipments
  if (validSids.length > 0) {
    try {
      var batchIds = validSids.slice(0, 25).join(','); 
      var mergedUrl = FLIPKART_BASE_URL + '/v3/shipments/' + batchIds + '/labels';
      var mergedResp = UrlFetchApp.fetch(mergedUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
        },
        muteHttpExceptions: true
      });
      if (mergedResp.getResponseCode() === 200) {
        var mergedBlob = mergedResp.getBlob();
        if (mergedBlob.getBytes().length > 0) {
          mergedBlob.setContentType('application/pdf');
          mergedBlob.setName('VOEUX_Merged_Labels.pdf');
          pdfAttachments.push(mergedBlob);
        }
      }
    } catch(e) {
      Logger.log('Merged labels exception: ' + e.toString());
    }
  }

  return { attachments: pdfAttachments, readySids: validSids };
}

// ── STEP 5B: Helper to Fetch SKUs ─────────────────────────────────────────
// Calls Flipkart with retries so a temporary error (rate limit / 5xx / timeout) doesn't blank the email
function fetchWithRetry(url, options, label) {
  var lastCode = null, lastBody = '';
  for (var attempt = 1; attempt <= 4; attempt++) {
    try {
      var resp = UrlFetchApp.fetch(url, options);
      lastCode = resp.getResponseCode();
      lastBody = resp.getContentText();
      if (lastCode === 200) return lastBody;
      Logger.log(label + ' attempt ' + attempt + ' failed [' + lastCode + ']: ' + lastBody.substring(0, 200));
      if (lastCode !== 429 && lastCode < 500) break; // not a temporary error
    } catch (e) {
      Logger.log(label + ' attempt ' + attempt + ' exception: ' + e.toString());
    }
    Utilities.sleep(2000 * attempt);
  }
  return null;
}

function fetchSKUs(accessToken, orderItemIds) {
  var skuMap = {};
  if (!orderItemIds || orderItemIds.length === 0) return skuMap;

  for (var i = 0; i < orderItemIds.length; i += 50) {
    var chunk = orderItemIds.slice(i, i + 50).join(',');
    var body = fetchWithRetry('https://api.flipkart.net/sellers/v2/orders?orderItemIds=' + chunk, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
      },
      muteHttpExceptions: true
    }, 'fetchSKUs');
    if (body) {
      try {
        (JSON.parse(body).orderItems || []).forEach(function(item) {
          if (item.orderItemId && item.sku) skuMap[item.orderItemId] = item.sku;
        });
      } catch (e) {
        Logger.log('fetchSKUs parse error: ' + e.toString());
      }
    }
  }
  Logger.log('fetchSKUs: resolved ' + Object.keys(skuMap).length + '/' + orderItemIds.length + ' SKUs.');
  return skuMap;
}

// ── STEP 6: Dispatch Orders ───────────────────────────────────────────────
function dispatchOrders(accessToken, shipmentIds, locationId) {
  var url = FLIPKART_BASE_URL + '/v3/shipments/dispatch';
  var payload = { shipmentIds: shipmentIds };
  if (locationId) {
    payload.locationId = locationId;
  }

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

// Fetches the product title shown on Flipkart for each SKU (max 10 per request)
function fetchProductTitles(accessToken, skus) {
  var titleMap = {};
  var unique = [];
  (skus || []).forEach(function(s) { if (s && unique.indexOf(s) === -1) unique.push(s); });
  for (var i = 0; i < unique.length; i += 10) {
    var chunk = unique.slice(i, i + 10);
    var body = fetchWithRetry('https://api.flipkart.net/sellers/listings/v3/details', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Flipkart-Selling-Partner-Id': FLIPKART_SELLER_ID
      },
      payload: JSON.stringify({ sku_ids: chunk }),
      muteHttpExceptions: true
    }, 'fetchProductTitles');
    if (body) {
      try {
        var avail = (JSON.parse(body).available) || {};
        Object.keys(avail).forEach(function(k) {
          var title = findStringKey(avail[k], /^product_title$/i);
          if (title) titleMap[k] = title;
        });
      } catch (e) {
        Logger.log('fetchProductTitles parse error: ' + e.toString());
      }
    }
  }
  Logger.log('fetchProductTitles: resolved ' + Object.keys(titleMap).length + '/' + unique.length + ' titles.');
  return titleMap;
}

function findStringKey(obj, regex) {
  if (!obj || typeof obj !== 'object') return null;
  for (var k in obj) {
    var v = obj[k];
    if (regex.test(k) && typeof v === 'string' && v) return v;
    if (v && typeof v === 'object') {
      var r = findStringKey(v, regex);
      if (r) return r;
    }
  }
  return null;
}

// Builds the "what to pack" summary: item title, number of orders, quantity per order
function buildPackingSummary(readyShipments, skuMap, titleMap) {
  var groups = {};
  var order = [];
  readyShipments.forEach(function(s) {
    (s.orderItems || []).forEach(function(it) {
      var sku = skuMap[it.id] || 'Unknown SKU';
      var qty = it.quantity || 1;
      if (!groups[sku]) { groups[sku] = { orders: 0, qtyCount: {} }; order.push(sku); }
      groups[sku].orders++;
      groups[sku].qtyCount[qty] = (groups[sku].qtyCount[qty] || 0) + 1;
    });
  });
  // One row per (product, quantity-per-order) so e.g. qty 1 and qty 2 orders are separate lines
  var rows = [];
  order.forEach(function(sku) {
    var g = groups[sku];
    Object.keys(g.qtyCount).map(Number).sort(function(a, b) { return a - b; }).forEach(function(q) {
      var n = g.qtyCount[q];
      rows.push({ product: titleMap[sku] || sku, sku: sku, orders: n, qty: q, total: n * q });
    });
  });
  return rows;
}

function escapeHtml(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function packingSummaryText(rows) {
  if (!rows.length) return 'No orders to pack.';
  return rows.map(function(r, i) {
    return (i + 1) + ') ' + r.product + '\n' +
      '    SKU: ' + r.sku + '\n' +
      '    Orders: ' + r.orders + '\n' +
      '    Quantity in each order: ' + r.qty + '\n' +
      '    Total units to pack: ' + r.total;
  }).join('\n\n');
}

function packingSummaryHtml(rows, totalOrders) {
  var th = 'style="border:1px solid #999;padding:8px;background:#222;color:#fff;text-align:left;"';
  var td = 'style="border:1px solid #999;padding:8px;vertical-align:top;"';
  var tdc = 'style="border:1px solid #999;padding:8px;text-align:center;vertical-align:top;"';
  var html = '<h3 style="margin:16px 0 6px;">Orders for today ' + totalOrders + ' FLIPKART</h3>';
  if (!rows.length) return html + '<p>No orders to pack.</p>';
  html += '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">' +
    '<tr><th ' + th + '>S.No</th><th ' + th + '>Product</th><th ' + th + '>SKU</th>' +
    '<th ' + th + '>No. of Orders</th><th ' + th + '>Qty in Each Order</th><th ' + th + '>Total Units</th></tr>';
  rows.forEach(function(r, i) {
    html += '<tr><td ' + tdc + '>' + (i + 1) + '</td><td ' + td + '>' + escapeHtml(r.product) + '</td>' +
      '<td ' + td + '>' + escapeHtml(r.sku) + '</td><td ' + tdc + '>' + r.orders + '</td>' +
      '<td ' + tdc + '><b>' + r.qty + '</b></td><td ' + tdc + '>' + r.total + '</td></tr>';
  });
  return html + '</table>';
}

function sendInvoicesToOffice(pdfAttachments, eligibleShipments, skuMap, readyShipmentIds, titleMap) {
  titleMap = titleMap || {};
  var today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy');
  skuMap = skuMap || {};
  readyShipmentIds = readyShipmentIds || [];
  
  var readyShipments = [];
  var upcomingShipments = [];

  eligibleShipments.forEach(function(s) {
    var sid = s.shipmentId || s.id;
    if (readyShipmentIds.indexOf(sid) > -1) {
      readyShipments.push(s);
    } else {
      upcomingShipments.push(s);
    }
  });

  function formatShipmentLines(shipmentsArray) {
    return shipmentsArray.map(function(s, idx) {
      // Correctly extract SKU using skuMap mapped via orderItemIds
      var sku = 'VOEUX Item';
      var orderItemId = s.orderItems && s.orderItems[0] ? s.orderItems[0].id : null;
      
      if (orderItemId && skuMap[orderItemId]) {
        sku = skuMap[orderItemId];
      } else if (s.subShipments && s.subShipments[0] && s.subShipments[0].items && s.subShipments[0].items[0] && s.subShipments[0].items[0].sku) {
        sku = s.subShipments[0].items[0].sku;
      } else if (s.orderItems && s.orderItems[0] && s.orderItems[0].sku) {
        sku = s.orderItems[0].sku;
      }
      
      var orderId = s.orderId || (s.orderItems && s.orderItems[0] ? s.orderItems[0].orderId : null) || s.shipmentId || s.id || 'N/A';
      return (idx + 1) + '. Order ID: ' + orderId + ' | SKU: ' + sku;
    }).join('\n');
  }

  var orderLinesReady = formatShipmentLines(readyShipments);
  var orderLinesUpcoming = formatShipmentLines(upcomingShipments);

  var packingRows = buildPackingSummary(readyShipments, skuMap, titleMap);

  var body = 'Good morning, VOEUX® Team!\n\n' +
    'Today\'s Flipkart orders have been automatically processed.\n\n' +
    '=== 📦 READY TO SHIP (' + readyShipments.length + ' orders) ===\n' +
    (readyShipments.length > 0 ? orderLinesReady : 'No orders are currently packed and ready.') + '\n\n' +
    '=== ⏳ UPCOMING / PENDING (' + upcomingShipments.length + ' orders) ===\n' +
    (upcomingShipments.length > 0 ? orderLinesUpcoming : 'No upcoming orders.') + '\n\n' +
    '=== ACTIONS COMPLETED ===\n' +
    '✓ Labels downloaded for Ready orders\n' +
    '✓ Ready orders DISPATCHED — courier pickup scheduled\n\n' +
    'Invoice PDFs for the Ready orders are attached to this email.\n' +
    'Please pack the Upcoming orders on the Flipkart Dashboard so they can be processed in the next run.\n\n' +
    'VOEUX® Automated Operations\n' +
    'voeuxtechnologies.in\n\n' +
    'Orders for today ' + readyShipments.length + ' FLIPKART\n\n' +
    packingSummaryText(packingRows);

  var subject = 'VOEUX® Flipkart Orders — ' + today + ' (' + readyShipments.length + ' Ready, ' + upcomingShipments.length + ' Upcoming)';

  var emailOptions = {
    name: 'VOEUX® Operations',
    replyTo: 'voeuxexperience@gmail.com'
  };

  var attachments = [];
  if (pdfAttachments && pdfAttachments.length > 0) {
    attachments = attachments.concat(pdfAttachments);
  }
  
  // Build an HTML version so the packing list shows as a proper table
  var htmlBody = '<div style="font-family:Arial,sans-serif;font-size:14px;">' +
    '<pre style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;margin:0;">' +
    escapeHtml(body.split('Orders for today')[0]) + '</pre>' +
    packingSummaryHtml(packingRows, readyShipments.length) + '</div>';
  emailOptions.htmlBody = htmlBody;

  if (attachments.length > 0) {
    emailOptions.attachments = attachments;
  }

  try {
    GmailApp.sendEmail(OFFICE_EMAIL, subject, body, emailOptions);
    Logger.log('Email sent to ' + OFFICE_EMAIL + ' with ' + attachments.length + ' attachments.');
  } catch (mailErr) {
    Logger.log('Gmail failed, trying MailApp: ' + mailErr.toString());
    MailApp.sendEmail({
      to: OFFICE_EMAIL,
      subject: subject,
      body: body,
      htmlBody: htmlBody,
      attachments: attachments,
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
