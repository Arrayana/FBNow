//
//
//

var _radInKM = 1.0;

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
  
  var testMyEvent = {"latitude": 37.482898, "longitude": -122.149909};
  var distance = distHaversine(myLocation, testMyEvent);
  return isClosedToLocation(myLocation, testMyEvent);
};

function isClosedToLocation(location1, location2){
  return distHaversine(location1, location2) > _radInKM;
}

// @location: {lat: xxx, long: yyy}
function getClosestPointOfInterest(location){

};


function searchStatusContainingPlaceName(placeName, statuses, currentLocation){
  statuses =  {
    "data": [
      {
        "place": {
          "id": "152339121642221", 
          "name": "Facebook NorCal Regional Hackathon", 
          "location": "Facebook HQ", 
          "start_time": "2013-10-11T17:00:00-0700"
        }, 
        "message": "s/sleep/hack/g \nwhat am I doing here?", 
        "id": "10151987481300955", 
        "updated_time": "2013-10-12T07:40:01+0000"
      }, 
      {
        "place": {
          "id": "151674991513447", 
          "name": "The Flatirons", 
          "location": {
            "street": "", 
            "city": "Boulder", 
            "state": "CO", 
            "country": "United States", 
            "zip": "80302", 
            "latitude": 39.989807108461, 
            "longitude": -105.29370546867
          }
        }, 
        "message": "Hello Boulder!!", 
        "id": "10151697226090955", 
        "updated_time": "2013-05-28T18:33:17+0000"
      }, 
      {
        "place": {
          "id": "141231406010147", 
          "name": "South Dakota State Line", 
          "location": {
            "street": "", 
            "zip": "", 
            "latitude": 43.304181087223, 
            "longitude": -104.05363399699
          }
        }, 
        "message": "Hello nowhere!", 
        "id": "10151695442160955", 
        "updated_time": "2013-05-27T23:27:09+0000"
      }, 
      {
        "message": "Hello Madison!!", 
        "id": "10151691644070955", 
        "updated_time": "2013-05-25T23:00:45+0000"
      }, 
      {
        "message": "Hello Chicago!!", 
        "id": "10151690131905955", 
        "updated_time": "2013-05-25T00:44:57+0000"
      }
    ],
  } 

  var data = statuses.data;
  var foundPlace = false;
  var radInKM = 1.0;

  for (var i = data.length - 1; i >= 0; i--) {
    var place = data[i].place;

    // If the status has location already.
    // Location can be:
    //  name => string
    //  noname => object
    if (place.location != null) {
      if (typeof place.location == "string"){
        if (place.location.toLowerCase().indexOf(placeName) >= 0) {
          foundPlace = true;
        }else{
          foundPlace = false;
        };
      }else if(typeof place.location == "object"){
        // Look for closed distance
        if(currentLocation != null){
          foundPlace = isClosedToLocation(currentLocation, { latitude: place.location.latitude,
                                                              longitude: place.location.longitude
                                                            });
        }else{

        }
      }else{
        console.log("I dont know where you were!!");
      }
      
    }else{ 
      // No location info

    }
    

  };

  return foundPlace;
}