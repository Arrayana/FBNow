var abc = "hello";
var fb_me;
var fb_authResponse; // .uid .accessToken
var required_permissions = 'email,user_likes,user_subscriptions,read_friendlists,read_stream,user_events';

// Call this when the page has loaded
$(document).ready(function() {
  console.log('Initializing FB SDK. Requesting permissions: '+required_permissions);

  $.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
    window.fbAsyncInit = function() {
      // init the FB JS SDK
      FB.init({
          appId      : '534972969913512',                        // App ID from the app dashboard
          channelUrl : '//facebooknow.herokuapp.com/channel.html', // Channel file for x-domain comms
          status     : true,                                 // Check Facebook Login status
          xfbml      : true                                  // Look for social plugins on the page
        });
      console.log('FB sdk inited');

      // Subscribe to login event
      FB.Event.subscribe('auth.login', function(response) {
        // do something with response
        console.log("auth.login response changed. Probably the user has just logged in.");
      });

      // Check user's login status and granted permissions
      checkUser();

    };
  });
});

/* --- Location functions --- */
function getLocation()
{
  var x=document.getElementById("demo");
  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else{x.innerHTML="Geolocation is not supported by this browser.";}
}
function showPosition(position)
{
  var x=document.getElementById("demo");
  x.innerHTML="Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude;
}
function getPosition(position)
{
   if (window.fbnow == null){
      window.fbnow = {};
   }
    window.fbnow.abc = position.coords.latitude + "," + position.coords.longitude;
}


/* ------------ Click handlers --------------- */

function clickToLoginHandler() {
    $('#showButton').attr('disabled','disabled');
    $('#showButton').html('Waiting for user');
    FB.login(function(response) {
      // Check if user has really granted us
      checkUser();
    }, {scope: required_permissions});
};

function clickToStartHandler() {
  start();
}

/* -------- Login, permission functions ------------ */

function checkUser() {
  // Check whether the user is logged in
  //
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // Logged in
      fb_authResponse = response;

      // Check required permissions
      console.log("checking permissions..");
      FB.api('/me/permissions', function(response) {
        for (var key in response.data[0]) {
          console.log("permissions: "+key+" = "+response.data[0][key]);
        }

        var list = required_permissions.split(',');
        for (var i=0; i<list.length; i++) {
          console.log("checking permission of "+list[i]);
          if (response.data[0][list[i]] === undefined) {
            // At least one permission hasn't been granted yet!
            promptLogin("Click to grant us more required permissions");
            return;
          }
        }

        // It will call this function if all permissions have been granted.
        promptStart();
      });

    } else if (response.status === 'not_authorized') {
      // the user is logged in to Facebook, 
      // but has not authenticated your app
      promptLogin("Click here to authorize this app");

    } else {
      // the user isn't logged in to Facebook.
      promptLogin("Click here to login");
    }
  });
}

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
  FB.api('/me?fields=name', function(response) {
    $('#fbName').html(response.name);
  });

  $('#showButton').removeAttr('disabled');
  $('#showButton').html('<br>Everything is good. Click here to start!<br>&nbsp;');
  $('#showButton').off('click');
  $("#showButton").click(clickToStartHandler);
}

function getWeather(){
    //TODO: Remove this
    if (window.fbnow == null){
        window.fbnow = {};
    } window.fbnow.abc = "37.48,-122.14";
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getPosition);
        //alert(window.fbnow.abc);
    }
    var temp_diff =0;
    jQuery(document).ready(function($)  {
        //geolookup/q/37.48,-122.14.json
    $.ajax({ url : "http://api.wunderground.com/api/dd8a92c2da3add01/geolookup/conditions/q/"+window.fbnow.abc+".json",
        dataType : "jsonp", success : function(parsed_json)
        {
            var location = parsed_json['location']['city'];
            var temp_f = parsed_json['current_observation']['temp_f'];
            alert("Current temperature in " + location + " is: " + temp_f);
            $.ajax({ url : "http://api.wunderground.com/api/dd8a92c2da3add01/geolookup/almanac/conditions/q/"+window.fbnow.abc+".json",
                dataType : "jsonp", success : function(parsed_json)
                {
                    var location = parsed_json['location']['city'];
                    var avg_f = parsed_json['current_observation']['temp_f'];
                    alert("Average temperature in " + location + " is: " + temp_f);
                    temp_diff = temp_f - avg_f;
                }
            });

        }

    });




    });
    alert("good it is " + temp_diff) ;//If temp_diff > 2 too hot, <2  too cold...we can add conditions...
}

