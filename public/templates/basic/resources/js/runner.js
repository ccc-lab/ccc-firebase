/** Load the experiment with an object as input.
  * @param {object} json - Object contatining data from the experiment's JSON file.
*/
function loadExperimentFromJSON(json) {
  var experiment = new Experiment(_.extend(json, jsPsych.data.urlVariables()));
  initializeExperiment(experiment);
}

/** Handle JSON errors.
  * @param {string} textStatus - The status of the load attempt.
  * @param {string} error - The error message.
*/
function error(d, textStatus, error) {
  console.error("getJSON failed, status: " + textStatus + ", error: " + error);
}

/** Attempt to load the experiment from JSON.
 * @param {string} file - The URL of the JSON file to load.
*/
function attemptLoad(file) {
  $.getJSON(file, loadExperimentFromJSON).fail(error);
}

/** Initialize the experiment with a successfully-created BasicExperiment object.
 * @param {object} BasicExperiment - The instance of the experiment.
*/
function initializeExperiment(experiment) {
  var currentDate = new Date();
  var prettyDate = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
  var vars = jsPsych.data.urlVariables();

  // NOTE: Change this to reflect the name of your project.
  var dataRef = storage.ref().child(experiment.getExperimentId() + prettyDate + '/' + experiment.getParticipantId() + '.csv');

  experiment.createTimeline();
  experiment.addPropertiesTojsPsych();

  jsPsych.init({
    timeline: experiment.getTimeline(),
    show_progress_bar: true,
    display_element: 'jspsych-target',
    on_finish: function() {
      var code = jsPsych.data.getLastTrialData().code;
      // Add Prolific redirect here
    }
  });
}

$( document ).ready(function() {

  // NOTE: Change this to reflect the name of your project.
  checkWorker(jsPsych.data.urlVariables().workerId, 'SAMPLE').then(function(snapshot) {

    if(snapshot.val() && snapshot.val().complete == 1) {
      console.log('Worker has already completed the experiment.');
      clearInterval(loadInterval);
      $('#load-text').remove();
      showError();
    }
    else {
      console.log('Worker has not yet completed the experiment.');
      attemptLoad("resources/data/stimuli.json");
    }
  });
});
