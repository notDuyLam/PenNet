document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
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
        // Handle successful signup (e.g., redirect to login page)
      } else {
        const result = await response.json();
        console.error("Signup failed:", result.message);
        // Handle signup failure (e.g., show error message)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
