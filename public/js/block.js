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
            alert("User successfully unblocked");
          } else {
            alert("Failed to unblock user");
          }
        })
        .catch((error) => {
          alert("An error occurred while trying to unblock the user.");
          console.error("Error:", error);
        });
    });
  });
});
