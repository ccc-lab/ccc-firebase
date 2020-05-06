/** Construct an instance of the BasicExperiment class.
  * @constructor
  * @param {Object} params - The experiment parameters from URL data and/or your data.json file.
  */
function BasicExperiment(params) {

  /** Hold the trials, instructions, etc. that make up the experiment.
   * @type {Array<object>}
   */
  var timeline = [];

  /** The current subject.
   * @type {object}
   * @param {string} id - The subject's Worker ID or SONA subject number.
  */
  var subject = { //NOTE: Add more subject parameters here if needed.
    id: params.workerId
  }

  /** Return the subject's ID.
   * @returns {string} - The subject's Worker ID or SONA subject number.
  */
  this.getSubjectId = function() {
    return subject.id;
  }

  /** Return the experiment timeline.
   * @returns {array} - The experiment timeline.
  */
  this.getTimeline = function() {
    return timeline;
  }

  /** Add data to jsPsych's internal representation of the experiment. Can be called at any time.
  */
  this.addPropertiesTojsPsych = function () {
    jsPsych.data.addProperties({
      workerId: subject.id
    });
  }

  /** Initialize and append the default preamble to the timeline.
    * This includes a generic intro page, consent form, and demographic questionnaire.
    * Values for some of these are altered via the JSON file.
  */
  var initPreamble = function() {
    var preamble = params.preamble;

    // NOTE: Functions cannot be included in JSON files - must be appended here instead.

    /* This function checks whether or not the subject consented to the experiment.
     * jsPsych uses the return value (true/false) to determine whether or not to
     * display the conditional trial. True -> display the trial. False -> continue
     * the experiment.
    */
    preamble.consent_check.conditional_function = function() {
      var data = jsPsych.data.getLastTrialData().values()[0];
      return !data.consented;
    }

    // Check that the participant entered a valid age.
    preamble.demographics_check.conditional_function = function() {
      var data = jsPsych.data.getLastTrialData().values()[0];
      console.log(data);
      if(parseInt(data.age) < 18) return true;
      return false;
    }

    // Add the preamble to the timeline
    timeline = timeline.concat([preamble.consent, preamble.consent_check, preamble.demographics, preamble.demographics_check, preamble.post_demographics]);
  }

  /** This function handles setting up the experimental trials.
    * Here, it just pushes two sample trials onto the timeline.
    * In a more complex experiment, you might use it to call various helper functions.
  */
  var initTrials = function() {

    var sampleHTMLTrial = {
      on_start: function(){ /* Pre-trial actions */ },
      "type": "html-keyboard-response",
      "is_html": true,
      "prompt": "(Example.)",
      "stimulus": "Hello world! This is a sample text trial. Press SPACE to continue.",
      "choices": [" "],
      //"trial_duration": -1,
      on_finish: function(){ /* Post-trial actions */
        // NOTE: Add this function to your last trial and uncomment it.
        // This saves the experimental data and logs the worker so that they cannot do the same experiment twice.
        //saveData(jsPsych.data.dataAsCSV(), dataRef);

        // NOTE: Change this string to the same string you used in main.js
        //addWorker(params.workerId, "ExperimentID");
      }
    };
    timeline.push(sampleHTMLTrial);
  }

  /** Build the experiment.
  */
  this.createTimeline = function() {
    initPreamble();
    initTrials();
  }
};
