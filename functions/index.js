const functions = require("firebase-functions");
const admin = require("firebase-admin");
// using admin sdk allows us access to cloud cuntions as it has secutiry permissions
admin.initializeApp();

exports.handleNewUserSignUp = functions.auth.user().onCreate((user) => {
  // Must return a promise or a value. This returns a promise.
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  }); // Will create document with the uid if the user doesn't exist yet
});

exports.handleUserDeleted = functions.auth.user().onDelete((user) => {
  return admin.firestore().collection("users").doc(user.uid).delete();
});

exports.addRequest = functions.https.onCall((data, context) => {
  const text = data.text;
  // hass access to whether or not user is logged in
  if (!context.auth) {
    // fb has a series of error codes to pass in as first arg; second arg is to show on front end
    throw new functions.https.httpsErrorInstance(
      "unauthenticated",
      "Only authenticated users can add requests!"
    );
  }
  // we're passing in a text property on the object we pass in when we call the fn
  if (text.length > 30) {
    throw new functions.https.httpsErrorInstance(
      "invalid-argument",
      "Request must be equal to or fewer than 30 characters"
    );
  }
  return admin.firestore().collection("requests").add({
    text,
    upvotes: 0,
  });
});
