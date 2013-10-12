 //$( "#message1" ).click(function() {alert("ss")})
 /*
 $( "#message1" ).on( "swipeleft", swipeleftHandle
  function swipeleftHandler( event ){
    alert("message1")*/
  // Callback function references the event target and adds the 'swipeleft' class to it

    //$( event.target ).addClass( "swipeleft" );
  

	
$(document).ready(function() {



/*
array=localStorage.getObj('arx')
if (array!=null)
{alert(array[0])
alert(array[1])}
if (array==null)
array=[]
var text=window.prompt("sometext","defaultvalue")
array[0]=text
array[1]="xxxxxx"


localStorage.setObj('arx',array);
*/
	$( "#swipeEvent" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
   postButtonClick("event");
 }
 })

  $( "#slideWeather" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
  postButtonClick('weather') }
 })

   $( "#slideLocation" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
  postButtonClick('location') }
 })

    $( "#slideQuote" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
  postButtonClick('quote') }
 })