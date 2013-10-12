//
//
//
function showResponse(response){
  console.log(response);
};

// Calculate the distance given two points
function rad(x) {return x*Math.PI/180;}
function distHaversine(p1, p2) {
  var R = 6371; // earth's mean radius in km
  var dLat  = rad(p2.latitude - p1.latitude);
  var dLong = rad(p2.longitude - p1.longitude);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) * Math.sin(dLong/2) * Math.sin(dLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  return d.toFixed(3);
}

// @MyEvent is an events I'm going to attend.
// @myLocation is {lat: xxx, long: yyy}
function isCloseToTheEvent(myLocation, myEvent){
  var radInKM = 1.0;
  var testMyEvent = {"latitude": 37.482898, "longitude": -122.149909};
  var distance = distHaversine(myLocation, testMyEvent);
  if(distance <= radInKM){
    // You're in 1km radious.
    return true;
  }else{
    return false;
  }
};

// @location: {lat: xxx, long: yyy}
function getClosestPointOfInterest(location){

};


function searchStatusContainingPlaceName(name){

  //return status
}