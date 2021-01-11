// experiment.js

// This file defines the Experiment object that is initialized in runner.js.
// The experiment's timeline and trials live here.

// Stimuli are defined in data/stimuli.json. This file is loaded by runner.js.
// The contents of this file are passed to the params variable of the
// Experiment object.

function Experiment(params, firebaseStorage) {

  // Initialize the experiment timeline
  var timeline = [];

  /*************************************************************************
  * CUSTOMIZEABLE HELPER FUNCTIONS - EDIT AS NEEDED
  **************************************************************************/

  /******************
   * Experiment flow
   ******************/

  // Function to be called by jsPsych at the very end of the experiment
  // If you are using Prolific, you should use this function to redirect
  // participants to the page Prolific specifies.
  this.onFinish = function() {
    // TODO: Add Prolific or other redirects here
  }


  /******************
   * Data storage
   ******************/

  // Initialize a variable to store participant information
  // TODO: Add more participant parameters here if needed.
  var participant = {
    id: params.id
  }

  // Initialize a variable to store experiment information
  // TODO: Add more experiment parameters here if needed.
  var experimentData = {
    id: "adjunct_pp",
    list: params.ver
  }

  // This function adds data to jsPsych's internal representation of the
  // experiment. Can be called at any time.
  this.addPropertiesTojsPsych = function () {
    jsPsych.data.addProperties({
      participantId: participant.id
    });
  }

  this.setStorageLocation = function() {

    var currentDate = new Date();
    var prettyDate = [currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      currentDate.getDate()].join('-');

    filename = experimentData.id + '/' + prettyDate + '/' + participant.id + '.csv'
    experimentData.storageLocation = firebaseStorage.ref().child(filename);
    console.log(experimentData.storageLocation);
  }


  /******************
   * Getter functions
   ******************/

  this.getParticipantId = function() { // Return current participant's ID
    return participant.id;
  }
  this.getExperimentId = function() {  // Return experiment's ID
    return experimentData.id;
  }
  this.getTimeline = function() {      // Return the timeline
    return timeline;
  }


  /**************************************************************************
  * BUILD THE TIMELINE
  ***************************************************************************/

  // This function builds the full experiment timeline using your individual
  // init functions. By building different phases of the experiment with their
  // own init functions, it is easy to turn on and off different parts of the
  // experiment during testing.

  this.createTimeline = function() {
    initPreExperiment();
    initTrials();
    initPostExperiment();
    console.log(timeline)
  }


  /************************************************************************
  * EXPERIMENT BLOCKS
  *************************************************************************/

  /***************************
  * Pre-experiment
  ****************************/

  // Use this function to creat any trials that should appear before the main
  // experiment. For example, instuctions.
  var initPreExperiment = function() {

    var start = {
      "type": "instructions",
      "key_forward": " ",
      "show_clickable_nav": false,
      "allow_backward": false,
      "pages": params.instructions.start
    };
    timeline.push(start);

  }


  /***************************
  * Trials
  ****************************/

  // This is the main function used to create a set of trials.
  // In a more complex experiment, you might want to make additional functions,
  // such as "initBlock()" to create experiment blocks, or initPractice() to
  // create a practice phase.
  var initTrials = function() {

    _.each(params.stimuli[experimentData.list], function(stimulus, i) {
        timeline.push(initTrial(stimulus, i));
      }
    );
  }

  // Make a single trial
  var initTrial = function(stimulus, i) {

    var stimulus_data = {
      "list":            stimulus[0],
      "exp_order":       stimulus[1],
      "id":              stimulus[2],
      "condition":       stimulus[3],
      "verb_type":       stimulus[4],
      "before_after":    stimulus[5],
      "audio_file_name": "resources/sound/" + stimulus[6]
    }

    return ({
      "type": "html-keyboard-response",
      "timeline": [
        {
          "stimulus": "",
          "prompt": '<div style="font-size: 70px"><br/><br/><br/><br/><p>+</p></div>',
          "trial_duration": 500,
          "choices": jsPsych.NO_KEYS,
          on_finish: function(){
            jsPsych.data.get().addToLast({
              "LIST":            stimulus_data.list,
              "EXP_ORDER":       stimulus_data.exp_order,
              "ID":              stimulus_data.id,
              "CONDITION":       stimulus_data.condition,
              "VERB_TYPE":       stimulus_data.verb_type,
              "BEFORE_AFTER":    stimulus_data.before_after,
              "AUDIO_FILE_NAME": stimulus_data.audio_file_name,
              "PHASE":           "fixation_pre_audio"
            });
          }
        },
        {
          "type": "audio-keyboard-response",
          "stimulus": stimulus_data.audio_file_name,
          "prompt": '<div style="font-size: 70px"><br/><br/><br/><br/><p>+</p></div>',
          "trial_ends_after_audio": true,
          "choices": jsPsych.NO_KEYS,
          on_finish: function(){
            jsPsych.data.get().addToLast({
              "LIST":            stimulus_data.list,
              "EXP_ORDER":       stimulus_data.exp_order,
              "ID":              stimulus_data.id,
              "CONDITION":       stimulus_data.condition,
              "VERB_TYPE":       stimulus_data.verb_type,
              "BEFORE_AFTER":    stimulus_data.before_after,
              "AUDIO_FILE_NAME": stimulus_data.audio_file_name,
              "PHASE":           "fixation_audio"
            });
          }
        },
        {
          "stimulus": "",
          "prompt": '<div style="font-size: 70px"><br/><br/><br/><br/><p>+</p></div>',
          "trial_duration": 500,
          "choices": jsPsych.NO_KEYS,
          on_finish: function(){
            jsPsych.data.get().addToLast({
              "LIST":            stimulus_data.list,
              "EXP_ORDER":       stimulus_data.exp_order,
              "ID":              stimulus_data.id,
              "CONDITION":       stimulus_data.condition,
              "VERB_TYPE":       stimulus_data.verb_type,
              "BEFORE_AFTER":    stimulus_data.before_after,
              "AUDIO_FILE_NAME": stimulus_data.audio_file_name,
              "PHASE":           "fixation_post_audio"
            });
          }
        },
        {
          "type": "html-keyboard-response",
          "stimulus": params.trial_instructions.stimulus,
          "prompt": params.trial_instructions.prompt,
          "response_ends_trial": true,
          choices: ["1", "2", "3", "4", "5", "6", "7"],
          on_finish: function(){

            var data = jsPsych.data.getLastTrialData().values()[0];
            var resp = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);

            jsPsych.data.get().addToLast({
              "RESPONSE_PROCESSED": resp,
              "LIST":            stimulus_data.list,
              "EXP_ORDER":       stimulus_data.exp_order,
              "ID":              stimulus_data.id,
              "CONDITION":       stimulus_data.condition,
              "VERB_TYPE":       stimulus_data.verb_type,
              "BEFORE_AFTER":    stimulus_data.before_after,
              "AUDIO_FILE_NAME": stimulus_data.audio_file_name,
              "PHASE":           "response"
            });

            exp_order = parseInt(data.EXP_ORDER);
            if(exp_order % 20 == 0 || exp_order == 80) {
              saveDataToStorage(jsPsych.data.get().csv(), experimentData.storageLocation);
            }
          }
        }
      ]
    });
  }

  /***************************
  * Post-experiment
  ****************************/

  // Use this function to create any trials that should appear after the main
  // experiment, but BEFORE a thank-you page. For example, a confirmation or thank-you page.
  var initPostExperiment = function() {
    var thankYou = {
        on_start: function() {
          saveDataToStorage(jsPsych.data.get().csv(), experimentData.storageLocation)
        },
        type: "html-keyboard-response",
        stimulus: "<p class=\"large\">Thank you! Your responses have been recorded.</p>" +
                  "<p class=\"large\">You can now return to Qualtrics to complete the second half of the experiment.</p>",
        choices: [""]
    };

    timeline.push(thankYou);
  }
};
