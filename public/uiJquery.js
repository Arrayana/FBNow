 //$( "#message1" ).click(function() {alert("ss")})
 /*
 $( "#message1" ).on( "swipeleft", swipeleftHandle
  function swipeleftHandler( event ){
    alert("message1")*/
  // Callback function references the event target and adds the 'swipeleft' class to it

    //$( event.target ).addClass( "swipeleft" );
  
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}
	
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
	$( "#message1" ).on( "swipe", swipeHandler );
 
  // Callback function references the event target and adds the 'swipe' class to it
  function swipeHandler( event ){
   alert("ssss")
 }

 })