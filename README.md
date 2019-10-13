# ccc-firebase
Firebase-hosted online experiments for the Contact, Cognition and Change Lab.

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
