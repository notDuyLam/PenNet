document
  .querySelector("#post-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData();
    const fileInput = document.getElementById("image-upload");
    const files = fileInput.files;
    const content = document.querySelector("textarea[name='content']").value;
    formData.append("content", content);
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
    }

    console.log(formData);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      if (response.ok) {
        // Handle successful response
        console.log("Post submitted successfully");
      } else {
        // Handle error response
        console.error("Error submitting post");
      }
    } catch (error) {
      console.error("Error submitting post", error);
    }
  });
