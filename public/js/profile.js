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

document.getElementById("edit-button").addEventListener("click", function () {
  document.getElementById("name").removeAttribute("readonly");
  document.getElementById("name").removeAttribute("disabled");
  document.getElementById("edit-button").classList.add("hidden");
  document.getElementById("save-button").classList.remove("hidden");
});

document
  .getElementById("save-button")
  .addEventListener("click", async function () {
    const name = document.getElementById("name").value;

    try {
      const response = await fetch("/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ name }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully:", result);
        document.getElementById("name").setAttribute("readonly", true);
        document.getElementById("name").setAttribute("disabled", true);
        document.getElementById("edit-button").classList.remove("hidden");
        document.getElementById("save-button").classList.add("hidden");
        document.querySelector(".username").textContent = name;
        alert("Profile updated successfully");
      } else {
        const errorResult = await response.json();
        console.error("Failed to update profile:", errorResult.message);
        alert("Failed to update profile: " + errorResult.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the profile");
    }
  });

document
  .getElementById("file-input")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.querySelector(".profile-image img").src = e.target.result;
        document.getElementById("upload-button").classList.add("hidden");
        document.querySelector(".save").classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

document.querySelector(".save").addEventListener("click", async function () {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("images", file); // Change the key to "images" to match the server-side handler

    try {
      const response = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        document.querySelector(".profile-image img").src = result.avatar;
        document.querySelector(".image-avatar").src = result.avatar;
        alert("Image uploaded successfully");
        document.getElementById("upload-button").classList.remove("hidden");
        document.querySelector(".save").classList.add("hidden");
      } else {
        const errorResult = await response.json();
        console.error("Failed to upload image:", errorResult.message);
        alert("Failed to upload image: " + errorResult.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while uploading the image");
    }
  }
});
