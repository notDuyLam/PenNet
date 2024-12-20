document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const noticeElement = document.querySelector(".notice");
  const messageElement = noticeElement.querySelector("p");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;

    fetch("/users/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ email: email }).toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Token reset email sent") {
          noticeElement.classList.remove("hidden");
          messageElement.classList.add("text-green-500");
          messageElement.classList.remove("text-red-500");
          messageElement.textContent = data.message;
          setTimeout(() => {
            window.location.href = "/users/reset-password";
          }, 2000);
        } else {
          noticeElement.classList.remove("hidden");
          messageElement.classList.add("text-red-500");
          messageElement.classList.remove("text-green-500");
          messageElement.textContent = "User not found. Please try again.";
        }
      })
      .catch((error) => {
        noticeElement.classList.remove("hidden");
        messageElement.classList.add("text-red-500");
        messageElement.classList.remove("text-green-500");
        messageElement.textContent =
          "There was an error sending the reset token. Please try again.";
      });
  });
});
