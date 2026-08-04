/**
 * ===================================================================
 * STORY HOMES — Investor Landing Page lead form backend
 * ===================================================================
 * Receives the "Get Deal Alerts" form submission from the landing page
 * and emails it out as a branded HTML notification, including whatever
 * UTM / campaign parameters the visitor arrived with.
 *
 * SETUP (one time):
 *   1. Go to https://script.google.com/ and create a new project
 *      (or Extensions → Apps Script from inside a Google Sheet if you
 *      also want the optional lead log below).
 *   2. Delete the default empty Code.gs content and paste this whole file in.
 *   3. Edit the CONFIG block just below — at minimum set RECIPIENT_EMAILS.
 *   4. Deploy → New deployment → select type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy, authorize the requested permissions, and copy the
 *      "Web app URL" it gives you.
 *   5. Paste that URL into GOOGLE_SCRIPT_URL near the top of script.js
 *      on the landing page (replace the PASTE_YOUR_... placeholder).
 *   6. Submit a test lead on the live page and confirm the email arrives.
 *
 * Whenever you edit this file after the first deploy, use
 * Deploy → Manage deployments → ✎ → New version, or your changes won't
 * go live on the existing Web app URL.
 * =================================================================== */

// ====================== CONFIGURATION — edit this part ======================
var CONFIG = {
  // Who should receive the lead notification email. Comma-separate multiple
  // addresses inside one string, e.g. "you@storyhomes.com, saad@storyhomes.com"
  RECIPIENT_EMAILS: "marketing@storyhomes.com",

  // Name the notification email appears to be "from" (the address itself will
  // still be whatever Google account this script is deployed under).
  FROM_NAME: "Story Homes Website",

  // Optional: paste a Google Sheet ID here to also log every lead as a row,
  // in addition to the email. Leave blank ("") to skip sheet logging entirely.
  // The ID is the long string in the sheet's URL between /d/ and /edit.
  SHEET_ID: "",
  SHEET_NAME: "Leads",
};

// Story Homes brand palette (matches styles.css :root custom properties)
var BRAND = {
  forest: "#5C6D62",
  forestDeep: "#47554b",
  olive: "#8C9965",
  ivory: "#F6F1EC",
  champagne: "#E3CDBC",
  brown: "#9B8B7C",
  black: "#010101",
  white: "#ffffff",
};

// Story Homes logo (white version), embedded so the email never depends on
// the landing page being live or any external image host. ~23KB base64.
var LOGO_BASE64 =
  "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";

// ============================================================================
// Everything below this line should not need to change for day-to-day use.
// ============================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ---- Server-side bot check (defense in depth — never trust the client
    // alone; a bot can always skip your JavaScript and POST directly). ----
    // Honeypot: a real visitor never sees or fills the "website" field.
    if (data.website) {
      return jsonResponse({ ok: true }); // pretend success so bots learn nothing
    }
    // Time trap: reject submissions filled out faster than a human plausibly could.
    var loadedAt = Number(data.form_loaded_at || 0);
    if (loadedAt && Date.now() - loadedAt < 2500) {
      return jsonResponse({ ok: true });
    }

    if (!data.name || !data.email || !data.phone) {
      return jsonResponse({ ok: false, error: "Missing required fields." });
    }

    sendLeadEmail(data);

    if (CONFIG.SHEET_ID) {
      try {
        logToSheet(data);
      } catch (sheetErr) {
        // Don't fail the whole request just because sheet logging hiccuped —
        // the email already went out, which is the part that matters most.
        console.error("Sheet logging failed: " + sheetErr);
      }
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sendLeadEmail(data) {
  var logoBlob = Utilities.newBlob(
    Utilities.base64Decode(LOGO_BASE64),
    "image/png",
    "story-homes-logo.png"
  );

  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAILS,
    subject: "New Investor Lead — " + (data.name || "Unknown") + " (Story Homes)",
    htmlBody: buildEmailHtml(data),
    inlineImages: { logo: logoBlob },
    name: CONFIG.FROM_NAME,
  });
}

