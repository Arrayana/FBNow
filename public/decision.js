// Keep user options of status to post
var prepared_message = {};
var prepared_friends = {};
var prepared_place = {};
var prepared_event = {};

/* --- Mandatory functions from initfb.js --- */
// Update UI to prompt user to login
function promptLogin(request_message) {
  // $('#showButton').button('option','disabled',false);
  $("#showButton").button( "enable" );
  // alert($('#showButton'));
  //   $('#showButton').removeAttr('disabled');
  //   $('#showButton').data('disabled','false');
  //   $('#showButton').attr('disabled', false).removeClass( 'ui-state-disabled' );
    // $('#showButton').html(request_message);
    // $("#showButton").button("option","text",request_message);
    // $('#showButton').off('click'); // remove previous click handler
    $('#showButton').click(clickToLoginHandler);
}

// Update UI to say it's ready to go!
function promptStart() {
    generateStatusMessage();
}
/* ------------ Click handlers --------------- */
function clickToLoginHandler() {
  $("#showButton").button( "disable" );
    // $('#showButton').html('Waiting for user');
    FB.login(function(response) {
      // Check if user has really granted us
      checkUser();
    }, {scope: required_permissions});
};
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
  if (friends) {
    var friendsIDList = [];
    for (var i=0; i<friends.length; i++) {
      friendsIDList.push(friends[i].id);
    }
    parameters.tags = friendsIDList.join();
    // alert("Also tag these guys: "+friendsIDList.join());
  }
  // Tag place if place is provided
  if (place) {
    parameters.place = place;
  }
  // If event is provided, store it in local storage
  if (myEvent) {
    storeEvent(myEvent);
  }

  //alert(message)
  // POST MESSAGE! (Currently disabled because of the ban T_T)
  $.post( "https://graph.facebook.com/me/feed", parameters).done(function( data ) {

    $('#feedback').html("Your status was successfully posted")
   
    setInterval(function(){ 
      $('#feedback').html("")
      $('#feedback').css("color","rgb(59, 89, 152)")

    },5000);
  })
    .fail( function(xhr, textStatus, errorThrown) {
    
      $('#feedback').css("color","rgb(255, 0, 0)")
      $('#feedback').html("Ooops, there was an error. Please try again")
      
      setInterval(function(){  
        $('#feedback').html("")
        $('#feedback').css("color","rgb(59, 89, 152)")
    },5000);
  });
}

// This will be called by message generator
// to prepare content, wait for user to post
//
function preparePostContent(type, message, friends, place, myEvent) {
  prepared_message[type] = message;
  prepared_friends[type] = friends;
  prepared_place[type] = place;
  prepared_event[type] = myEvent;

  if (type == "event") {
    $("#messageEvent").html(message);
    if (friends && friends.length>0) {
      var friendsName = [];
      for (i=0; i < friends.length; i++) {
        // Maximum 5 friends name to display
        if (i == 5) {
          friendsName.push("and "+(friends.length-i)+" more");
          break;
        } else {
          friendsName.push(friends[i].name);
        }
      }
      $("#messageEvent").append("<br><small>with friend(s): <span style='color:#336699'></span></small>");
      $("#messageEvent small span").html(friendsName.join());
    }
  }
  if (type == "weather") {
    $("#messageWeather").html(message);
  }
  if (type == "location") {
    $("#messageLocation").html(message);
  }
  if (type == "quote") {
    $("#messageQuote").html(message); // $("#friends..")
  }

  // Enable Post button
  $("#postButton").removeAttr("disabled");
}

// The heart of our app! Decision tree!!
var fieldsNeeded = "name,events.fields(name,venue,attending.fields(id),end_time,start_time),friends.fields(id,name)";
//
function generateStatusMessage() {
  
  console.log("Getting data from Graph API..");
  // Get an object from FB.api about everything I need
  FB.api('/me?fields='+fieldsNeeded, function (response) {
      console.log("Got response from Graph API! " + response.name);
      console.log("Getting current location..");

      // Also need to wait for location.
      getCurrentLocation(function (currentLocation) {
        // Got everything we need. Proceed!
        console.log("Got current location!");

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

              if (isEventLessThan1HourAgo(status)) {

                // Get out of this logic
                // ** do nothing and proceed to next logic **
              } else {
                // More than 1 hour ago. Post the event progress!
                var timeSpentPercent = getEventTimeSpentPercent(myEvent);
                preparePostContent("event", // content type
                  "I am still at " + myEvent.name + ". " + getMessageTimeSpentPercent(timeSpentPercent), // message
                  null, // friends (no friends to avoid disturbing them)
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
              null, // friend
              null, // place
              null // event
            );
            //return;
          }
        } else {
          // No happening event.
          preparePostContent("event",
            "Bored and looking for events. Any ideas?", // message
            null, // friend
            null, // place
            null // event
          );

        }

        /*** Weather ***/

        getTemperatureDiff(currentLocation, function (temperatureDiff) {
            // Random between temperature & quote
            if(getRandomNumberBetween(0,1) == 1){
                // Get quote
                getRandomQuote(function(result) {
                    preparePostContent("weather",
                        result,
                        null, // friend
                        null, // place
                        null // event
                    );
                });
            }
            else{
                // Get weather
              if (temperatureDiff > 10) {
                // It's hotter than normal
                preparePostContent("weather",
                  "OMG ..It's so hot in here!!",
                  null, // friend
                  null, // place
                  null // event
                );

              } else if (temperatureDiff < -10) {
                // It's cooler than normal
                preparePostContent("weather",
                  "Crazy weather, I'm freezing now!",
                  null, // friend
                  null, // place
                  null // event
                );
              } else {
                preparePostContent("weather", "Boring weather.. same old!!",
                  null, // friend
                  null, // place
                  null // event
                );
              }
            }
        });

        /*** Point of interest ***/

        getClosestPointOfInterest(currentLocation, function (pointOfInterest) {
          if (pointOfInterest) {
            // I'm closed to somewhere. So, have I posted about it recently?
            preparePostContent(
              "location",
              "I'm here at " + pointOfInterest.name, // message
              null, // friend
              pointOfInterest.id, // place
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

        getRandomNews(function (result) {
          // Random news
          preparePostContent(
            "quote",
            result, // message
            null, // friend
            null, // place
            null // event
          );
        });

      }); // end callback of getCurrentLocation()

    }); // end decision tree
$.mobile.hidePageLoadingMsg();
}

// Event handler for POST Button
//
function postButtonClick(type) {
    $('#feedback').css("color","rgb(59, 89, 152)")

    $('#feedback').html("Posting..")

    postFBStatus(prepared_message[type], prepared_friends[type], prepared_place[type], prepared_event[type]);
    generateStatusMessage();
}