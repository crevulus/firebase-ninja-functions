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
  // has access to whether or not user is logged in
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
      "Request must be equal to or fewer than 30 characters."
    );
  }
  return admin.firestore().collection("requests").add({
    text,
    upvotes: 0,
  });
});

exports.upvoteRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.httpsErrorInstance(
      "unauthenticated",
      "Only authenticated users can upvote requests!"
    );
  }
  // get references for two docs: user and request
  const user = admin.firestore().collection("users").doc(context.auth.uid);
  const request = admin.firestore().collection("requests").doc(data.id); // we will pass the id of the tut req when we call the fn
  return user.get().then((doc) => {
    // check user hasn't already upvoted this request
    if (doc.data().upvotedOn.includes(data.id)) {
      throw new functions.https.httpsErrorInstance(
        "failed-precondition",
        "Can only upvote something once."
      );
    }
    // update upvotedOn array
    user.update({
      upvotedOn: [...doc.data().upvotedOn, data.id],
    });
    request.update({
      upvotes: admin.firestore.FieldValue.increment(1),
    });
    return;
  });
});
