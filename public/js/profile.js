import { sendNotification } from "./notification.js";

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

document.getElementById("edit-button")?.addEventListener("click", function () {
  document.getElementById("first_name").removeAttribute("readonly");
  document.getElementById("first_name").removeAttribute("disabled");
  document.getElementById("last_name").removeAttribute("readonly");
  document.getElementById("last_name").removeAttribute("disabled");
  document.getElementById("edit-button").classList.add("hidden");
  document.getElementById("save-button").classList.remove("hidden");
  document.getElementById("dob").removeAttribute("readonly");
  document.getElementById("dob").removeAttribute("disabled");
  document.getElementById("country").removeAttribute("readonly");
  document.getElementById("country").removeAttribute("disabled");
});

document
  .getElementById("save-button")
  ?.addEventListener("click", async function () {
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const dob = document.getElementById("dob").value;
    const date_of_birth = new Date(
      document.getElementById("dob").value
    ).toISOString();
    const country = document.getElementById("country").value;

    try {
      const response = await fetch("/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          firstName,
          lastName,
          date_of_birth,
          country,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully:", result);
        document.getElementById("first_name").setAttribute("readonly", true);
        document.getElementById("first_name").setAttribute("disabled", true);
        document.getElementById("last_name").setAttribute("readonly", true);
        document.getElementById("last_name").setAttribute("disabled", true);
        document.getElementById("dob").setAttribute("readonly", true);
        document.getElementById("dob").setAttribute("disabled", true);
        document.getElementById("country").setAttribute("readonly", true);
        document.getElementById("country").setAttribute("disabled", true);
        document.getElementById("edit-button").classList.remove("hidden");
        document.getElementById("save-button").classList.add("hidden");
        document.getElementById("first_name").value = firstName;
        document.getElementById("last_name").value = lastName;
        document.querySelectorAll(".fullName").forEach((element) => {
          element.textContent = firstName + " " + lastName;
        });
        document.getElementById("dob").value = dob;
        document.getElementById("country").value = country;
        sendNotification("success", "Profile updated successfully");
      } else {
        const errorResult = await response.json();
        sendNotification("error", "Failed to update profile.");
      }
    } catch (error) {
      sendNotification("error", "An error occurred while updating the profile");
    }
  });

document
  .getElementById("file-input")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.querySelectorAll(".profile-image img").forEach((img) => {
          img.src = e.target.result;
        });
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
        method: "PATCH",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // document.querySelector(".profile-image img").src = result.avatar;
        // document.querySelector(".image-avatar").src = result.avatar;
        sendNotification("success", "Image uploaded successfully");
        document.getElementById("upload-button").classList.remove("hidden");
        document.querySelector(".save").classList.add("hidden");
        setTimeout(() => {
          location.reload();
        }, 500);
      } else {
        const errorResult = await response.json();
        sendNotification("error", "Failed to upload image");
      }
    } catch (error) {
      sendNotification("error", "An error occurred while uploading the image");
    }
  }
});

document
  .getElementById("change-password-button")
  ?.addEventListener("click", function () {
    document.getElementById("profile-form").classList.add("hidden");
    document.getElementById("password-form").classList.remove("hidden");
    document.getElementById("edit-button").classList.add("hidden");
    document.getElementById("change-password-button").classList.add("hidden");
  });

document
  .getElementById("password-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentPassword = document.getElementById("current_password").value;
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (newPassword !== confirmPassword) {
      sendNotification(
        "error",
        "New password and confirm password do not match"
      );
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Password changed successfully:", result);
        sendNotification("success", "Password changed successfully");
        document.getElementById("profile-form").classList.remove("hidden");
        document.getElementById("password-form").classList.add("hidden");
        document.getElementById("edit-button").classList.remove("hidden");
        document
          .getElementById("change-password-button")
          .classList.remove("hidden");
      } else {
        const errorResult = await response.json();
        sendNotification("error", "Failed to change password.");
      }
    } catch (error) {
      sendNotification(
        "error",
        "An error occurred while changing the password"
      );
    }
  });

// Khi trang đã sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
  // Gắn Flatpickr vào input
  const dobInput = document.getElementById("dob");
  const calendarIcon = document.getElementById("dob-calendar");

  // Khởi tạo Flatpickr
  const datepicker = flatpickr(dobInput, {
    dateFormat: "Y-m-d", // Định dạng ngày
    defaultDate: dobInput.value, // Lấy giá trị ban đầu
    onChange: function (selectedDates, dateStr) {
      // Cập nhật giá trị khi chọn ngày
      dobInput.value = dateStr;
    },
  });

  // Hiển thị lịch khi nhấp vào biểu tượng
  calendarIcon.addEventListener("click", () => {
    datepicker.open();
  });
});
