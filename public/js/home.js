document
  .getElementById("image-upload")
  .addEventListener("change", function (event) {
    const fileInput = event.target;
    const files = fileInput.files;
    const previewContainer = document.createElement("div");
    previewContainer.id = "image-preview-container";
    previewContainer.classList.add("flex", "flex-wrap", "mt-4");

    // Clear previous previews
    const existingPreview = document.getElementById("image-preview-container");
    if (existingPreview) {
      existingPreview.remove();
    }

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("flex", "justify-around");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("h-20", "w-20", "object-cover", "mr-2", "mb-2");
        previewContainer.appendChild(img);
      };

      reader.readAsDataURL(file);
    }

    wrapperDiv.appendChild(previewContainer);
    const targetDiv = document.querySelector(
      ".flex.items-center.mb-4.data-send"
    );
    targetDiv.parentNode.insertBefore(wrapperDiv, targetDiv.nextSibling);
  });

document
  .querySelector("#post-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    alert("Please wait while your post is being submitted...");
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
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      if (response.ok) {
        // Handle successful response
        alert("Post submitted successfully");
      } else {
        // Handle error response
        alert("Error submitting post");
      }
    } catch (error) {
      alert("Error submitting post", error);
    }
  });
