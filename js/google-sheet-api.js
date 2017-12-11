// Keys and unique tokens are in a separate file, keys.js referenced by the HTML file
// The API keys are from the Google API.  Read this article on instructions
// for how to generate these keys https://developers.google.com/sheets/api/quickstart/js
// The two keys are CLIENT_ID that ends with .apps.googleusercontent.com and
// API_KEY that is roughtly 40 charaacters long.   Declare these as var API_KEY = '';
// in js/keys.js.
// Another set of keys are the IDs of the Google sheets.  I have kept these in this
// code for now since I feel the data is sufficiently protected given the keys
// are hidden.

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
    initLights();
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
      populateRecentEvents(100);
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

function updateScroll(prediv) {
    prediv.scrollTop = prediv.scrollHeight;

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
    updateScroll(pre);
}

// Clears the PRE<content> tag of content
function clearPre() {
    var pre = document.getElementById('content');
    pre.innerHTML = '';
}

/**
 * A wrapper to processing the events from the
 * Google sheet.  This first determines the
 * number of rows in the sheet and then
 * calls on listRecentEvents along with
 * the number of records to show.
 * @param minCount
 */
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
    return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
    });
}

/**
 * Grab the events between the start and end dates.
 * The range is inclusve on the chance that the
 * dates fall on events.
 * @startDate The begninning of the event range
 * @endDAte The end of the event range
 */
function findNextEventByDate(startDate, endDate) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1xn0_Qahjb2CrXrXGYAtQ3fqZCu0Ycee3xYo-AmaGTg0',
        range: 'Sheet1!A1:D'
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

/**
 * Update the lights to be either active or inactive
 * @sensorMapID is the name of the sensor mapped to the SVG object.
 * @state maps to a sensorStyle which is the CSS used to show the element's state
 */
function updateLights (sensorMapID, state) {
    var stateMapped = sensorStates[state];
    var sensorStyle = "lights-" + stateMapped;
    var lights = document.querySelectorAll("[id*='" + sensorMapID + "']");
    for (var i = 0; i < lights.length; i++) {
        var light = lights[i];
        if (light.id.includes("arc")) {
            light.setAttribute("class", "lights-arc-" + stateMapped);
        } else {
            light.setAttribute("class", "lights-" + stateMapped);
        }
    }
}

/**
 * Offshoot of the update Activity method which adjusts
 * the class of the appropriate room rectangle based on the
 * state of the sensors in the room.  This method
 * changes the class of the sonos SVG to indicate when
 * the speakers are playing vs not
 */
function updateSonos (sensorMapID, sensorStyle) {
    var sonos = document.getElementById(sensorMapID);
    sonos.setAttribute("class", "sonos-" + sensorStyle);
    var sonosarcs = document.querySelectorAll("[id*='living-room-sonos-arc']");
    for (i = 0; i < sonosarcs.length; i++) {
        var arc = sonosarcs[i];
        arc.setAttribute("class", "sonos-arc-" + sensorStyle);
    }
}

/**
 * Updates the appropriate room, door or other object's class
 * with either an active or inactive flag based on the state
 * of the sensor associated with that object's location/presence.
 * @param datetime The timestamp of the event
 * @param sensorID The ID of the sensor (from the sheet) that is mapped to an
 * SVG object
 * @param state Whether the sensor is open, closed, active, inactive, etc.
 * See home-events.js for the mappigns of sensorID and state.
 */
