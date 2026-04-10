// ============================================
// Google Apps Script — paste this into script.google.com
// Handles: Google Sheet append + Email notification
// ============================================

const SHEET_ID = '1743TIeJBYCqGphmUDP5AH8_WSvFo2HAIaRxHbjjualA';
const EMAIL_TO = 'adriaan.repa@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Append to Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1')
                  || SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.area || '',
      data.message || ''
    ]);

    // 2. Send email notification
    const subject = 'Novy dopyt z RoboKos.sk — ' + (data.name || 'Neznamy');
    const body = [
      'Novy dopyt z webovej stranky RoboKos:',
      '',
      'Meno: ' + (data.name || '-'),
      'E-mail: ' + (data.email || '-'),
      'Telefon: ' + (data.phone || '-'),
      'Velkost travnika: ' + (data.area || '-'),
      'Sprava: ' + (data.message || '-'),
      '',
      'Cas: ' + new Date().toLocaleString('sk-SK'),
    ].join('\n');

    MailApp.sendEmail(EMAIL_TO, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: verify the script works via GET request
function doGet() {
  return ContentService
    .createTextOutput('RoboKos form handler is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
