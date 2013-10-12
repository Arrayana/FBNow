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