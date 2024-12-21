document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const noticeElement = document.querySelector(".notice");
  const messageElement = noticeElement.querySelector("p");

  form.addEventListener("submit", async (event) => {
    console.log("OK");

    event.preventDefault();
    const firstName = document.querySelector(
      'input[placeholder="First Name"]'
    ).value;
    const lastName = document.querySelector(
      'input[placeholder="Last Name"]'
    ).value;
    const email = document.querySelector('input[placeholder="Email"]').value;
    const password = document.querySelector(
      'input[placeholder="Password"]'
    ).value;

    if (!firstName || !lastName || !email || !password) {
      messageElement.textContent = "All fields are required.";
      messageElement.classList.add("text-red-500");
      messageElement.classList.remove("text-green-500");
      noticeElement.classList.remove("hidden");
      return;
    }

    const data = {
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
    };

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
        }, 1000);
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
