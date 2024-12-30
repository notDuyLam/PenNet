function gridClass(length) {
  return length > 1 ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4";
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

document.getElementById("load-more").addEventListener("click", function () {
  const pageNumberElement = document.querySelector("#Paging p");
  const pageNumber = parseInt(pageNumberElement.textContent) + 1;

  const userIdElement = document.getElementById("user_id");
  const user = {
    id: userIdElement.textContent,
    isAdmin: userIdElement.getAttribute("data-is-admin") === "true",
  };
  fetch(`/api/users/posts?page=${pageNumber}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.html || data.html.length === 0) {
        alert("No more posts to load");
      } else {
        const morePosts = $(data.html);
        $(document).find(".posts-container").append(morePosts);
        pageNumberElement.textContent = pageNumber; // Update the page number element
      }
    })
    .catch((error) => console.error("Error fetching posts:", error));
});