/* ---------- HTML escaping so lead-submitted text can't break the email markup ---------- */
function esc(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* One label/value row for the details tables. Skips rendering entirely when empty. */
function detailRow(label, value, opts) {
  if (!value) return "";
  opts = opts || {};
  var displayValue = esc(value);
  if (opts.href) {
    displayValue =
      '<a href="' + esc(opts.href) + '" style="color:' + BRAND.forest + ';text-decoration:none;">' +
      displayValue +
      "</a>";
  }
  return (
    '<tr>' +
    '<td style="padding:9px 0;border-bottom:1px solid #ece6de;font-family:Helvetica,Arial,sans-serif;' +
    'font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:' + BRAND.brown +
    ';width:150px;vertical-align:top;">' + esc(label) + '</td>' +
    '<td style="padding:9px 0;border-bottom:1px solid #ece6de;font-family:Helvetica,Arial,sans-serif;' +
    'font-size:15px;color:' + BRAND.black + ';vertical-align:top;">' + displayValue + '</td>' +
    '</tr>'
  );
}

function buildEmailHtml(data) {
  var submittedAt = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "MMM d, yyyy 'at' h:mm a z"
  );

  var leadRows =
    detailRow("Name", data.name) +
    detailRow("Email", data.email, { href: "mailto:" + data.email }) +
    detailRow("Phone", data.phone, { href: "tel:" + (data.phone || "").replace(/[^0-9+]/g, "") }) +
    detailRow("Company Website", data.company) +
    detailRow("Notes", data.notes);

  var campaignRows =
    detailRow("UTM Source", data.utm_source) +
    detailRow("UTM Medium", data.utm_medium) +
    detailRow("UTM Campaign", data.utm_campaign) +
    detailRow("UTM Term", data.utm_term) +
    detailRow("UTM Content", data.utm_content) +
    detailRow("Page URL", data.page_url) +
    detailRow("Referrer", data.referrer) +
    detailRow("Submitted", submittedAt);

  var campaignSection = campaignRows
    ? '<tr><td style="padding:26px 36px 4px;">' +
      '<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;' +
      'letter-spacing:0.08em;text-transform:uppercase;color:' + BRAND.forest + ';margin-bottom:10px;">' +
      '● Campaign Tracking</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + BRAND.ivory +
      ';border-radius:12px;padding:6px 16px;">' + campaignRows + '</table>' +
      '</td></tr>'
    : "";

  return (
    '<!doctype html><html><body style="margin:0;padding:0;background:' + BRAND.ivory +
    ';font-family:Helvetica,Arial,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + BRAND.ivory + ';padding:32px 16px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:' + BRAND.white +
    ';border-radius:18px;overflow:hidden;border:1px solid #e7e0d6;">' +

    // Header banner
    '<tr><td style="background:' + BRAND.forest + ';padding:30px 36px;text-align:center;">' +
    '<img src="cid:logo" width="150" alt="Story Homes" style="display:inline-block;border:0;outline:0;" />' +
    '</td></tr>' +

    // Title
    '<tr><td style="padding:32px 36px 6px;">' +
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;' +
    'text-transform:uppercase;color:' + BRAND.olive + ';margin-bottom:8px;">New Investor Lead</div>' +
    '<h1 style="margin:0 0 6px;font-family:Georgia,\'Times New Roman\',serif;font-size:24px;color:' + BRAND.black + ';">' +
    esc(data.name || "Someone") + ' just requested deal alerts</h1>' +
    '<p style="margin:0 0 18px;font-size:14px;color:#6b7267;">Submitted through the Story Homes investor landing page. Reach out soon — fast follow-up wins deals.</p>' +
    '</td></tr>' +

    // Lead details
    '<tr><td style="padding:4px 36px 0;">' +
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;' +
    'text-transform:uppercase;color:' + BRAND.forest + ';margin-bottom:10px;">● Lead Details</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + leadRows + '</table>' +
    '</td></tr>' +

    // Campaign tracking (only rendered if there's at least one non-empty field)
    campaignSection +

    // Footer
    '<tr><td style="padding:30px 36px 32px;">' +
    '<a href="mailto:' + esc(data.email) + '" style="display:inline-block;background:' + BRAND.forest +
    ';color:' + BRAND.ivory + ';text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:14px;' +
    'font-weight:700;padding:13px 26px;border-radius:999px;">Reply to ' + esc(data.name || "lead") + '</a>' +
    '</td></tr>' +
    '<tr><td style="padding:18px 36px;border-top:1px solid #ece6de;">' +
    '<p style="margin:0;font-size:11px;color:' + BRAND.brown + ';">Sent automatically from the Story Homes investor landing page lead form.</p>' +
    '</td></tr>' +

    '</table>' +
    '</td></tr>' +
    '</table>' +
    '</body></html>'
  );
}

/* ---------- Optional: also append every lead as a row in a Google Sheet ---------- */
function logToSheet(data) {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME) ||
    SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted", "Name", "Email", "Phone", "Company Website", "Notes",
      "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content",
      "Page URL", "Referrer",
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "", data.email || "", data.phone || "", data.company || "", data.notes || "",
    data.utm_source || "", data.utm_medium || "", data.utm_campaign || "", data.utm_term || "", data.utm_content || "",
    data.page_url || "", data.referrer || "",
  ]);
}

/* ---------- Manual test: run this directly from the Apps Script editor (function
   dropdown → testSheetLogging → Run) to see the real error immediately, instead
   of digging through the Executions log. Prints exactly what it finds along the way. ---------- */
function testSheetLogging() {
  Logger.log("SHEET_ID: " + CONFIG.SHEET_ID);
  Logger.log("SHEET_NAME: " + CONFIG.SHEET_NAME);

  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  Logger.log("Opened spreadsheet: " + ss.getName());

  var allTabs = ss.getSheets().map(function (s) { return s.getName(); });
  Logger.log("Tabs found in this spreadsheet: " + JSON.stringify(allTabs));

  logToSheet({
    name: "Manual Test User",
    email: "manual-test@example.com",
    phone: "(555) 000-1234",
    company: "test-company.com",
    notes: "This is a manual test row from testSheetLogging().",
    utm_source: "manual_test",
    utm_medium: "manual_test",
    utm_campaign: "manual_test",
    utm_term: "",
    utm_content: "",
    page_url: "https://storyhomes.com/",
    referrer: "manual_test",
  });

  Logger.log("Done — if no error appeared above, check the sheet now for a new row.");
}
