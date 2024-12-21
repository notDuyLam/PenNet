document.getElementById("upload-button").addEventListener("click", function () {
  document.getElementById("file-input").click();
});

document
  .getElementById("file-input")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.querySelector(".profile-image img").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
