/**
 * jspsych-demographics
 * Josh de Leeuw
 *
 * Plugin for displaying a demographic questionnaire
 *
 *
 **/

jsPsych.plugins["demographics"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'demographics',
    description: '',
    parameters: {
      placeholder: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Placeholder',
        default: undefined,
        array: false,
        description: 'Placeholder.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    $(display_element).html(
      `
      <div class="header mb-4">
        <h1>Demographic Information</h1>
        <p class="lead">Please complete this short questionnaire about your linguistic background before beginning the experiment. Please answer the questions accurately.</p>
      </div>
      <div class="container">
      <form>
        <div class="form-group row">
          <label for="age" class="col-sm-3 col-form-label">What is your gender?</label>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="gender" placeholder="" required>
          </div>
          </div>
        <div class="form-group row">
          <label for="age" class="col-sm-3 col-form-label">What is your age?</label>
          <div class="col-sm-3">
            <input type="text" class="form-control" name="age" placeholder="" required>
          </div>
        </div>
        <div class="form-group row">
          <label for="state" class="col-sm-3 col-form-label">In which state did you grow up?</label>
          <div class="col-sm-9">
            <select style="width: 200px;" class="form-control" id="state" id="state" required>
                <option value="">Please select...</option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="DC">District Of Columbia</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="HI">Hawaii</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="PA">Pennsylvania</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option>
            </select>
            <small class="form-text text-muted" style="text-align: left">
              If you have lived in multiple states, try to choose the one you spent the most time in.
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label for="age" class="col-sm-3 col-form-label">What is your native language?</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="natLg" placeholder="" required>
            <small id="passwordHelpBlock" class="form-text text-muted" style="text-align: left">
              This is the language you primarily spoke in and were spoken to in from birth through age 12.
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label for="domLg" class="col-sm-3 col-form-label">What is your dominant language?</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="domLg" placeholder="" required>
            <small id="passwordHelpBlock" class="form-text text-muted" style="text-align: left">
              This is the language you use the most in daily life.
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label for="parentLg" class="col-sm-3 col-form-label">What language(s) do your parent speak?</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="parentLg" placeholder="" required>
            <small class="form-text text-muted" style="text-align: left">
              Please separate the languages using commas (,).
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label for="otherLg" class="col-sm-3 col-form-label">If you speak any other languages, please list them here:</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="otherLg" placeholder="">
          </div>
        </div>
      </form>
    </div>
    <div class="footer">
      <div class="col-sm-12 text-center">
        <button id="submit-demographics" class="btn btn-light"><i class="fa fa-check-square" aria-hidden="true"></i>
 Submit and Continue</button>
      </div>
    </div>
    `
    );

    $('#submit-demographics').on('click', function(e) {
      e.preventDefault();
      validate();
    });

    $(':invalid').on('click', function(e) {
      if($(this).next().hasClass('form-error'))
        $(this).next().remove();
      $(this).removeProp('invalid');
      $(this).removeClass('is-invalid');
    });

    // store response
    var response = {
      rt: -1
    }

    var demographics = {
      gender: undefined,
      age: undefined,
      state: undefined,
      native_lg: undefined,
      dominant_lg: undefined,
      parent_lg: undefined,
      other_lg: undefined
    };

    // start time
    var start_time = 0;

    // function to handle responses by the subject
    function validate() {

      var valid = true;

      _.each($(':required'), function(obj, index, list) {

        var form_element = $(obj);

        if(form_element.val() === "") {

          if(!form_element.next().hasClass("form-error")) {
            form_element.after($('<div>', {
              html: 'This field is required.',
              class: 'form-error'
            }));
          }

          form_element.prop('invalid');
          form_element.addClass('is-invalid');

          valid = false;
        }
      });

      var age = $('input[name=age]').val();
      if((/\D/.test(age))){
        valid = false;

        $('input[name=age]').addClass('is-invalid');
        $('input[name=age]').prop('invalid');

        if(!$('input[name=age]').next().hasClass("form-error")) {
          $('input[name=age]').after($('<div>', {
            html: 'Age must be a number.',
            class: 'form-error'
          }));
        }
      }

      if(valid === false) return;

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;

      response.rt = rt;
      demographics.gender = $('input[name=gender]').val();
      demographics.age = age;
      demographics.state = $('select[id=state]').val();
      demographics.native_lg = $('input[id=natLg]').val();
      demographics.dominant_lg = $('input[id=domLg]').val();
      demographics.parent_lg = $('input[id=parentLg]').val();
      demographics.other_lg = $('input[id=otherLg]').val();

      end_trial();
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
      };

      // We want the demographic info on every line
      jsPsych.data.addProperties(demographics);

      // clear the display
      $(display_element).html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start timing
    start_time = Date.now();
  };

  return plugin;

})();
