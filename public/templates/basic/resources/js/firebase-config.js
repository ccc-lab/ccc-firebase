// firebase-config.js
//This file contains the data necessary to connect to your Firebase project.

/******************************************************
 * FIREBASE CONFIGURATION - EDIT WITH YOUR DATA
 ******************************************************/

 /* apiKey - The public API key of the project.
  * Can be found in the project's settings in the Firebase Console.

  * databaseURL - The URL of the project's database.
  * Can be found by navigating to the real-time database in the Firebase Console.

  * storageBucket - The URL of the project's storage bucket.
  * Can be found by navigating to Storage in the Firebase Console.
 */

var config = {
    apiKey:        "",       // TODO: Your key goes here
    databaseURL:   "",  // TODO: "https://your-project.firebaseio.com/"
    storageBucket: "" // TODO: "gs://your-project.appspot.com"
};


/******************************************************
 * FIREBASE INITIALIZATION - NO NEED TO EDIT
 ******************************************************/

firebase.initializeApp(config);

var storage  = firebase.storage();
var database = firebase.database();
