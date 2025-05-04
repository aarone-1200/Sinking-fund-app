// Backend for Sinking Fund App - Exact match for your Sheets structure
const SPREADSHEET_ID = 'YOUR_SHEET_ID'; // Replace with your actual Sheet ID

const SHEET_NAMES = {
  USERS: "Users",
  MEMBERS: "Official_Member",
  CONTRIBUTIONS: "contributions",
  LOGS: "Logs"
};

// Column indexes (0-based) for each sheet
const COLUMNS = {
  USERS: {
    USERNAME: 0, // A
    HASHED_PW: 1, // B
    ROLE: 2,     // C
    LAST_LOGIN: 3, // D
    PW_CHANGED: 4, // E
    EMAIL: 5      // F
  },
  MEMBERS: {
    NAME: 0,      // A
    REG_DATE: 1,  // B
    STATUS: 2     // C
  },
  CONTRIBUTIONS: {
    MEMBER_NAME: 0, // A
    AMOUNT: 1,     // B
    DATE: 2,       // C
    PERIOD: 3,     // D
    VERIFIED_BY: 4  // E
  }
};

function doPost(e) {
  try {
    const { action, data } = JSON.parse(e.postData.contents);
    let result;

    switch(action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'register':
        result = handleRegister(data);
        break;
      case 'getDashboardData':
        result = getDashboardData(data);
        break;
      case 'getMembers':
        result = getMembersList();
        break;
      case 'addContribution':
        result = addContribution(data);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }

    logAction(data?.username || 'system', action, result.success ? 'success' : 'failed');
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    logAction('system', 'error', error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper functions
function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function hashPassword(password) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
}

function logAction(user, action, details) {
  const logSheet = getSheet(SHEET_NAMES.LOGS);
  logSheet.appendRow([new Date(), user, action, details]);
}

// Authentication handlers
function handleLogin({ username, password }) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[COLUMNS.USERS.USERNAME] === username && 
        row[COLUMNS.USERS.HASHED_PW] === hashPassword(password)) {
      
      // Update last login
      sheet.getRange(i+1, COLUMNS.USERS.LAST_LOGIN+1).setValue(new Date());
      
      return {
        success: true,
        user: {
          username,
          role: row[COLUMNS.USERS.ROLE],
          needsPwChange: row[COLUMNS.USERS.PW_CHANGED] !== 'TRUE'
        }
      };
    }
  }
  return { success: false, message: 'Invalid credentials' };
}

function handleRegister({ fullName, username, password, email }) {
  const usersSheet = getSheet(SHEET_NAMES.USERS);
  const membersSheet = getSheet(SHEET_NAMES.MEMBERS);

  // Check if name exists in official list
  const members = membersSheet.getDataRange().getValues();
  const isOfficial = members.some(row => row[COLUMNS.MEMBERS.NAME] === fullName);
  if (!isOfficial) return { success: false, message: 'Not in member list' };

  // Check if username exists
  const users = usersSheet.getDataRange().getValues();
  const userExists = users.some(row => row[COLUMNS.USERS.USERNAME] === username);
  if (userExists) return { success: false, message: 'Username taken' };

  // Add new user
  usersSheet.appendRow([
    username,
    hashPassword(password),
    'member',
    new Date(),
    'FALSE',
    email || ''
  ]);

  return { success: true };
}

// Data handlers
function getDashboardData() {
  const membersSheet = getSheet(SHEET_NAMES.MEMBERS);
  const contribSheet = getSheet(SHEET_NAMES.CONTRIBUTIONS);

  // Count active members
  const members = membersSheet.getDataRange().getValues();
  const activeCount = members.filter(row => row[COLUMNS.MEMBERS.STATUS] === 'active').length - 1; // -1 for header

  // Sum all contributions
  const contributions = contribSheet.getDataRange().getValues();
  const totalBalance = contributions.slice(1).reduce((sum, row) => sum + (Number(row[COLUMNS.CONTRIBUTIONS.AMOUNT]) || 0), 0);

  // Current month contributions
  const now = new Date();
  const monthContrib = contributions.slice(1)
    .filter(row => {
      const date = new Date(row[COLUMNS.CONTRIBUTIONS.DATE]);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, row) => sum + (Number(row[COLUMNS.CONTRIBUTIONS.AMOUNT]) || 0), 0);

  return {
    success: true,
    totalMembers: activeCount,
    currentBalance: totalBalance,
    monthlyContributions: monthContrib
  };
}

function getMembersList() {
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  // Return array of active members {name, regDate, status}
  return {
    success: true,
    members: data.slice(1)
      .filter(row => row[COLUMNS.MEMBERS.STATUS] === 'active')
      .map(row => ({
        name: row[COLUMNS.MEMBERS.NAME],
        regDate: row[COLUMNS.MEMBERS.REG_DATE],
        status: row[COLUMNS.MEMBERS.STATUS]
      }))
  };
}

function addContribution({ memberName, amount, period, verifiedBy }) {
  const sheet = getSheet(SHEET_NAMES.CONTRIBUTIONS);
  
  sheet.appendRow([
    memberName,
    amount,
    new Date(),
    period,
    verifiedBy
  ]);
  
  return { success: true };
}