// ANOTHER REALM — Email Waitlist Collector v2
// CORS-safe: uses no-cors mode from browser, form POST as fallback

const SPREADSHEET_NAME = 'Another Realm — Email Waitlist';
const ARAI_FOLDER_ID   = '1wpBGeUaZic-mJBsCDKH4spxKj3maUBa8';

function getOrCreateSheet(ss, tabName) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(['Timestamp','Email','Venture','Source','Status']);
    sheet.getRange(1,1,1,5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(ARAI_FOLDER_ID));
  return ss;
}

function addEmail(email, venture, source) {
  if (!email || !email.includes('@') || !email.includes('.')) return {status:'error',message:'Invalid email'};
  const ss    = getOrCreateSpreadsheet();
  const sheet = getOrCreateSheet(ss, venture);
  const existing = sheet.getDataRange().getValues();
  if (existing.slice(1).some(row => row[1] === email)) return {status:'success',note:'already_registered'};
  sheet.appendRow([new Date(), email, venture, source, 'new']);
  return {status:'success'};
}

function doPost(e) {
  let result;
  try {
    // Handle both JSON and form-encoded submissions
    let email, venture, source;
    if (e.postData && e.postData.type === 'application/json') {
      const d = JSON.parse(e.postData.contents);
      email = (d.email||'').trim().toLowerCase();
      venture = (d.venture||'General').trim();
      source = (d.source||'unknown').trim();
    } else if (e.parameter) {
      email = (e.parameter.email||'').trim().toLowerCase();
      venture = (e.parameter.venture||'General').trim();
      source = (e.parameter.source||'unknown').trim();
    }
    result = addEmail(email, venture, source);
  } catch(err) {
    result = {status:'error', message:err.toString()};
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  // Handle GET-based submission (no-cors workaround)
  if (e.parameter && e.parameter.email) {
    const result = addEmail(
      (e.parameter.email||'').trim().toLowerCase(),
      (e.parameter.venture||'General').trim(),
      (e.parameter.source||'unknown').trim()
    );
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({status:'alive',service:'Another Realm Email Collector v2'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupAllVentureTabs() {
  const ventures = [
    'Another Realm AI International','Another Realm Systems',
    'Another Realm Gateway','Another Realm Innovations',
    'Another Realm Productions','Another Realm Consulting',
    'Another Realm Analytics','Another Realm Intelligence',
    'Another Realm Ventures','Another Realm Logistics',
    'Another Realm Groundworks','Another Realm Compliance',
    'Another Realm Installation',
  ];
  const ss = getOrCreateSpreadsheet();
  ventures.forEach(v => getOrCreateSheet(ss, v));
  Logger.log('All venture tabs created.');
}