import { sendNotification } from "./notification.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".bg-red-100").forEach((button) => {
    button.addEventListener("click", function () {
      const tr = this.closest("tr");
      const userId = tr.id;

      fetch(`/users/friend-request/block/${userId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            tr.remove();
            sendNotification("success", "User successfully unblocked");
          } else {
            sendNotification("error", "Failed to unblock user");
          }
        })
        .catch((error) => {
          sendNotification(
            "error",
            "An error occurred while trying to unblock the user."
          );
          console.error("Error:", error);
        });
    });
  });
});
