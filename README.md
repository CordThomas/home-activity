# home-activity
A home activity and security monitoring and reporting system

''n.b.'', this code is intentionally missing a js/keys.js file which includes 2 API keys needed by the script to function.  
Read the top of the js/google-sheets.js for instructions about the keys.

A web interface that displays a floor plan along with key sensors that are tracked.  At this point the Javascript code that drives the behavior and the CSS that defines the styles are quite rough.  I am trying to learn ES6 as part of this and proper handling of asynchronous code.

My intention is ultimately to generalize this as a collection of components that anyone could use to visualize the flow of activity in any space, whether a home, warehouse, office building or public spaces.

## The elements of the system

Following are the primary elements of my system without giving away too much

* SmartThings v2 hub
* Simple event logger - SmartApp that transmits events in near real time from SmartThings to a Google Sheet
** From https://github.com/krlaframboise/SmartThings/tree/master/smartapps/krlaframboise/simple-event-logger.src#simple-event-logger
* Google sheet script that populates the event data into a sheet (from the same repo as the event logger)
* Google sheet arrayformula(s) that calculate extra columns with some data mapping from the events
* Javascript Google API to pull real time data into the web page

## How I developed the site

Following are some notes on how I built this site.  Once the components above were in place, I 
created the first cut at the web page that shows events over time with for now a simple 500 ms delay
between events rather than 

* The floor plan - I've had our floor plan since we moved in but had to simplify it to just include the basic shapes of the rooms and doors in our house.  I did this work in OmniGraffle and exported to SVG.  The SVG file did not have the canvas names so i had to manually add IDs to the rectangle objects.  
* Custom home objects - i worked directly in a text editor to create the additional SVG objects such as the Sonos in the Kitchen and lights on the garage and front door.
* Being a novice at UX, i stole layout ideas shamelessly from various sites.  Nothing earth shattering there.  
* I then took the basic script from the Google API JS guide (https://developers.google.com/sheets/api/quickstart/js) to interogate the Google sheet for the most recent events and then changed the styles in the SVG to reflect active and inactive areas in the house.

There's a whole lot more I'd like to do with this, time permitting.  I'm tracking enhancements in <a href="../../issues">Issues</a> for an initial set of things I'd like to do.
