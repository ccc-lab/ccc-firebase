
  // BEGIN JEEELIZ METHODS

  var Jeeliz=(function(){
  	//experiment settings :
  	var _settings={
  		faceDetectedThreshold: 0.5, //between 0 (easy detection) and 1 (hard detection)
  		nIterations: 100,//25, //number of iterations black -> white
  		delay: 1000, //delay between 2 luminosity changes in ms
  		resamplePeriod: 10 //used for measures time resampling (we need to resample the time to average values). In ms
  	};

  	//private vars :
  	var _domButton, _domScreen, _isRunning=false, _cyclesCounter=0, _detectedState;


  	function setCSSdisplay(domId, val){
  		var domElt=document.getElementById(domId);
  		domElt.style.display=val;
  	}

  	function addValue(){
  		ExperimentRecorder.addValue({
  			pupilLeftRadius: _detectedState.pupilLeftRadius,
  			pupilRightRadius: _detectedState.pupilRightRadius
  		});
  	}

  	function callbackTrack(detectedState){
  		_detectedState=detectedState;

  		if (!_isRunning){
  			return;
  		}

  		var isFaceDetected=(detectedState.detected>_settings.faceDetectedThreshold);
  		if (0 && !isFaceDetected){
  			that.stop();
  			alert('ERROR : the face is not detected. Please take a look in the debug view. The experiment has been aborted.');
  			return;
  		}

  		addValue();
  		return;
  	}

  	//public methods :
  	var that = {
  		init: function(){ //entry point. Called by body onload method
  			//initialize Jeeliz pupillometry :
  			JEEPUPILAPI.init({
                  canvasId: 'jeePupilCanvas',
                  NNCpath: '../../src/vendor/jeeliz/dist/',
                  callbackReady: function(err){
                      if (err){
                          console.log('AN ERROR HAPPENS. ERR =', err);
                          return;
                      }

                      console.log('INFO : JEEPUPILAPI IS READY');
                  },
                  callbackTrack: callbackTrack
              });
  		},

  		toggle: function(){
  			if (_isRunning){
  				that.stop();
  			} else {
  				that.start();
  			}
  		},

  		start: function(){

  			if (_isRunning){
  				console.log('WARNING in Experiment.js - start() : the experiment is running. Stop it before running this method.');
  				return;
  			}
  			_isRunning=true;
  			ExperimentRecorder.start();
  			addValue(); //add the first value
  		},

  		stop: function(){
  			if (!_isRunning){
  				console.log('WARNING in Experiment.js - stop() : the experiment is not running. Start it before running this method.');
  				return;
  			}
  			_isRunning=false;
  			ExperimentRecorder.end();
  		},

      complete: function(id, list){ //experience is complete (not aborted or canceled)
    		console.log('INFO in Experiment.js : experiment is complete :)');

    		that.stop();
    		ExperimentRecorder.plot(); //trace RAW RESULTS

    		//compute and trace AVG RESULTS :
    		var groupedValues=ExperimentRecorder.group_byEventLabels(['SVO', 'SOV', 'OVS', 'OSV', 'VSO', 'VOS', 'FILLER', 'ShortBare', 'LongBare', 'ShortD', 'LongD', 'ShortDOf','LongDOf' /*'RESP'*/]);

        var gd = document.getElementById("resultsRaw-noResults")
        gd.innerHTML = "<pre>" + JSON.stringify(groupedValues, null, 4) + "</pre>";

        var blobToSave = new Blob([JSON.stringify(groupedValues, null, 4)], {
          type: 'text/plain'
        });
        var blobURL = "";
        if (typeof window.webkitURL !== 'undefined') {
          blobURL = window.webkitURL.createObjectURL(blobToSave);
        } else {
          blobURL = window.URL.createObjectURL(blobToSave);
        }

        var display_element = jsPsych.getDisplayElement();

        display_element.insertAdjacentHTML('beforeend','<a id="jspsych-download-as-text-link" style="display:none;" download="pupil-raw_subj-'+ id +'_list-' + list + '.json" href="'+blobURL+'">click to download</a>');
        document.getElementById('jspsych-download-as-text-link').click();

    		//Some CSS & UI stuffs :
    		setCSSdisplay('results-noResults', 'none');
    		setCSSdisplay('results-caption', 'block');
    		setCSSdisplay('results-plot', 'inline-block');
    	}

  	} //end that
  	return that;
  })();

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
      shift: parseInt(params.id, 10),
      test: (params.id == "test" ? true : false),
      conditions: params.experimental_conditions.concat(params.subexperiment_conditions)
    }

    exptParams.conditions.push(params.filler_tag)
    exptParams.list = (exptParams.shift - 1) % 6

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
        language: params.language
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

      if(stimulus.condition == params.filler_tag) {
        audio = params.file_locations.fillers + stimulus.audio + '.wav';
      } else if(_.contains(params.experimental_conditions, stimulus.condition)) {
        audio = params.file_locations.critical + stimulus.audio + '.wav';
      } else {
        audio = params.file_locations.subexperiment + stimulus.audio + '.wav';
      }

      console.log(audio)
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
              jsPsych.data.get().addToLast({
                key_press_processed: resp,
                id: stimulus.id,
                audio: stimulus.audio,
                condition: stimulus.condition
              });
            }
          }
        ]
      });

    }
    var initTrials = function() {

      var list = params.item_list[(exptParams.shift - 1) % 6];
      var stimuli = _.zip(list.id, list.audio, list.condition);

      timeline.push({
        "stimulus": "",
        "type": "html-keyboard-response",
        "prompt": params.instructions.circle_text,
        "trial_duration": 2000,
        "choices": jsPsych.NO_KEYS
      });

      _.each(stimuli, function(stimulus, i) {
        var trial = makeTrial(_.object(["id", "audio", "condition"], stimulus), i);
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
            "prompt": "<div class='experiment-point'>Look at<br/>this circle</div>",
            "trial_duration": 500,
            "choices": jsPsych.NO_KEYS
          },
          {
            "type": "audio-keyboard-response",
            "stimulus": 'resources/sound/beep.wav',
            "prompt": "<div class='experiment-point'>Look at<br/>this circle</div>",
            "trial_ends_after_audio": true,
            "choices": jsPsych.NO_KEYS
          },
          {
            "stimulus": "",
            "prompt": "<div class='experiment-point'>Look at<br/>this circle</div>",
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
            Jeeliz.complete(subject.id, exptParams.list);
          }
        }, {
          "key_forward": "S",
          "show_clickable_nav": false,
          "allow_backward": false,
          "pages": params.instructions.saveBehavioral,
          on_finish: function() {
            jsPsych.data.get().localSave('csv', 'behavior-raw_' + 'subj-' + subject.id + '_list-' + exptParams.list + '.csv');
          }
        }
      ]
    }

    timeline.push(end);
  }

};
