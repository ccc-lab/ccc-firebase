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

    if(params.lang == 'en') {
      $('#link1').attr('href', 'experiment.html?lang=en&id=' + code);
      $('#code-confirm').html('You have entered the following ID: <strong>' + code + '</strong>');
    } else {
      $('#link1').attr('href', 'experiment.html?lang=sp&id=' + code);
      $('#code-confirm').html('Acabas de registrar la siguiente identificación (ID): <strong>' + code + '</strong>');
    }
    $('#studylinks').show();
  }
}

$('document').ready(function() {

  var params = jsPsych.data.urlVariables();

  if(params.lang == 'en') {
    launcher_title = "Experiment Launcher";

    id_text = "Please enter the subject's ID number:";
    continue_text = "Continue";

    conf_text = "Please double-check that this ID is correct before proceeding.";
    begin_text = "Begin Experiment";

    footer_text = "This project is supported by the University of Michigan MCubed Initiative."
  }
  else {
    launcher_title = "Página de Inicio del Experimento"

    id_text = "Por favor escribe el código de identificación del participante (ID):";
    continue_text = "Continúa";

    conf_text = "Antes de continuar, por favor verifica que esta ID sea correcta.";
    begin_text = "Comienza el Experimento";

    footer_text = "Este es un proyecto financiado por la iniciativa MCubed de la Universidad de Michigan."
  }

  $('#launcher-title').html('<h2>' + launcher_title + '</h2>');

  $('#code-form').html('<p class="text-center"><b>' + id_text +
    '</b>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="subjectCode"></input></p>' +
    '<br/><br/><p class="text-center">' +
    '<button type="button" class="btn btn-dark start-study">' + continue_text + '</button></p>');

  $('#studylinks').html('<p class="lead" id="code-confirm"></p>' +
    '<p>' + conf_text + '</p><br/><br/>' +
    '<p><big><a id="link1" target="blank"><button type="button" class="btn btn-dark">' +
    begin_text + '</button></a></big></p>');

  $('#footer-text').html('<p class="text-center"><i>' + footer_text + '</i></p>');

  $('#subjectCode').bind("enterKey",function(e){
    e.preventDefault();
    submit();
  });

  $('button.start-study').click(function(e){
    e.preventDefault();
    submit();
  });

});
