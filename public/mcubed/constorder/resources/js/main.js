var dataRef;

/** A silly function to give users feedback while the experiment loads.
*/
function makeLoadingFun() {
  if($('#load-text').html() === 'Loading experiment....')
    $('#load-text').html('Loading experiment.');
  else
    $('#load-text').html($('#load-text').html() + '.');
}

var loadInterval = setInterval(function() {
  makeLoadingFun();
}, 500);

/** Load the experiment with an object as input.
  * @param {object} json - Object contatining data from the experiment's JSON file.
*/
function loadExperimentFromJSON(json) {
  var experiment = new BasicExperiment(_.extend(json, jsPsych.data.urlVariables()));
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
  var d = new Date();
  var date_string = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
  var vars = jsPsych.data.urlVariables();

  experiment.createTimeline();
  experiment.addPropertiesTojsPsych();

  jsPsych.init({
    timeline: experiment.getTimeline(),
    display_element: 'jspsych-target'
  });

  $('#load-text').remove();
  clearInterval(loadInterval);
}

$( document ).ready(function() {
    var language = jsPsych.data.urlVariables().lang;
    attemptLoad("resources/data/" + language + ".data.json");
});
