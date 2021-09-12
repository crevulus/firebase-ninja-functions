const requestModal = document.querySelector(".new-request");
const requestLink = document.querySelector(".add-request");
const requestForm = document.querySelector(".new-request form");
const notification = document.querySelector(".notification");

// open request modal
requestLink.addEventListener("click", () => {
  requestModal.classList.add("open");
});

// close request modal
requestModal.addEventListener("click", (event) => {
  if (event.target.classList.contains("new-request")) {
    requestModal.classList.remove("open");
  }
});

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const addRequest = firebase.functions().httpsCallable("addRequest");
  // "request" is the name of the input field in this form
  addRequest({ text: requestForm.request.value })
    .then(() => {
      requestForm.reset();
      requestModal.classList.remove("open");
      requestForm.querySelector(".error").textContent = "";
    })
    .catch((error) => {
      requestForm.querySelector(".error").textContent = error.message;
    });
});

const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("active");
  setTimeout(() => {
    notification.classList.remove("active");
    notification.textContent = "";
  }, 4000);
};
