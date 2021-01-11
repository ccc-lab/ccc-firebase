
# Table of contents

1. [Building and running custom experiments](#building-and-running-custom-experiments)
   1. [Key components of an experiment](#key-components-of-an-experiment)
   2. [Setting up Firebase](#setting-up-firebase)
   3. [Testing and publishing experiments](#testing-and-publishing-experiments)
2. [Running the pupillometry experiment (Ubuntu only)](#running-the-pupillometry-experiment)

-----

# Building and running custom experiments

At minimum, [jsPsych](http://www.jspsych.org/) experiments are built using HTML, CSS, and JavaScript. Nearly all experiments to date have also relied on the following libraries:

- [jQuery](https://jquery.com/)
- [Bootstrap](https://v4-alpha.getbootstrap.com/)
- [Underscore.js](http://underscorejs.org/)

A template experiment can be found under `public/templates/basic/`.

## Key components of an experiment

### experiment.html

This file contains the HTML backbone of the experiment. In most cases, it is quite minimalistic and will look something like this: 

```HTML
<!doctype html>
<html>
    <head>
        <title>EXPERIMENT TITLE HERE</title>

        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Firebase tools -->

        [...]

        <!-- jQuery and Underscore -->

        <script src="../../src/vendor/jquery-3.2.1/js/jquery.min.js"></script>
        <script src="../../src/vendor/underscore-1.8.3/js/underscore.min.js" type="text/javascript"></script>

        <!-- jsPsych -->

        <script src="../../src/vendor/jspsych-6.1.0/jspsych.js" type="text/javascript"></script>

        <!-- jsPsych Plugins -->

        [...]

        <!-- jsPsych stylesheet -->

        <link href="../../src/vendor/jspsych-6.1.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>

        <!-- Experiment code and utilities -->

        [...]

    </head>

    <!-- Do not change -->

    <body>
      <div id="jspsych-target"><div id="load-text" class="very-large"></div></div>
    </body>

</html>

```

Typically, the only changes that would be made to this file are (1) including additional jsPsych plugins under "jsPsych Plugins" and (2) including additional JavaScript files under "Experiment code and utilities". 

### resources/

The `resources/` folder is used to hold all code and data needed to run the experiment,. This includes the .js file(s) that define the experiment procedure, lists of stimuli, and the stimuli themselves. It is recommended that audio files be placed in `resources/data/audio`, images be placed in `resources/data/images`, and so on.

#### resources/data/stimuli.json

This file is used to define the stimuli for the experiment in JSON format, as well as to define any other static data you might want to separate from the experiment's JavaScript code (such as instructions). Below is a partial example from a published experiment. In this experiment, stimuli were separated into four different lists, and each stimulus included the information `list`, `position`, `id`, `condition`, `verb_type`, `adjunct_type`, and `audio_name`.

```JSON
{
  "stimuli": {
    "l1":
      [["List1", "1", "FILLER_GOOD_1", "FILLER_GOOD", "N/A", "N/A", "FILLER_GOOD_1.wav"], ... ],
    
    "l2":
      [["List2", "1", "FILLER_GOOD_1", "FILLER_GOOD", "N/A", "N/A", "FILLER_GOOD_1.wav"], ... ]
  },
      
  "trial_instructions": {
    "stimulus": "<p class=\"text-center large\">Please rate the naturalness of the sentence you just heard. Input your response using the keyboard.</p>",
    ...
  }
  ...
}
```

#### resources/data/js

All JavaScript code is placed in this folder. The sample experiment contains three files: `experiment.js`, `runner.js`, and `firebase-config.js`. 

- `experiment.js` is where the the actual experimental procedure is defined. **This is typically the only file you need to edit.**
- `firebase-config.js` contains the API keys for Firebase as well as various helper functions. Unless you are using a different Firebase site from the lab's, this file does not need to be edited.
- `runner.js` launches the experiment defined in `experiment.js`. There is only one place in this file you may need to edit, which is the email that is displayed when someone tries to access the experiment after completing it (line 98):
  ```JavaScript
  function showUserError() {
    $( '#jspsych-target' ).append($('<div>', {
       id: 'error',
       class: 'text-center',
       html: '<p>It appears that you have previously completed a study from <Lab> that used the same data as, ' + 
             'or similar data to, the study you are attempting to complete now.' +  
             'Unfortunately, we cannot allow the same person to participate in an experiment more than once.' + 
             'We apologize for the inconvenience, but we must ask that you return your experiment now.' + 
             '(This will not negatively impact your ability to participate in future experiments.)</p>' + 
             '<p>If you believe that this message has been shown in error, please contact the lab at' + 
             '<a href="mailto:savithry@umich.edu">savithry@umich.edu</a>, ' +  // Change email here
             'and we will do our best to resolve the situation.</div>'
     }));
  ```

## Setting up Firebase

### Step 1: Install the Firebase command line tools

1. Download and install [Node.js](nodejs.org/)
2. Install `firebase-tools` via the command `npm install -g firebase-tools`

### Step 2: Set up Firebase hosting

You have two options:

1. Log into the [Firebase Console](firebase.google.com/) using your preferred Google account and create a new project.
2. Request access to the lab's Firebase project. You can email arkram AT umich DOT edu for access.

### Step 3: Link your local project to the console

1. **Important**: If you are using the lab's Firebase project, you *must* first download or clone this repository using `git clone https://github.com/ccc-lab/ccc-firebase.git`
2. `cd` into the directory you'd like to link to your online project. If you are using the lab's project, this will be the folder you downloaded in step 1.
3. Run the command `firebase init`.
4. When asked "Which Firebase CLI features do you want to set up for this folder?" select "Database", "Hosting", and "Storage".
5. You will be prompted to choose an existing project or create a new one. Select "Use an existing project". At this point you may be asked to log into Firebase if you haven't already.
6. Select the project you would like to associate with your local directory. If you are using the lab's project, it will be called `ccclab-573ff (CCCLab)`.
7. Press enter to select the default options for any remaining questions. (Unless you know what you are doing and want to change them!)

## Testing and publishing experiments

To test experiments locally, simply run `firebase serve` and navigate to your experiment's "experiment.html" page (typically http://localhost:5000/{EXPERIMENT_FOLDER}/experiment.html). To publish your local changes to the online project, run `firebase deploy`. If your experiment is being hosted by the lab, it can be found at https://ccclab-573ff.firebaseapp.com/{EXPERIMENT_NAME}/experiment.html.

----

# Running the pupillometry experiment

## Stimuli

Stimuli for the experiments are hosted on Google Drive. Please contact arkram {at} umich {dot} edu or savithry {at} umich {dot} edu for access. Once downloaded, stimuli should be placed in the `/resources/sound/{language}` (or `/resources/images`) folder of the experiment they correspond to.

## Testing

Once stimuli are downloaded, serve the experiment by running

`cd /home/ccc-lab/Desktop/MCubed/ccc-firebase`

`superstatic` (to serve offline; `firebase serve` to serve online)

Then open Google Chrome and navigate to

  Firebase: http://localhost:5000/mcubed/constorder/launcher.html?lang={language} (sp or en)

  Superstatic: http://localhost:3474/mcubed/constorder/launcher.html?lang={language} (sp or en)

Enter a subject number and list number (e.g. 1, 1) and click "Continue", then "Begin Experiment".

When testing the stimuli, the pupillometry display can be ignored. Advance through the experiment and ensure that all audio files play and that all conditions are recorded in the resulting output from both jsPsych and Jeeliz.

If the experiment does not run, open the browser console. Most likely, an audio file could not be located; the file name will appear in the console as an error (404). Double-check that audio names are consistent with the names in the appropriate `.data.json` file in `/resources/data/`.

## Instructions for running experiments on the lab laptop (Ubuntu)

### BEFORE RUNNING ANYTHING:

1. Open the terminal and enter `sudo apt update`, then wait for the update to complete.

2. To see which packages need to be updated, enter `apt list --upgradable`.

3. When completed, in order to actually upgrade the packages, enter `sudo apt upgrade`.

4. After sudo apt upgrade, it will tell you how much space the update will take up; press 'y' to accept the extra space for the upgrade.

**Keep terminals open when working. If closed, whatever process you launched in them will terminate.**

### Updating the experiment

If you need to update the experiment:

1. Open terminal and enter the following text:

     `cd /home/ccc-lab/Desktop/MCubed/ccc-firebase`

2. Next, enter the following to pull from the Git repo:

     `git pull`

### Running the experiment

1. Open the terminal and enter the following text:

     `cd /home/ccc-lab/Desktop/neworder/ccc-firebase-master`

     `superstatic` (to serve offline; `firebase serve` to serve online)

2. Launch Google Chrome and paste into the address bar the following URL:

  Firebase: http://localhost:5000/mcubed/constorder/launcher.html?lang={language} (sp or en)

  Superstatic: http://localhost:3474/mcubed/constorder/launcher.html?lang={language} (sp or en)

  Currently, the flags `en` and `sp` are supported.

3. Open a new terminal window (ctrl, alt, t). To get more features that adjust the camera, enter the following in the terminal:

     `v4l2ucp /dev/video2`

If two error messages pop up, ignore them (i.e press ok) and proceed. If it doesn't seem like v4l2ucp is affecting the camera, try a different `video`, e.g. `video0`, `video1`.

4. Calibrate the subject

5. Run experiment

6. When finished running experiments, close Google Chrome, then go to the local server terminal window and press ctl+C to stop the local server.

7. Close all programs and log out/shut down.
