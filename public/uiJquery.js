 //$( "#message1" ).click(function() {alert("ss")})
 /*
 $( "#message1" ).on( "swipeleft", swipeleftHandle
  function swipeleftHandler( event ){
    alert("message1")*/
  // Callback function references the event target and adds the 'swipeleft' class to it

    //$( event.target ).addClass( "swipeleft" );
  

	
$(document).ready(function() {



  	$( "#swipeEvent" ).on( "swipe", swipeEventHandler );
   
    // Callback function references the event target and adds the 'swipe' class to it
    function swipeEventHandler( event ){
      postButtonClick("event");
   
    }

    $( "#slideWeather" ).on( "swipe", swipeWeatherHandler );
   
    // Callback function references the event target and adds the 'swipe' class to it
    function swipeWeatherHandler( event ){
      postButtonClick('weather') 
    }

     $( "#slideLocation" ).on( "swipe", swipeLocationHandler );
   
    // Callback function references the event target and adds the 'swipe' class to it
    function swipeLocationHandler( event ){
      postButtonClick('location') 
    }

    $( "#slideQuote" ).on( "swipe", swipeQuoteHandler );
   
    // Callback function references the event target and adds the 'swipe' class to it
    function swipeQuoteHandler( event ){
      postButtonClick('quote') 
    }

})