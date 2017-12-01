// The keys are in a separate file

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
    initSonos();
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      populateRecentEvents(105);
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
    }
}

/**
*  Sign in the user upon button click.
*/
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function clearPre() {
    var pre = document.getElementById('content');
    pre.innerHTML = '';
}

function populateRecentEvents(minCount) {
    lastEventRecord=minCount;
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1xn0_Qahjb2CrXrXGYAtQ3fqZCu0Ycee3xYo-AmaGTg0',
        range: 'Sheet1!A1:D'
    }).then(function(response) {
        lastEventRecord = response.result.values.length;
        listRecentEvents(lastEventRecord, minCount);
    }, function(response) {
        console.log('The API returned an error: ' + err);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* off shoot of the update Activity method which adjusts
the class of the appropriate room rectangle based on the
state of the sensors in the room.
 */
function updateSonos (sensorMapID, sensorStyle) {

    console.log("We have sensor map " + sensorMapID);
    if (sensorStyle.includes("inactive")) {
        for (i = 6; i > 0; i--) {
            var sonos1arc = document.getElementById(sensorMapID + '-arc-' + i);
            sonos1arc.setAttribute("class", "sonos-arc-" + sensorStyle);
        }
        var sonos = document.getElementById(sensorMapID);
        sonos.setAttribute("class", "sonos-" + sensorStyle);
    } else {
        var sonos = document.getElementById(sensorMapID);
        sonos.setAttribute("class", "sonos-" + sensorStyle);
        for (i = 1; i <= 6; i++) {
            var sonos1arc = document.getElementById(sensorMapID + '-arc-' + i);
            sonos1arc.setAttribute("class", "sonos-arc-" + sensorStyle);
        }
    }
}

function updateActivity(datetime, sensorID, state) {
    var sensorMapID = sensorIDs[sensorID];
    var sensorRoom = document.getElementById(sensorMapID);
    var sensorRoomWall = document.getElementById(sensorMapID + '-wall');
    var commonUpdate = true;
    if (sensorRoom != null) {
        var sensorStyle = sensorStates[state];
        // console.log("Loc for " + sensorID + " is " + sensorIDs[sensorID]);
        if (sensorIDs[sensorID].includes("door")) {
            sensorStyle = "door-" + sensorStyle;
        } else if (sensorIDs[sensorID].includes("sonos")) {
            // if (sensorStyle != null) {
            //     updateSonos(sensorMapID, sensorStyle);
            // }
            commonUpdate = false;
        } else {
            sensorStyle = "room-" + sensorStyle;
        }
        if (commonUpdate) {
            // console.log(  "Sensor style " + sensorStyle + " from state " + state);
            sensorRoom.setAttribute('class', sensorStyle);
            sensorRoomWall.setAttribute('class', sensorStyle + '-wall');
        }
    } else {
        console.log("Room for " + sensorID + " is not in list");
    }
}

function initSonos() {
    var sonos1arc1 = document.getElementById('living-room-sonos-arc-1');
    sonos1arc1.setAttribute("d", describeArc(170, 230, 7, 235, 315));
    var sonos1arc2 = document.getElementById('living-room-sonos-arc-2');
    sonos1arc2.setAttribute("d", describeArc(170, 230, 7, 45, 135));
    var sonos1arc3 = document.getElementById('living-room-sonos-arc-3');
    sonos1arc3.setAttribute("d", describeArc(170, 230, 10, 235, 315));
    var sonos1arc4 = document.getElementById('living-room-sonos-arc-4');
    sonos1arc4.setAttribute("d", describeArc(170, 230, 10, 45, 135));
    var sonos1arc5 = document.getElementById('living-room-sonos-arc-5');
    sonos1arc5.setAttribute("d", describeArc(170, 230, 13, 235, 315));
    var sonos1arc6 = document.getElementById('living-room-sonos-arc-6');
    sonos1arc6.setAttribute("d", describeArc(170, 230, 13, 45, 135));
}

function listRecentEvents(lastEventRecord, eventCount) {
    clearPre();
    firstEventRecord = lastEventRecord - eventCount + 1;
    console.log("We have a first record " + firstEventRecord + " and a last record " + lastEventRecord);
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1xn0_Qahjb2CrXrXGYAtQ3fqZCu0Ycee3xYo-AmaGTg0',
      range: 'Sheet1!A' + firstEventRecord + ':D' + lastEventRecord
    }).then(async function(response) {
      var range = response.result;
      if (range.values.length>0) {
        appendPre('Time, Sensor, Event');
        for (i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          // Print columns A, B and D
          appendPre(row[0] + ', ' + row[1] + ', ' + row[3]);
          await sleep(500);
          updateActivity(row[0], row[1], row[3]);
        }
      } else {
        appendPre('No data found.');
      }
    }, function(response) {
        appendPre('Error: ' + response.result.error.message);
    });
}