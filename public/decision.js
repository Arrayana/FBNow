// Keep user options of status to post
var prepared_message = {};
var prepared_friends = {};
var prepared_place = {};
var prepared_event = {};

/* --- Mandatory functions from initfb.js --- */
// Update UI to prompt user to login
function promptLogin(request_message) {
  $('#showButton').removeAttr('disabled');
  $('#showButton').html(request_message);
  $('#showButton').off('click'); // remove previous click handler
  $('#showButton').click(clickToLoginHandler);
}

// Update UI to say it's ready to go!
function promptStart() {

  // Sample call: Show name
  FB.api('/me?fields=name', function (response) {
    $('#showButton').html('Hello ' + response.name + '!');
  });

  generateStatusMessage();
}
/* --------------------------------------------*/

// Post Facebook status
//
function postFBStatus(message, friends, place, myEvent) {

  // Mandatory params for FB post
  var parameters = {
    "access_token": fb_authResponse.accessToken,
    "message": message
  };
  // Tag friends if friends are provided
  if (friends && friends != "") {
    parameters.tags = friends.join()
    // alert(friends)
  }
  // Tag place if place is provided
  if (place) {
    parameters.place = place;
  }
  // If event is provided, store it in local storage
  if (myEvent) {
    storeEvent(myEvent);
  }

  alert(message)
  // POST MESSAGE! (Currently disabled because of the ban T_T)
  //$.post( "https://graph.facebook.com/me/feed", parameters).done(function( data ) {
  alert("Posted!!");
  //});
}

// This will be called by message generator
// to prepare content, wait for user to post
//
function preparePostContent(type, message, friends, place, myEvent) {
  prepared_message[type] = message;
  prepared_friends[type] = friends;
  prepared_place[type] = place;
  prepared_event[type] = myEvent;

  if (type == "event")
    $("#messageEvent").html(message);
  if (type == "weather")
    $("#messageWeather").html(message);
  if (type == "location")
    $("#messageLocation").html(message);
  if (type == "quote")
    $("#messageQuote").html(message); // $("#friends..")
  $("#postButton").removeAttr("disabled");
}

// The heart!
//
function generateStatusMessage() {
  // Get an object from FB.api about everything I need
  FB.api('/me?fields=name,events.fields(name,venue,attending.fields(id),end_time,start_time),friends.fields(id,name)',
    function (response) {
      console.log("Got response from Graph API! " + response.name);
      // Also need to wait for location.
      getCurrentLocation(function (currentLocation) {
        // Got everything we need. Proceed!
        console.log("Got location!");
        // Is there a happenning event that I'm suppose to be attending now?
        // Results will be { "event": {..}, "friends": [..] }
        var eventAndFriends = getAttendingEventAndFriends(response);
        if (eventAndFriends.event != undefined) {
          var myEvent = eventAndFriends.event;
          var friendsInEvent = eventAndFriends.friends;

          // Yes. Am I close to that event's location?
          var isCloseToEvent = isCloseToEachOther(currentLocation, myEvent.venue);
          if (isCloseToEvent) {

            // Yes. Have I posted a status about this event earlier?
            var status = searchStatusContainingEvent(myEvent);
            if (status) {
              //when a message about this event has been posted
              // Has he posted about it recently (1hr) ?
              if (isLessThan1HourAgo(status)) {
                // Get out of this logic
                // ** do nothing and proceed to next logic **
              } else {
                // More than 1 hour ago. Post the event progress!
                var timeSpentPercent = getEventTimeSpentPercent(myEvent);
                preparePostContent("event",
                  "I am still at " + myEvent.name + ". " + getMessageTimeSpentPercent(timeSpentPercent), // message
                  [], // friends (no friends to avoid disturbing them)
                  myEvent.venue.id, // place
                  myEvent // event
                );
                //return;
              }
            } else {
              // No status about the event yet. Post a status about this event!
              //first time a event is retrieved
              preparePostContent("event",
                "I am at " + myEvent.name + "!", // message
                friendsInEvent, // tag every friend here!
                myEvent.venue.id, // place
                myEvent // event
              );
              //return;
            }
          } else {
            // I'm not close to that event. I must have missed it!
            preparePostContent("event",
              "I missed " + myEvent.name + " T_T", // message
              [], // no friend
              null, // no place
              null // no event
            );
            //return;
          }
        } else {
          // No happening event.
          preparePostContent("event",
            "Bored and looking for events. Any ideas?", // message
            [], // no friend
            null, // no place
            null // no event
          );

        }

        /*** Weather ***/

        getTemperatureDiff(currentLocation, function (temperatureDiff) {
          if (temperatureDiff > 10) {
            // It's hotter than normal
            preparePostContent("weather",
              "OMG ..It's so hot in here!!", [], // no friend
              null, // no place
              null // no event
            );

          } else if (temperatureDiff < -10) {
            // It's cooler than normal
            preparePostContent("weather",
              "Crazy weather, I'm freezing now!", [], // no friend
              null, // no place
              null // no event
            );
          } else {
            preparePostContent("weather", "bahhh boring weather.. same old!!", [], // no friend
              null, // no place
              null // no event
            );
          }
        });

        /*** Point of interest ***/

        getClosestPointOfInterest(currentLocation, function (pointOfInterest) {
          if (pointOfInterest) {
            // I'm closed to somewhere. So, have I posted about it recently?
            preparePostContent(
              "location",
              "I'm here! " + pointOfInterest.name, [], // friend
              null, // place
              null // event
            );

            /*var status = searchStatusContainingPointOfInterest(pointOfInterest.name);
						if (isLessThan5HourAgo(status)) {
							// No use case for this.
							// ** do nothing **
						} else {
							// Check in here!
							preparePostContent("I'm here! "+pointOfInterest.name);
						}*/
          }
        });

        /*** Random News ***/

        getRandomNews(function (quoteResult) {
          if (quoteResult) {
            // I'm closed to somewhere. So, have I posted about it recently?
            preparePostContent(
              "quote",
              quoteResult, [], // friend
              null, // place
              null // event
            );
          }
        });

      }); // end callback of getCurrentLocation()

    }); // end decision tree

}

// Event handler for POST Button

function postButtonClick(type) {
  postFBStatus(prepared_message[type], prepared_friends[type], prepared_place[type], prepared_event[type]);
}