// ══════════════════════════════════════════════════════════════════
// ANOTHER REALM — Email Waitlist Collector
// Deploy as Web App: Execute as Me | Anyone, even anonymous
// ══════════════════════════════════════════════════════════════════

const SPREADSHEET_NAME = 'Another Realm — Email Waitlist';

function getOrCreateSheet(ss, tabName) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(['Timestamp', 'Email', 'Venture', 'Source', 'Status']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(
    DriveApp.getFolderById('1wpBGeUaZic-mJBsCDKH4spxKj3maUBa8')
  );
  return ss;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email   = (data.email   || '').trim().toLowerCase();
    const venture = (data.venture || 'General').trim();
    const source  = (data.source  || 'unknown').trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const ss    = getOrCreateSpreadsheet();
    const sheet = getOrCreateSheet(ss, venture);
    const existing = sheet.getDataRange().getValues();
    const already  = existing.slice(1).some(row => row[1] === email);
    if (already) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', note: 'already_registered' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    sheet.appendRow([new Date(), email, venture, source, 'new']);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'alive', service: 'Another Realm Email Collector' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupAllVentureTabs() {
  const ventures = [
    'Another Realm AI International',
    'Another Realm Systems','Another Realm Gateway',
    'Another Realm Innovations','Another Realm Productions',
    'Another Realm Consulting','Another Realm Analytics',
    'Another Realm Intelligence','Another Realm Ventures',
    'Another Realm Logistics','Another Realm Groundworks',
    'Another Realm Compliance','Another Realm Installation',
  ];
  const ss = getOrCreateSpreadsheet();
  ventures.forEach(v => getOrCreateSheet(ss, v));
  Logger.log('All venture tabs created.');
}