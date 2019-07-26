var params = jsPsych.data.urlVariables();

function submit() {
  code_element = $('#subjectCode');
  error = $('.form-error');

  code = code_element.val();
  if(error.length == 1) {
    error[0].remove();
  }
  if(code == "") {
    $('#code-form').append($('<p>', {
      'html': 'Please enter your subject code.',
      'class': 'form-error text-center'
    }));
  }
  else if((/\D/.test(code)) && code != "test") {
    $('#code-form').append($('<p>', {
      'class': 'form-error text-center',
      'html': 'Code must be a number.'
    }));
  }
  else {
    $('#code-form').hide();
    $('#link1').attr('href', 'experiment.html?id=' + code);
    $('#code-confirm').html('You have entered the following ID: <strong>' + code + '</strong>');
    $('#studylinks').show();
  }
}

$('document').ready(function() {

  $('#subjectCode').bind("enterKey",function(e){
    e.preventDefault();
    submit();
  });

  $('button.start-study').click(function(e){
    e.preventDefault();
    submit();
  });

});
