
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
  			//that.stop();
  			//alert('ERROR : the face is not detected. Please take a look in the debug view. The experiment has been aborted.');
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
    		var groupedValues=ExperimentRecorder.group_byEventLabels(['SVO', 'SOV', 'OSV', 'OSV', 'VSO', 'VOS']);
    		var avgs={};
    		['SVO', 'SOV', 'OSV', 'OSV', 'VSO', 'VOS'].forEach(function(groupLabel){
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
    		TabManager.open('tabLink-results', 'tabContent-results');
    		setCSSdisplay('results-noResults', 'none');
    		setCSSdisplay('results-caption', 'block');
    		setCSSdisplay('results-plot', 'inline-block');

    		setCSSdisplay('resultsAvg-noResults', 'none');
    		setCSSdisplay('resultsAvg-caption', 'block');
    		setCSSdisplay('resultsAvg-plot', 'inline-block');
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

      return ({
        "type": "html-keyboard-response",
        "timeline": [
          {
            "stimulus": "",
            "prompt": "<div class='experiment-point'>Look at<br/>this circle</div>",
            "trial_duration": 2000,
            "choices": jsPsych.NO_KEYS
          },
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
            "stimulus": 'resources/sound/' + stimulus.condition + '_S' + stimulus.item + '.wav',
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
          "prompt": '<p class="text-center">Pls rate using keyboard :B</p>',
          "stimulus": '<p class="text-center">1 - 2 - 3 - 5 - 6 - 7 <br/>(v bad)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(v good)</p>',
          "response_ends_trial": true,
          choices: ["1", "2", "3", "4", "5", "6", "7"]
        }]
      });

    }
    var initTrials = function() {

      var shift = 1;
      var conditions = _.flatten(_.map([[],[],[],[],[]], function(item) {
        return ["SOV", "SVO", "OSV", "OVS", "VSO", "VOS"];
      }));

      var stimuli = jsPsych.randomization.shuffle(_.map(conditions, function(condition, i) {
        return ({'condition': condition, 'item': i+1});
      }));

      for(var j = 0; j < shift; j++) {
        stimuli.push(stimuli.shift());
      }

      console.log(stimuli);

      var start = {
          "type": "instructions",
          "key_forward": " ",
          "show_clickable_nav": true,
          "allow_backward": false,
          "pages": ["Press SPACE to begin."],
          on_finish: function(start) {
            Jeeliz.toggle();
          },
      };

      timeline.push(start);

      _.each(stimuli, function(stimulus, i) {
        timeline.push(makeTrial(stimulus, i));
      });

      var end = {
          "type": "instructions",
          "key_forward": " ",
          "show_clickable_nav": true,
          "allow_backward": false,
          "pages": ["Press SPACE to begin."],
          on_start: function(end) {
            console.log("Calling complete() method");
            Jeeliz.complete();
          },
          // NOTE: Add this function to your last trial and uncomment its contents.
          // This saves the experimental data and logs the worker so that they cannot do the same experiment twice.
          on_finish: function(trial) {
            //saveData(jsPsych.data.dataAsCSV(), dataRef);

            // NOTE: Change this string to the same string you used in main.js
            //addWorker(params.workerId, "SAMPLE");
          }
      };
      timeline.push(end);
    }

    /** Build the experiment.
    */
    this.createTimeline = function() {
      //initPreamble();
      initTrials();
    }

  };
