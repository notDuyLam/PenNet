document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const noticeElement = document.querySelector(".notice");
  const messageElement = noticeElement.querySelector("p");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector('input[placeholder="Name"]').value;
    const email = document.querySelector('input[placeholder="Email"]').value;
    const username = document.querySelector(
      'input[placeholder="Username"]'
    ).value;
    const password = document.querySelector(
      'input[placeholder="Password"]'
    ).value;

    const data = {
      name: name,
      email: email,
      username: username,
      password: password,
    };

    if (!name || !email || !username || !password) {
      messageElement.textContent = "All fields are required.";
      messageElement.classList.add("text-red-500");
      messageElement.classList.remove("text-green-500");
      noticeElement.classList.remove("hidden");
      return;
    }

    try {
      const response = await fetch("/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Signup successful:", result);
        messageElement.innerHTML =
          "Signup successful!<br>Please verify your email and log in";
        messageElement.classList.add("text-green-500");
        messageElement.classList.remove("text-red-500");
        setTimeout(() => {
          window.location.href = "/users/login";
        }, 2000);
      } else {
        const result = await response.json();
        console.error("Signup failed:", result.message);
        messageElement.textContent = `Signup failed: ${result.message}`;
        messageElement.classList.add("text-red-500");
        messageElement.classList.remove("text-green-500");
      }
      noticeElement.classList.remove("hidden");
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
