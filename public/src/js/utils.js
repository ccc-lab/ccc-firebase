function sign(num) {
    // IE does not support method sign here
    if (typeof Math.sign === 'undefined') {
        if (num > 0) {
            return 1;
        }
        if (num < 0) {
            return -1;
        }
        return 0;
    }
    return Math.sign(num);
}

function precise_round(num, decimals) {
    var t=Math.pow(10, decimals);
    return (Math.round((num * t) + (decimals>0?1:0)*(sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
}

function saveData(filedata, dataRef, thenFunc){
    console.log("Saving progress...");
    dataRef.putString(filedata).then(thenFunc);
}

function checkWorker(workerId, studyName) {
    return firebase.database().ref(studyName + '/' + workerId).once('value');
}

function addWorker(workerId, studyName) {
  if(workerId !== "demo") {
    var tokenRef = database.ref(studyName + '/' + workerId);
    tokenRef.set({
        complete : 1
    });
    console.log("Added a worker with completion value 1.");
  }
}

function showError() {
  $( '#jspsych-target' ).append($('<div>', {
     id: 'error',
     class: 'text-center',
     html: '<p>It appears that you have previously completed a study from the Language Processing Lab that used the same data as, or similar data to, the study you are attempting to complete now. Unfortunately, we cannot allow the same person to participate in an experiment more than once. We apologize for the inconvenience, but we must ask that you return your HIT now. (This will not negatively impact your ability to participate in future experiments.)</p><p>If you believe that this message is in error, you can contact the lab at <a href="mailto:uchicagolanglab@gmail.com">uchicagolanglab@gmail.com</a>, and we will do our best to resolve the situation.</div>'
   }));
}

function updateStatus(workerId, value) {
    var updates = {};
    updates['workerId/' + complete] = value;
    return firebase.database().ref().update(updates);
}

function objArrayToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function getAllUrlParams(url) {
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  var obj = {};
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

function initInstructions(pages) {
  return ({
    'type': "instructions",
    'pages': pages,
    'show_clickable_nav': true
  });
}

function initText(textArray) {
  var textBlock = {
    timeline: [],
    type: 'text'
  }

  _.each(textArray, function(text) {
    textBlock.timeline.push({
      'cont_key': [' '],
      'text': text
    });
  });

  return textBlock;
}

function addObjectsToTimeline(timeline, list) {
  _.each(list, function(item, index, list) {
    timeline.push(item);
  });
  return timeline;
}