function FBFetch() {
    $('#events').html('Processing..');

    FB.api('/me?fields=events,friends,statuses.limit(10)', function(response) {
        $('#events').html('');

        fb_response = response;
        friendslist = response.friends;

        var current_events=0,all_events=0;
        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "-"
            +(currentdate.getMonth()+1)+ "-"
            + currentdate.getDate() + "T"
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds() + -currentdate.getTimezoneOffset()/60 ;

        // Likes
        $('#events').append("I can only try to get event....");
        $('#events').append("I can only try to get event....");
        $('#events').append(response.events.data.length);

        for (var i=0; i<response.events.data.length; i++) {
            $('#events').append("\n"+i);
            //When date and time are needed
            if(response.events.data[i].end_time) {
                $('#events').append(response.events.data[i].end_time);
                if(response.events.data[i].end_time>datetime && response.events.data[i].start_time <datetime)
                {
                    $('#events').append(response.events.data[i].name + " in progress\n");
                    $('#events').append(response.events.data[i].id + " in progress\n");
                    FB.api('/'+response.events.data[i].id+"?fields=attending", function(responseinner) {
                        fb_responseinner = responseinner;
                        //friendslist = response.friends;
                        $('#events').append(" " + responseinner.attending.data.length + "attending the event with you\n");
                        for (var j=0; j<responseinner.attending.data.length; j++) {
                            //Everyone attending = $('#events').append(responseinner.attending.data[j].id + " ");
                            for(var k=0;k<response.friends.data.length;k++){
                                if(response.friends.data[k].id == responseinner.attending.data[j].id){
                                    $('#events').append(" " + responseinner.attending.data[j].name);
                                }
                            }
                        }
                    });
                }
            }
            //If only the date is relevant, check that date is the same
            else if(datetime.indexOf(response.events.data[i].start_time)!=-1 ) {
                $('#events').append(response.events.data[i].name + " in progress\n");
            }
        }


    });
}


/* ------- Main functions for Red-Yellow Detector ------- */

function start() {
  $('#showButton').attr('disabled','disabled');
  $('#results').html('Processing..');

  FB.api('/me?fields=likes,subscribedto', function(response) {
    $('#results').html('');

    fb_response = response;

    var liked_red=0,subscribedto_red=0,liked_yellow=0,subscribedto_yellow=0;

    // Likes
    $('#results').append("<p>Total "+response.likes.data.length+" page(s) liked.</p>");
    for (var i=0; i<response.likes.data.length; i++) {
      var like = response.likes.data[i];
      if (like.id in red_pages)
        liked_red++;
      else if (like.id in yellow_pages)
        liked_yellow++;
      // console.log(i+": "+status.message);
    }
    $('#results').append("<p>You liked <span class='verybig'>"+liked_red+"</span> RED pages, \
      <span class='verybig'>"+liked_yellow+"</span> YELLOW pages.");

    // Subscribed to
    $('#results').append("<p>You subscribed to "+response.subscribedto.summary.total_count+" people.</p>");
    for (var i=0; i<response.subscribedto.data.length; i++) {
      var subscription = response.subscribedto.data[i];
      if (subscription.id in red_people)
        subscribedto_red++;
      else if (subscription.id in yellow_people)
        subscribedto_yellow++;
    }
    $('#results').append("<p>You are following <span class='verybig'>"+subscribedto_red+"</span>\
     RED people, <span class='verybig'>"+subscribedto_yellow+"</span> YELLOW people.");

    var red_score = liked_red+subscribedto_red;
    var yellow_score = liked_yellow+subscribedto_yellow;
    if (red_score > yellow_score) {
      $('#results').append("<p><span class='verybig'>You are RED.</span>\
        <br><img src='/thaksin.jpg'></p>")
    } else if (red_score < yellow_score) {
      $('#results').append("<p><span class='verybig'>You are YELLOW.\
        </span><br><img src='/sondhi.jpg'></p>")
    } else {
      $('#results').append("<p><span class='verybig'>You are IN-BETWEEN.\
        </span><br><img src='/inbetween.jpg'></p>")
    }

    $('#showButton').removeAttr('disabled');
  });
}
