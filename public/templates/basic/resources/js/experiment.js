function Experiment(params) {

  /*************************************************************************
  * HELPER FUNCTIONS
  **************************************************************************/

  // Initialize the experiment timeline
  var timeline = [];

  // Initialize a variable to store participant information
  // NOTE: Add more subject parameters here if needed.
  var participant = {
    id: params.participantId
  }

  // Getter functions
  this.getParticipantId = function() { // Return current participant's ID
    return participant.id;
  }
  this.getTimeline = function() { // Return the timeline
    return timeline;
  }

  // This function adds data to jsPsych's internal representation of the
  // experiment. Can be called at any time.
  this.addPropertiesTojsPsych = function () {
    jsPsych.data.addProperties({
      participantId: participant.id
    });
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

    var welcome = {
        type: "html-keyboard-response",
        stimulus: "<p>Welcome to the experiment. Press any key to begin.</p>"
    };

    timeline.push(welcome);

    var instructions = {
      type: "html-keyboard-response",
      stimulus: "<p>This is a sample experiment.</p>" +
                "<p>Press any key to begin.</p>",
      post_trial_gap: 2000
    };

    timeline.push(instructions);

  }


  /***************************
  * Trials
  ****************************/

  // This is the main function used to create a set of trials.
  // In a more complex experiment, you might want to make additional functions,
  // such as "initBlock()" to create experiment blocks, or initPractice() to
  // create a practice phase.
  var initTrials = function() {

    var stimuli = params.stimuli

    var fixation = {
      type: 'html-keyboard-response',
      stimulus: '<div style="font-size:60px;"><p>+</p></div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
    }

    var test = {
      type: "html-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'),
      prompt: "Press F or J.",
      choices: ['f', 'j']
    }

    var testProcedure = {
      timeline: [fixation, test],
      timeline_variables: stimuli
    }

    timeline.push(testProcedure);

  }


  /***************************
  * Post-experiment
  ****************************/

  // Use this function to creat any trials that should appear after the main
  // experiment. For example, a confirmation or thank-you page.
  var initPostExperiment = function() {
    var thankYou = {
        type: "html-keyboard-response",
        stimulus: "Thank you! Your data has been recorded.",
        choices: []
    };

    timeline.push(thankYou);

  }

};
