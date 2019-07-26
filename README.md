# ccc-firebase
Firebase-hosted online experiments for the Contact, Cognition and Change Lab.

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

     `cd /home/ccc-lab/Desktop/neworder/ccc-firebase-master`

2. Next, enter the following to pull from the Git repo:

     `git pull`

### Running the experiment

1. Open the terminal and enter the following text:

     `cd /home/ccc-lab/Desktop/neworder/ccc-firebase-master`

     `firebase serve`

2. Launch Google Chrome and paste into the address bar the following URL:

  http://localhost:5000/mcubed/engco/experiment.html

3. Open a new terminal window (ctrl, alt, t). To get more features that adjust the camera, enter the following in the terminal:

     `v4l2ucp`

If two error messages pop up, ignore them (i.e press ok) and proceed.

4. Calibrate the subject

5. Run experiment

6. When finished running experiments, close Google Chrome, then go to the local server terminal window and press ctl+C to stop the local server.

7. Close all programs and log out/shut down.
