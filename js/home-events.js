/* Establish some constants */

/* Map the sensor IDs to the SVG IDs */
var sensorIDs = {};
sensorIDs["Motion Sensor - Living Room"] = "living-room";
sensorIDs["Motion Sensor - Bedroom"] = "bedroom-master";
sensorIDs["Motion Sensor - Hallway"] = "hallway";
sensorIDs["Motion Sensor - Kitchen"] = "kitchen";
sensorIDs["Motion Sensor - Sunroom"] = "solarium";
sensorIDs["Motion Sensor - Guest 1"] = "bedroom-guest-1";
sensorIDs["Motion Sensor - Guest 2"] = "bedroom-guest-2";
sensorIDs["Motion Sensor - Garage"] = "garage-laundry";
sensorIDs["Door - Garage Laundry"] = "door-garage";
sensorIDs["Door - Kitchen"] = "door-kitchen";
sensorIDs["Door - Front"] = "door-front";
sensorIDs["Door - Reading Room to Solarium"] = "door-solarium-reading";
sensorIDs["Door - Solarium Sliding Main"] = "door-solarium";
sensorIDs["Living Room Sonos"] = "living-room-sonos";
sensorIDs["Front Door Light - West"] = "lights-house-south2";
sensorIDs["Front Door Light - East"] = "lights-house-south1";
sensorIDs["Garage - back lights dimmer"] = "lights-garage-outside";


var sensorStates = {};
sensorStates["closed"] = "inactive";
sensorStates["open"] = "active";
sensorStates["present"] = "active";
sensorStates["not present"] = "inactive";
sensorStates["active"] = "active";
sensorStates["inactive"] = "inactive";
sensorStates["online"] = "active";
sensorStates["offline"] = "inactive";
sensorStates["on"] = "active";
sensorStates["off"] = "inactive";

/* Sonos related states - for some reason, stopped happens before playing
   so, reversing these for now
 */
sensorStates["stopped"] = "active";
sensorStates["playing"] = "inactive";