function updateActivity(datetime, sensorID, state) {
    var sensorMapID = sensorIDs[sensorID];
    var sensorRoom = document.getElementById(sensorMapID);
    // If the object didn't match by ID, then we have a name that we apply
    // to the object - useful when we have multiple objects with the same ID.
    if (sensorRoom == null) {
        sensorRoom = document.getElementsByName(sensorMapID);
    }
    var sensorRoomWall = document.getElementById(sensorMapID + '-wall');
    // console.log("About to update sensorID " + sensorID + " in sensorMapID " + sensorMapID);
    var commonUpdate = true;
    console.log("Sensor room " + sensorRoom + " from sensorID " + sensorID);
    if (sensorRoom != null && sensorMapID != null) {
        var sensorStyle = sensorStates[state];
        // console.log("Loc for " + sensorID + " is " + sensorIDs[sensorID]);
        if (sensorMapID.includes("door")) {
            sensorStyle = "door-" + sensorStyle;
        } else if (sensorMapID.includes("light")) {
            updateLights(sensorMapID, state);
            commonUpdate = false;
        } else if (sensorMapID.includes("sonos")) {
            // Need to figure out why udpateSonos loop is not working
            // Something to do with the asynchronous nature of my code.
            // if (state == "playing") {
            //updateSonos(sensorMapID, sensorStyle);
            // }
            commonUpdate = false;
        } else {
            sensorStyle = "room-" + sensorStyle;
        }
        if (commonUpdate) {
            sensorRoom.setAttribute('class', sensorStyle);
            sensorRoomWall.setAttribute('class', sensorStyle + '-wall');
        }
    } else {
        console.log("Room for " + sensorID + " is not in list - mapped to " + sensorMapID);
    }
}

/**
 * Initialize the Sonos SVG object with the 6 arcs
 * Followed guidance provided here https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
 */
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

/**
 * Initialize the various light SVG object with the 6 arcs
 * Followed guidance provided here https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
 */
function initLights() {
    var lightsgaragearc1 = document.getElementById('lights-garage-outside-arc-1');
    lightsgaragearc1.setAttribute("d", describeArc(170, 724, 7, 135, 225));
    var lightsgaragearc2 = document.getElementById('lights-garage-outside-arc-2');
    lightsgaragearc2.setAttribute("d", describeArc(170, 724, 10, 135, 225));
    var lightsgaragearc3 = document.getElementById('lights-garage-outside-arc-3');
    lightsgaragearc3.setAttribute("d", describeArc(170, 724, 13, 135, 225));
    var lightsgaragearc4 = document.getElementById('lights-garage-outside-arc-4');
    lightsgaragearc4.setAttribute("d", describeArc(213, 704, 7, 45, 135));
    var lightsgaragearc5 = document.getElementById('lights-garage-outside-arc-5');
    lightsgaragearc5.setAttribute("d", describeArc(213, 704, 10, 45, 135));
    var lightsgaragearc6 = document.getElementById('lights-garage-outside-arc-6');
    lightsgaragearc6.setAttribute("d", describeArc(213, 704, 13, 45, 135));

    var lighthousesouth1arc1 = document.getElementById('lights-house-south1-arc-1');
    lighthousesouth1arc1.setAttribute("d", describeArc(256, 120, 7, 270, 90));
    var lighthousesouth1arc2 = document.getElementById('lights-house-south1-arc-2');
    lighthousesouth1arc2.setAttribute("d", describeArc(256, 120, 10, 270, 90));
    var lighthousesouth2arc1 = document.getElementById('lights-house-south2-arc-1');
    lighthousesouth2arc1.setAttribute("d", describeArc(408, 120, 7, 270, 90));
    var lighthousesouth2arc2 = document.getElementById('lights-house-south2-arc-2');
    lighthousesouth2arc2.setAttribute("d", describeArc(408, 120, 10, 270, 90));
}

/**
 * The main function of the site for now; this opens the Google sheet,
 * calculates the row numbers to report on based on the lastEventRecord
 * and the minCount and retrieves the event timestamp, event sensor,
 * and event state (open/close, active/inactive)
 * @param lastEventRecord The last row of the sheet
 * @param eventCount The number of events to iterate over
 */
function listRecentEvents(lastEventRecord, eventCount) {
    clearPre();
    firstEventRecord = lastEventRecord - eventCount + 1;
    // console.log("We have a first record " + firstEventRecord + " and a last record " + lastEventRecord);
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
          updateActivity(row[0], row[1], row[3]);
          await sleep(500);
        }
      } else {
        appendPre('No data found.');
      }
    }, function(response) {
        appendPre('Error: ' + response.result.error.message);
    });
}