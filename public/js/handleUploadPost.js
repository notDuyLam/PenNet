function gridClass(length) {
  switch (length) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    default:
      return "grid-cols-4";
  }
}
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

document.getElementById("load-more").addEventListener("click", function () {
  const pageNumberElement = document.querySelector("#Paging p");
  const pageNumber = parseInt(pageNumberElement.textContent) + 1;

  const userIdElement = document.getElementById("user_id");
  const user = { id: userIdElement.textContent };
  console.log(user.id);
  fetch(`/api/users/posts?page=${pageNumber}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.posts || data.posts.length === 0) {
        alert("No more posts to load");
      } else {
        data.posts.forEach((post) => {
          console.log(`Post ID: ${post.id}`);
          console.log(
            `Like ID: ${post.likes.map((like) => like.user_id).join(", ")}`
          );
          const postElement = document.createElement("div");
          postElement.setAttribute("data-post-id", post.id);
          postElement.className = "w-full border flex flex-col rounded mb-4";
          postElement.innerHTML = `
            <div class="flex justify-between border-b rounded p-4 w-full">
                <div class="flex items-center">
                    <img class="rounded-full w-12 h-12 mr-4"
                        src="${
                          post.user.avatar_url
                            ? post.user.avatar_url
                            : "/images/avatar.png"
                        }"
                        alt="user-avatar">
                    <div>
                        <div class="font-medium text-xl fullName">
                            ${post.user.first_name} ${post.user.last_name}
                        </div>
                    </div>
                </div>
                ${
                  post.user.id == user.id
                    ? `
                <div class="relative flex flex-col justify-end">
                    <div class="post-more-btn flex justify-end cursor-pointer">
                    <i class="fa-solid fa-ellipsis"></i>
                    </div>
                    <div 
                    id="items" 
                    class="absolute right-0 top-5 bg-white border rounded-xl shadow-lg 
                    group-hover:block w-48 hidden"
                    >
                    <a href="#" id="edit-post" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                        <div class="flex items-center">
                        <i class="fa-solid fa-pen-fancy"></i>
                        <div class="ml-2"><span>Edit post</span></div>
                        </div>
                    </a>
                    <a href="#" id="delete-post" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                        <div class="flex items-center">
                        <i class="fa-solid fa-trash-can"></i>
                        <div class="ml-2"><span>Delete post</span></div>
                        </div>
                    </a>
                    </div>
                    <div>${formatDate(post.updatedAt)}</div>
                </div>
                `
                    : ""
                }
            </div>
            <div class="pl-8 pr-8 pt-4 pb-2">
                <div class="text-lg leading-relaxed text-gray-800">
                    ${post.content}
                </div>
            </div>
            <div class="pl-8 pr-8 pt-4 pb-2">
                ${
                  post.attachments.length
                    ? `
                    <div class="${gridClass(post.attachments.length)}">
                        ${post.attachments
                          .map(
                            (attachment) => `
                        <div class="h-96 bg-gray-200">
                            <img src="${attachment.media_url}" alt="post-attachment" class="w-full h-full rounded object-contain">
                        </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
            <div class="flex justify-between pl-8 pr-8">
                <div class="flex justify-between post-like m-8 text-3xl cursor-pointer">
                
                    ${
                      post.likes.some((like) => {
                        return like.user_id == user.id;
                      })
                        ? `

                    <i class="fa-solid fa-thumbs-up text-blue-600 fa-solid text-xl"></i>
                    <div class="ml-4 text-xl like-count"> ${post.likes.length} </div>
                    `
                        : `
                    <i class="fa-regular fa-thumbs-up text-xl"></i>
                    <div class="ml-4 text-xl like-count"> 0 </div>
                    `
                    }
                </div>
                <div class="post-comment flex items-center m-8 cursor-pointer rounded border-gray-400 w-36 text-xl">
                    <div class="w-4">
                        <i class="fa-regular fa-comment"></i>
                    </div>
                    <div class="ml-4 text-xl comment-count"> ${
                      post ? post.comments.length : 0
                    } </div>
                </div>
            </div>
          `;
          document.querySelector(".posts-container").appendChild(postElement);
        });
        pageNumberElement.textContent = pageNumber; // Update the page number element
      }
    })
    .catch((error) => console.error("Error fetching posts:", error));
});