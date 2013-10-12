/* ======================= Helpers ======================= */
// Pad leading zero
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

/* ======================= Local storage (Event) ======================= */

Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key))
}

/* ======================= Locationing (Event & Point of interest) ======================= */

var _radInKM = 1.0;

// Calculate the distance given two points
function rad(x) {
  return x * Math.PI / 180;
}

function distHaversine(p1, p2) {
  var R = 6371; // earth's mean radius in km
  var dLat = rad(p2.latitude - p1.latitude);
  var dLong = rad(p2.longitude - p1.longitude);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d.toFixed(3);
}

function isCloseToEachOther(location1, location2) {
  return distHaversine(location1, location2) < _radInKM;
};

// Get current location. Need callback
function getCurrentLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback({
        "latitude": position.coords.latitude,
        "longitude": position.coords.longitude
      });
    });
  }
}

// Some place far away because we don't need this for demo
function getMyHomeLocation() {
  return {
    "latitude": 0,
    "longitude": 0
  };
}

// @return
// Object {category: "Local business", category_list: Array[1], location: Object, name: "Fuki Sushi at Facebook", id: "175517295918833"}
function getClosestPointOfInterest(currentLocation, callback) {
  var searchString = 'search?type=place&distance=1000&center=' +
    currentLocation.latitude.toFixed(8) +
    "," +
    currentLocation.longitude.toFixed(8);
  FB.api(searchString, function (response) {
    // get the first POI
    if (response.data[0]) {
      if (typeof callback == "function") callback(response.data[0]);
    } else {
      if (typeof callback == "function") callback(null);
    }
  });
};

// @Place is {category: "Local business", category_list: Array[1], location: Object, name: "Fuki Sushi at Facebook", id: "175517295918833"}
// @return Object {place: Object, message: "s/sleep/hack/g ↵what am I doing here?", id: "10151987481300955", updated_time: "2013-10-12T07:40:01+0000"}
function searchStatusContainingPlace(place, callback) {
  var searchString = 'me?fields=id,name,statuses.fields(place,message)';
  FB.api(searchString, function (response) {
    var statuses = response.statuses.data;
    console.log(statuses);
    // Loop to compare place id
    var foundStatus = null;
    for (var i = statuses.length - 1; i >= 0; i--) {
      if (statuses[i].id == place.id) {
        foundStatus = statuses[i].id;
      }
    };

    callback(foundStatus);

  });
};

// @pointOfInterest
// Object {category: "Local business", category_list: Array[1], location: Object, name: "Fuki Sushi at Facebook", id: "175517295918833"}
function searchStatusContainingPointOfInterest(pointOfInterest, callback) {
  searchStatusContainingPlace(pointOfInterest, callback);
}

/* ====== Timing (To check recent statuses about 'event' and 'point of interest' ====== */

