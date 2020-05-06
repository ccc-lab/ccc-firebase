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
     html: '<p>It appears that you have previously completed a study from <Lab> that used the same data as, or similar data to, the study you are attempting to complete now. Unfortunately, we cannot allow the same person to participate in an experiment more than once. We apologize for the inconvenience, but we must ask that you return your HIT now. (This will not negatively impact your ability to participate in future experiments.)</p><p>If you believe that this message is in error, you can contact the lab at <a href="mailto:labemail@gmail.com">labemail@institution.edu</a>, and we will do our best to resolve the situation.</div>'
   }));
}
