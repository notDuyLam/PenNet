document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const noticeElement = document.querySelector(".notice");
  const messageElement = noticeElement.querySelector("p");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    try {
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Login successful:", result);
        // Handle successful login
        noticeElement.classList.remove("hidden");
        messageElement.classList.add("text-green-500");
        messageElement.classList.remove("text-red-500");
        messageElement.innerHTML = "Login successful!";
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        const errorResult = await response.json();
        console.error("Login failed:", errorResult.message);
        // Handle login failure
        noticeElement.classList.remove("hidden");
        messageElement.classList.add("text-red-500");
        messageElement.classList.remove("text-green-500");
        messageElement.innerHTML = "Login failed:<br>" + errorResult.message;
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  });
});
