/**
 * Softece order form -> Google Sheet
 *
 * Setup, once:
 *   1. Create a Google Sheet (any name).
 *   2. Extensions -> Apps Script. Delete whatever is there and paste this file.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Authorise when Google asks. Copy the /exec URL it gives you.
 *   4. Put that URL on the form in order/index.html:
 *        <form ... data-sheet="https://script.google.com/macros/s/..../exec">
 *
 * After editing this script, deploy again (Manage deployments -> edit -> new
 * version), otherwise the live URL keeps running the old code.
 */

var SHEET_NAME = 'Orders';
var HEADERS = ['Received', 'Package', 'Price', 'Name', 'Email', 'Phone', 'Company', 'Start', 'Details'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // two people submitting at once must not share a row
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      data.package || '',
      data.price || '',
      data.name || '',
      data.email || '',
      data.phone || '',
      data.company || '',
      data.start || '',
      data.details || ''
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser should say something, not error. */
function doGet() {
  return json_({ ok: true, message: 'Softece order endpoint is live. Send a POST.' });
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
