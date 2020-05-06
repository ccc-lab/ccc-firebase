// runner.js

// This file loads the stimuli in stimuli.json and initializes an Experiment
// object.

// The trials created by the Experiment are then send to jsPsych,
// which runs the experiment.


/*************************************************************************
* ON DOCUMENT READY
**************************************************************************/

/* This function:
 * 1. Waits for experiment.html to be fully loaded by the browser
 * 2. Checks the database to see if the participant has completed the
 *    experiment already
 * 3. a. If the participant is new, loads the experiment
 *    b. If the participant is not new, shows an error message
 */

$( document ).ready(function() {

  urlVars = jsPsych.data.urlVariables();

  getParticipantCompletion(urlVars.participantId, urlVars.experimentId)
    .then(function(snapshot) {

      if(snapshot.val() && snapshot.val().complete == 1) {
        console.log('This participant has already completed the experiment!');
        showUserError();
      }

      else {
        console.log('This participant has not yet completed the experiment. :)');
        loadStimuliAndRun("resources/data/stimuli.json");
      }

  });
});


/*************************************************************************
* jsPSYCH RUNNER - EDIT AS NEEDED
**************************************************************************/

/* Calls jsPsych.init() to run the experiment
 *
 * experiment.getTimeline() returns the timeline created by the Experiment
 * object, which is passed to jsPsych.
 * experiment.onFinish() defines what jsPsych does once the experiment is done.
 */

function initializeJsPsych(experiment) {

  experiment.createTimeline()
  experiment.addPropertiesTojsPsych()
  experiment.setStorageLocation()
  
  jsPsych.init({
    timeline: experiment.getTimeline(),
    show_progress_bar: true,
    display_element: 'jspsych-target',
    on_finish: function() {
      experiment.onFinish()
    }
  });
}


/*************************************************************************
* EXPERIMENT LOADER AND HELPER FUNCTIONS
**************************************************************************/

/* Try to load the JSON file
 *
 * On success - calls returnStimuli()
 * On failure - displays an error message in the console
 */
function loadStimuliAndRun(file) {
  $.getJSON(file, initializeExperimentWithStimuli).fail(showConsoleError);
}

/* Initialize an Experiment object with loaded stimuli and storage instance
 * and send the experiment to jsPsych.
 * All URL variables are also passed to the Experiment object.
 */
function initializeExperimentWithStimuli(json) {
  var experiment = new Experiment(_.extend(json, jsPsych.data.urlVariables()),
    storage);
  initializeJsPsych(experiment);
}

function showConsoleError(d, textStatus, error) {
  console.error("getJSON failed, status: " + textStatus + ", error: " + error);
}

function showUserError() {
  $( '#jspsych-target' ).append($('<div>', {
     id: 'error',
     class: 'text-center',
     html: '<p>It appears that you have previously completed a study from <Lab> that used the same data as, or similar data to, the study you are attempting to complete now. Unfortunately, we cannot allow the same person to participate in an experiment more than once. We apologize for the inconvenience, but we must ask that you return your HIT now. (This will not negatively impact your ability to participate in future experiments.)</p><p>If you believe that this message is in error, you can contact the lab at <a href="mailto:labemail@gmail.com">labemail@institution.edu</a>, and we will do our best to resolve the situation.</div>'
   }));
}