// http://stackoverflow.com/questions/2782976/convert-facebook-date-format-to-javascript-date
function timeAgo(time) {
  var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
    diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
    return;

  return day_diff == 0 && (
    diff < 60 && "just now" ||
    diff < 120 && "1 minute ago" ||
    diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
    diff < 7200 && "1 hour ago" ||
    diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
}

function isLessThan1HourAgo(status) {
  var prettyDate = timeAgo(status.updated_time);
  console.log(prettyDate);
  return prettyDate == "1 hour ago" ||
    prettyDate.indexOf('minute') > -1 ||
    prettyDate.indexOf('just now') > -1;

}

function isLessThan5HourAgo(status) {
  var prettyDate = timeAgo(status.updated_time);
  console.log(prettyDate);
  return prettyDate == "1 hour ago" ||
    prettyDate == "2 hour ago" ||
    prettyDate == "3 hour ago" ||
    prettyDate == "4 hour ago" ||
    prettyDate == "5 hour ago" ||
    prettyDate.indexOf('minute') > -1 ||
    prettyDate.indexOf('just now') > -1;

}

/* ======================= Weather ======================= */

function getTemperatureDiff(currentLocation, callback) {

  // Current temperature
  var urlstring = "http://api.wunderground.com/api/dd8a92c2da3add01/geolookup/conditions/q/" +
    currentLocation.latitude.toFixed(8) +
    "," +
    currentLocation.longitude.toFixed(8) +
    ".json";

  // Avg temperature
  // # Hard coded to Pittsburgh for debug #            
  var urlstring2 = "http://api.wunderground.com/api/dd8a92c2da3add01/geolookup/almanac/conditions/q/" +
  // currentLocation.latitude.toFixed(8) + 
  // "," +
  // currentLocation.longitude.toFixed(8) +
  '40.450343,-80.024464' +
    ".json";

  //geolookup/q/37.48,-122.14.json
  $.ajax({
    url: urlstring,
    dataType: "jsonp",
    success: function (parsed_json) {
      var location = parsed_json['location']['city'];
      var temp_f = parsed_json['current_observation']['temp_f'];
      console.log("Current temperature in " + location + " is: " + temp_f);
      $.ajax({
        url: urlstring2,
        dataType: "jsonp",
        success: function (parsed_json) {
          var location = parsed_json['location']['city'];
          var avg_f = parsed_json['current_observation']['temp_f'];
          console.log("Average temperature in " + location + " is: " + avg_f);
          temp_diff = temp_f - avg_f;

          // Callback
          callback(temp_diff);
        }
      });
    }
  });

}

/* ======================= Event ======================= */

// Return event attendees and my friends
function getAttendingEventAndFriends(response) {

  // Prepare current date to be the same as response.event date format for comparison
  var current_events = 0,
    all_events = 0;
  var currentdate = new Date();
  var datetime = currentdate.getFullYear() + "-" + pad(currentdate.getMonth() + 1, 2) + "-" + pad(currentdate.getDate(), 2) + "T" + pad(currentdate.getHours(), 2) + ":" + pad(currentdate.getMinutes(), 2) + ":" + pad(currentdate.getSeconds(), 2) + "-" + pad(currentdate.getTimezoneOffset() / 60, 2) + "00";

  var results = {};

  for (var i = 0; i < response.events.data.length; i++) {
    // If that event has both start & end time. Check whether current time is in the event's timeframe
    if (response.events.data[i].end_time) {
      // $('#events').append(response.events.data[i].end_time);
      if (response.events.data[i].end_time > datetime && response.events.data[i].start_time < datetime) {
        // :: Event result ::
        results.event = response.events.data[i];
        break;
      }
    }
    // Otherwise, that event is all-day. Just check whether current date is the same as event's
    else if (datetime.indexOf(response.events.data[i].start_time) != -1) {
      // Return this event as a result
      results.event = response.events.data[i];
      break;
    }
  }

  // Check if there's any attending event
  if (results.event != undefined) {
    results.friends = [];
    // Search for people attending this event that are my friends
    var attendeesHash = {};
    for (var j = 0; j < results.event.attending.data.length; j++) {
      attendeesHash[results.event.attending.data[j].id] = true;
    }
    // Search for your friend and add him to the results
    for (var j = 0; j < response.friends.data.length; j++) {
      if (attendeesHash[response.friends.data[j].id] == true) {
        // :: Append friend object to result ::
        results.friends.push(response.friends.data[j]);
      }
    }
  }
  return results;
}

function getMessageTimeSpentPercent(timeSpentPercent) {
  if (timeSpentPercent < 10)
    return "Feeling excited!!.. just started"
  if (40 < timeSpentPercent && timeSpentPercent < 60)
    return "Lets keep rolling..just half way done!!!"
  if (90 < timeSpentPercent)
    return "Almost done!.."
}

// Store "myEvent" into offline storage
function storeEvent(myEvent) {
  eventHash = localStorage.getObj('eventHash');
  if (eventHash == null) {
    eventHash = {};
    eventHash[myEvent.id] = myEvent;
  } else {
    eventHash[myEvent.id] = myEvent;
  }
}

// Search status mentioning about that place or event
function searchStatusContainingEvent(myEvent) {
  eventHash = localStorage.getObj('eventHash');

  if (eventHash != null) {
    return eventHash[myEvent.id];
  }

  return null;
}

/* ================= Random quote & news ==================== */
function getRandomQuote(callback) {
  $.ajax({
    url: "http://api.theysaidso.com/qod.js?category=life", //http://www.iheartquotes.com/api/v1/random.json",
    dataType: "jsonp",
    success: function (parsed_json) {
      callback(parsed_json['data']['contents']['quote']);
    }
  });
}

function getRandomNews(callback) {
  $.ajax({
    url: "http://api.espn.com/v1/now/popular?apikey=tpnk43zgq4uqrpage6fjhsn8", //http://www.iheartquotes.com/api/v1/random.json",
    dataType: "jsonp",
    success: function (parsed_json) {
      callback(parsed_json['feed'][0]['headline']);
    }
  });
}