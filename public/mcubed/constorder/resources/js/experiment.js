  /** Construct an instance of the BasicExperiment class.
    * @constructor
    * @param {Object} params - The experiment parameters from URL data and/or your data.json file.
    */
  function BasicExperiment(params) {

    /** Hold the trials, instructions, etc. that make up the experiment.
     * @type {Array<object>}
     */
    var timeline = [];

    var exptParams = {
      test: (params.id == "test" ? true : false),
      conditions: params.experimental_conditions.concat(params.subexperiment_conditions).concat(params.filler_conditions),
      list: params.list
    }

    /** The current subject.
     * @type {object}
     * @param {string} id - The subject's Worker ID or SONA subject number.
    */
    var subject = { //NOTE: Add more subject parameters here if needed.
      id: params.id
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
        subject: subject.id,
        list: exptParams.list,
        language: params.lang
      });
    }

    /** This function handles setting up the experimental trials.
        Trials consitist of
          1. A fixation point
          2. An audio stimulus
          3. A likert scale
    **/

    var makeTrial = function(stimulus, i) {

      var audio;

      if(_.contains(params.filler_conditions, stimulus.condition)) {
        audio = params.file_locations.fillers + stimulus.audio + '.WAV';
      } else if(_.contains(params.experimental_conditions, stimulus.condition)) {
        audio = params.file_locations.critical + stimulus.audio + '.WAV';
      } else {
        audio = params.file_locations.subexperiment + stimulus.audio + '.WAV';
      }

      return ({
        "type": "html-keyboard-response",
        "timeline": [
          {
            on_start: function(trial) {
              ExperimentRecorder.addEvent(stimulus.condition);
            },
            "stimulus": "",
            "prompt": "<div class='experiment-point'></div>",
            "trial_duration": 1000,
            "choices": jsPsych.NO_KEYS
          },
          {
            "type": "audio-keyboard-response",
            "stimulus": audio,
            "prompt": "<div class='experiment-point'></div>",
            "trial_ends_after_audio": true,
            "choices": jsPsych.NO_KEYS
          },
          {
            "stimulus": "",
            "prompt": "<div class='experiment-point'></div>",
            "trial_duration": 1000,
            "choices": jsPsych.NO_KEYS
          },
          {
            on_start: function(trial) {
              ExperimentRecorder.addEvent("Response");
            },
            "type": "html-keyboard-response",
            "stimulus": params.trial_instructions.stimulus,
            "prompt": params.trial_instructions.prompt,
            "response_ends_trial": true,
            choices: ["1", "2", "3", "4", "5", "6", "7"],
            on_finish: function(){
              var data = jsPsych.data.getLastTrialData().values()[0];
              var resp = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
              jsPsych.data.get().addToLast({
                key_press_processed: resp,
                id: stimulus.id,
                audio: stimulus.audio,
                experiment: stimulus.experiment,
                condition: stimulus.condition
              });
            }
          }
        ]
      });

    }
    var initTrials = function() {

      var list = params.item_list[exptParams.list-1];
      var stimuli = _.zip(list.id, list.audio, list.condition, list.experiment);

      timeline.push({
        "stimulus": "",
        "type": "html-keyboard-response",
        "prompt": params.instructions.circle_text,
        "trial_duration": 2000,
        "choices": jsPsych.NO_KEYS
      });

      _.each(stimuli, function(stimulus, i) {
        var trial = makeTrial(_.object(["id", "audio", "condition", "experiment"], stimulus), i);
        if(trial) { timeline.push(trial); }
      });

    }

    var initMockTrials = function() {
      var conditions = exptParams.conditions;
      _.each(conditions, function(condition) {
        timeline.push(makeMockTrial(condition));
      })
    }

    var makeMockTrial = function(condition) {
      return ({
        "type": "html-keyboard-response",
        "timeline": [
          {
            on_start: function(trial) {
              ExperimentRecorder.addEvent(condition);
            },
            "stimulus": "",
            "prompt": params.instructions.circle_text,
            "trial_duration": 500,
            "choices": jsPsych.NO_KEYS
          },
          {
            "type": "audio-keyboard-response",
            "stimulus": 'resources/sound/beep.wav',
            "prompt": params.instructions.circle_text,
            "trial_ends_after_audio": true,
            "choices": jsPsych.NO_KEYS
          },
          {
            "stimulus": "",
            "prompt": params.instructions.circle_text,
            "trial_duration": 500,
            "choices": jsPsych.NO_KEYS
          },
          {
            on_start: function(trial) {
              ExperimentRecorder.addEvent("RESP");
            },
            "type": "html-keyboard-response",
            "stimulus": params.trial_instructions.stimulus,
            "prompt": params.trial_instructions.prompt,
            "response_ends_trial": true,
            choices: ["1", "2", "3", "4", "5", "6", "7"],
            on_finish: function(){
              var data = jsPsych.data.getLastTrialData().values()[0];
              var resp = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
              jsPsych.data.get().addToLast({key_press_processed: resp});
            }
          }
        ]
      });
    }

    /** Build the experiment.
    */
    this.createTimeline = function() {
      //initPreamble();

      var start = {
        "type": "instructions",
        "key_forward": " ",
        "show_clickable_nav": false,
        "allow_backward": false,
        "pages": params.instructions.start,
        "on_finish": function(start) {
            Jeeliz.toggle();
        }
      };

      timeline.push(start);

      if(exptParams.test) {
        initMockTrials();
      }
      else { initTrials(); }

    var end = {
        "type": "instructions",
        "timeline": [
        {
          "key_forward": "S",
          "show_clickable_nav": false,
          "allow_backward": false,
          "pages": params.instructions.savePupil,
          on_finish: function() {
            Jeeliz.complete(subject.id, exptParams);
          }
        }, {
          "key_forward": "S",
          "show_clickable_nav": false,
          "allow_backward": false,
          "pages": params.instructions.saveBehavioral,
          on_finish: function() {
            var date = new Date();

            var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
            var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

            var dateString = date.getFullYear() + '' + month + '' + day + '' + hours + '' + minutes;
            jsPsych.data.get().localSave('csv', dateString + '_behavior-raw_' + 'subj-' + subject.id + '_list-' + exptParams.list + '.csv');
          }
        }
      ]
    }

    timeline.push(end);
  }

};
