
  // BEGIN JEEELIZ METHODS

  var Jeeliz=(function(){
  	//experiment settings :
  	var _settings={
  		faceDetectedThreshold: 0.5, //between 0 (easy detection) and 1 (hard detection)
  		nIterations: 25,//25, //number of iterations black -> white
  		delay: 2000, //delay between 2 luminosity changes in ms
  		resamplePeriod: 20 //used for measures time resampling (we need to resample the time to average values). In ms
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
        console.log("Jeeliz.start called");

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

      complete: function(){ //experience is complete (not aborted or canceled)
    		console.log('INFO in Experiment.js : experiment is complete :)');

    		that.stop();
    		ExperimentRecorder.plot(); //trace RAW RESULTS

    		//compute and trace AVG RESULTS :
    		var groupedValues=ExperimentRecorder.group_byEventLabels(['SVO', 'SOV', 'OVS', 'OSV', 'VSO', 'VOS', 'FILLER', 'ShortBare', 'LongBare', 'ShortD', 'LongD', 'ShortDOf','LongDOf' /*'RESP'*/]);

        var gd = document.getElementById("resultsRaw-noResults")
        gd.innerHTML = "<pre>" + JSON.stringify(groupedValues, null, 4) + "</pre>";

        var avgs={};
    		['SVO', 'SOV', 'OSV', 'OVS', 'VSO', 'VOS', 'FILLER', 'ShortBare', 'LongBare', 'ShortD', 'LongD', 'ShortDOf','LongDOf'].forEach(function(groupLabel){
    			groupedValues[groupLabel]=groupedValues[groupLabel].map(function(sample){
    				ExperimentRecorder.filter_hampel(sample, 0.5, 2);
    				var sampleNormalized=ExperimentRecorder.normalize_byFirstValue(sample);
    				return ExperimentRecorder.resample(sampleNormalized, _settings.delay, _settings.resamplePeriod);
    			});

    			var averageValues=ExperimentRecorder.average_resampleds(groupedValues[groupLabel]);
    			avgs[groupLabel]=averageValues;
    		});
    		//plot average :
    		ExperimentRecorder.plot_averages(avgs);

    		//Some CSS & UI stuffs :
    		setCSSdisplay('results-noResults', 'none');
    		setCSSdisplay('results-caption', 'block');
    		setCSSdisplay('results-plot', 'inline-block');

    		setCSSdisplay('resultsAvg-noResults', 'none');
    		setCSSdisplay('resultsAvg-caption', 'block');
    		setCSSdisplay('resultsAvg-plot', 'inline-block');

        var gd = document.getElementById("resultsAvgText-noResults")
        gd.innerHTML = "<pre>" + JSON.stringify(avgs, null, 4) + "</pre>";
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
      test: (params.id == "test" ? true : false)
    }

    exptParams.left = "very<br/>natural";
    exptParams.right = "very<br/>unnatural";

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
        if(parseInt(data.age) < 18) return true;
        return false;
      }

      // Add the preamble to the timeline
      timeline = timeline.concat([preamble.intro, preamble.consent, preamble.consent_check, preamble.demographics, preamble.demographics_check, preamble.post_demographics]);
    }

    /** This function handles setting up the experimental trials.
      * Here, it just pushes two sample trials onto the timeline.
      * In a more complex experiment, you might use it to call various helper functions.
    */

    var makeTrial = function(stimulus, i) {

      var audio;
      console.log(stimulus);

      if(stimulus.condition == 'FILLER') {
        audio = 'resources/sound/fillerfillers/' + stimulus.audio + '.wav';
      } else if(_.contains(params.experimental_conditions, stimulus.condition)) {
        audio = 'resources/sound/' + stimulus.audio + '.wav';
      } else {
        audio = 'resources/sound/fillers/' + stimulus.audio + '.wav';
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
              ExperimentRecorder.addEvent("RESP");
            },
            "type": "html-keyboard-response",
            "stimulus": '<p class="text-center huge">Please rate the naturalness of the sentence you just heard. Input your response using the keyboard.</p>',
            "prompt": '<br/><br/><br/><p class="text-center huge"><table class="huge" style="text-align: center;"><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr><tr><td>' + exptParams.left + '</td><td></td><td></td><td>neither natural nor unnatural</td><td></td><td></td><td>' + exptParams.right + '</td></table></p>',
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

      console.log((exptParams.shift - 1) % 6);

      var list = params.item_list[(exptParams.shift - 1) % 6];
      var stimuli = _.zip(list.id, list.audio, list.condition);

      timeline.push({
        "stimulus": "",
        "type": "html-keyboard-response",
        "prompt": "<div class='experiment-point'><br/><br/>Look at<br/>this circle</div>",
        "trial_duration": 2000,
        "choices": jsPsych.NO_KEYS
      });

      _.each(stimuli, function(stimulus, i) {
        var trial = makeTrial(_.object(["id", "audio", "condition"], stimulus), i);
        if(trial) { timeline.push(trial); }
      });

    }

    var initMockTrials = function() {
      var conditions = ['SVO', 'SOV', 'OSV', 'OVS', 'VSO', 'VOS', 'FILLER', 'ShortBare', 'LongBare', 'ShortD', 'LongD', 'ShortDOf','LongDOf'];
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
            "stimulus": '<p class="text-center huge">Please rate the naturalness of the sentence you just heard. Input your response using the keyboard.</p>',
            "prompt": '<br/><br/><br/><p class="text-center huge"><table class="huge" style="text-align: center;"><tr><td>1<br/><br/><br/><br/>' + exptParams.left + '</td><td>2<br/><br/><br/></td><td>3<br/><br/><br/></td><td>4</br>(neither natural</br>nor unnatural)<br/></td><td>5<br/><br/><br/></td><td>6<br/><br/><br/></td><td>7<br/><br/><br/><br/>' + exptParams.right + '</td></table></p>',
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
        "timeline": [{
          "show_clickable_nav": true,
          "allow_backward": false,
          "pages": ['<p class="huge">In this experiment, you will listen to a series of sentences.</p><p class="huge">After each sentence, you will be asked to rate how natural the sentence sounds.</p><p class="huge">A natural sentence is one that you can imagine saying yourself or hearing from someone you know; an unnatural sentence is one that sounds odd—you wouldn\'t quite say it that way, or it is not grammatical.</p>'],
        },
        {
          "key_forward": " ",
          "show_clickable_nav": false,
          "allow_backward": false,
          "pages": ['<p class="huge">This experiment will take about 20 minutes to complete.</p><p class="huge">Press SPACE when you are ready to begin.</p>'],
          on_finish: function(start) {
            Jeeliz.toggle();
          }
        }]
      };

      timeline.push(start);

      if(exptParams.test) {
        initMockTrials();
      }
      else { initTrials(); }

    var end = {
        "type": "instructions",
        "key_forward": "S",
        "show_clickable_nav": false,
        "allow_backward": false,
        "pages": ["<p>You have completed the experiment! Please leave this window open and notify the experimenter.</p><p>EXPERIMENTER: Press 'S' to save the participant's data."],
        on_start: function(end) {
          console.log("Calling complete() method");
          Jeeliz.complete();
        },
        on_finish: function() {
            jsPsych.data.get().localSave('csv', subject.id + '_raw.csv');
        }
    };

    timeline.push(end);

  }
};
