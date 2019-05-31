/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["image-keyboard-button-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-keyboard-button-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-keyboard-button-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      keys: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Keys',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      buttons: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Buttons',
        default: [],
        array: true,
        description: 'The button labels.'
      },
      button_data: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Button Data',
        default: [],
        array: true,
        description: 'The response data to be stored for each button.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Button HTML',
        default: '<button style=class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'Custom button. Can make your own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'Vertical margin of button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'Horizontal margin of button.'
      },
      min_height: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Min height',
        default: '0px',
        description: 'Minimum height of button.'
      },
      min_width: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Min width',
        default: '0px',
        description: 'Minimum width of button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<p class="text-center"><br><br><img height="25px" width="25px" src="'+trial.stimulus+'" id="jspsych-image-keyboard-response-stimulus"></img><br></p>';

    // add prompt
    if (trial.prompt !== null){
      new_html += trial.prompt;
    }

    display_element.innerHTML = new_html;

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.buttons.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the buttons array');
      }
    } else {
      for (var i = 0; i < trial.buttons.length; i++) {
        buttons.push('<button style="min-height:' + trial.min_height + '; min-width:' + trial.min_width + ';" class="jspsych-btn">%choice%</button>');
      }
    }

    var html = '<div class="text-center" id="jspsych-audio-button-response-btngroup">';
    for (var i = 0; i < trial.buttons.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.buttons[i]);
      html += '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+';" id="jspsych-audio-button-response-button-' + i +'" data-choice="'+ trial.button_data[i] +'">'+str+'</div>';
    }
    html += '</div>';

    display_element.innerHTML += html;

    for (var i = 0; i < trial.buttons.length; i++) {
      display_element.querySelector('#jspsych-audio-button-response-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
      });
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "response": response.response
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;

      // only record the first response
      if (response.response == null) {
        if(choice.key != undefined) {
          console.log(choice.key);
          response.response = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(choice.key);
        } else {
          response.response = choice;
        }
      }

      response.rt = rt;

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-audio-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start time
    var start_time = Date.now();

    // start the response listener
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.keys,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
    });

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
