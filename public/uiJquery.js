 //$( "#message1" ).click(function() {alert("ss")})
 /*
 $( "#message1" ).on( "swipeleft", swipeleftHandle
  function swipeleftHandler( event ){
    alert("message1")*/
  // Callback function references the event target and adds the 'swipeleft' class to it

    //$( event.target ).addClass( "swipeleft" );
  

$(document).ready(function() {

	$( "#message1" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
   alert("ssss")
 }

 })