/* Firebase initialization */

/** The Firebase configuration.
  * @type {object}
  * @param {string} apiKey - The public API key of the project.
  * @param {string} databaseURL - The URL of the project's database.
  * @param {string} storageBucket - The URL of the project's storage bucket.
*/
var config = {
    apiKey: "AIzaSyAxyzEuaovcYmgNT3IELg6Ng7jdVOyx1do",
    databaseURL: "https://ccclab-573ff.firebaseio.com/",
    storageBucket: "gs://ccclab-573ff.appspot.com"
};
firebase.initializeApp(config);

/** A reference to the project's storage bucket.
*/
var storageRef = firebase.storage().ref();

/** A reference to the project's database.
*/
var database = firebase.database();


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

  // NOTE: Change this to reflect the name of your project.
  dataRef = storageRef.child('SAMPLE/' + date_string + '/' + experiment.getSubjectId() + '.csv');

  experiment.createTimeline();
  experiment.addPropertiesTojsPsych();

  jsPsych.init({
    timeline: experiment.getTimeline(),
    show_progress_bar: true,
    display_element: 'jspsych-target',
    on_finish: function() {
      var code = jsPsych.data.getLastTrialData().code;
      $('#jspsych-target').html('<p class="lead">You have finished the experiment! Your responses have been saved.</p>' +
          '<p>Your survey code is <b>' + code + '</b>. Please enter this code into your HIT. ' +
          'You may then close this window.</p><p>If you have any questions or concerns, ' +
          'please do not hesitate to contact the lab at <a href="mailto:uchicagolanglab@gmail.com">uchicagolanglab@gmail.com</a>.</p>');
    }
  });

  var code = 'TURK' + jsPsych.randomization.randomID(10);

  jsPsych.data.addProperties({
    code: code
  });

  $('#load-text').remove();
  clearInterval(loadInterval);
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
      attemptLoad("resources/data/engco.data.json");
    }
  });
});
