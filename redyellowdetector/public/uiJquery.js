 $( "#message1" ).click(function() {alert("ss")})
 
 $( "#message1" ).on( "swipeleft", swipeleftHandle
  // Callback function references the event target and adds the 'swipeleft' class to it
  function swipeleftHandler( event ){
    alert("message1")

    //$( event.target ).addClass( "swipeleft" );
  }