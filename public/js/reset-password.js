document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const notice = document.querySelector(".notice");
  const noticeText = notice.querySelector("p");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = document.getElementById("token").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.message === "Invalid token") {
          notice.classList.remove("hidden");
          notice.classList.add("bg-red-50", "border-red-200", "text-red-600");
          noticeText.textContent = result.message;
        } else {
          notice.classList.remove("hidden");
          notice.classList.add(
            "bg-green-50",
            "border-green-200",
            "text-green-600"
          );
          noticeText.textContent = result.message;
          setTimeout(() => {
            window.location.href = "/users/login";
          }, 2000);
        }
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error) {
      notice.classList.remove("hidden");
      notice.classList.add("bg-red-50", "border-red-200", "text-red-600");
      noticeText.textContent = error.message;
    }
  });
});
