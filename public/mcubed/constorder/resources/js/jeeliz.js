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

    complete: function(id, params){ //experience is complete (not aborted or canceled)
      console.log('INFO in Experiment.js : experiment is complete :)');

      that.stop();
      ExperimentRecorder.plot(); //trace RAW RESULTS

      params.conditions.push('RESP')

      //compute and trace AVG RESULTS :
      var groupedValues=ExperimentRecorder.group_byEventLabels(params.conditions);

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

      var date = new Date();

      var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

      var dateString = date.getFullYear() + '' + month + '' + day + '' + hours + '' + minutes;

      display_element.insertAdjacentHTML('beforeend','<a id="jspsych-download-as-text-link" style="display:none;" download="' + dateString + '_pupil-raw_subj-'+ id +'_list-' + params.list + '.json" href="'+blobURL+'">click to download</a>');
      document.getElementById('jspsych-download-as-text-link').click();

      //Some CSS & UI stuffs :
      setCSSdisplay('results-noResults', 'none');
      setCSSdisplay('results-caption', 'block');
      setCSSdisplay('results-plot', 'inline-block');
    }

  } //end that
  return that;
})();
