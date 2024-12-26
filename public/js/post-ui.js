// Like post button logic
$(document).on("click", ".post-like, .comment-like", function () {
  // Lấy postId từ thuộc tính data-post-id
  const postId = $(this).closest("[data-post-id]").data("post-id");

  let isLike;

  const icon = $(this).find("i");

  if (icon.hasClass("fa-regular")) {
    // đang là unlike -> chuyển sang like
    icon.removeClass("fa-regular").addClass("text-blue-600 fa-solid");
    isLike = true;
  } else {
    // đang là like -> chuyển sang unlike
    icon.removeClass("text-blue-600 fa-solid").addClass("fa-regular");
    isLike = false;
  }

  $.ajax({
    url: `/posts/like/${postId}`,
    method: "POST",
  });
});

$(document).on("click", ".post-comment", function () {
  // lấy user
  const user = {
    name: $(".fullName").first().text(),
    avatar: $(".image-avatar").first().attr("src"),
  };

  console.log(user.name);

  // Lấy postId từ thuộc tính data-post-id
  const postId = $(this).closest("[data-post-id]").data("post-id");

  // Fetch comments from server
  $.ajax({
    url: `/posts/comment/${postId}`,
    method: "GET",
    success: function (response) {
      // Assuming response is an array of comments
      response.forEach((comment) => {
        $(post_details)
          .find("#container")
          .append(
            `
              <div class="flex p-4 border-b">
            <img class="rounded-full w-12 h-12 mr-4" src="${comment.user.avatar_url}" alt="user-avatar">
            <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                <div class="rounded-xl p-2 pl-4 pr-4">
              <div class="font-bold">${comment.user.first_name} ${comment.user.last_name}</div>
              <div>${comment.content}</div>
                </div>
                <div class="comment-like flex text-xl mr-2">
              <i class="fa-regular fa-thumbs-up mr-2 cursor-pointer"></i>
                </div>
            </div>
              </div>
            `
          );
      });
    },
    error: function (error) {
      console.error("Failed to fetch comments:", error);
      alert("Failed to load comments. Please try again!");
    },
  });

  // Tạo modal chứa danh sách comment
  const post_details = $(`
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50">
            <div class="flex flex-col w-1/2 h-2/3 bg-white rounded">
                <div class="flex justify-end p-2 pr-4">
                    <button id="close-modal" class="text-gray-500 hover:text-black text-xl">&times;</button>
                </div>
                <div id="container" class="flex-grow overflow-y-auto">
                    
                </div>
                <div class="flex p-4 border-b">
                    <img class="rounded-full w-12 h-12 mr-4" src="${user.avatar}" alt="user-avatar">
                    <div class="rounded-xl flex-grow flex bg-gray-200 items-center w-full">
                        <div class="rounded-xl p-2 pl-4 pr-4 flex-grow">
                            <div class="font-bold">${user.name}</div>
                            <div data-post-id="${postId}" class="w-full border flex flex-col rounded mb-4 hidden"></div>
                            <form id="comment-form">
                                <input 
                                    name="content" id="content" type="text" 
                                    class="w-full p-4 border border-[#ECF0F5] 
                                    rounded-md text-sm text-[#707988]" placeholder="Comment here"
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

  $(post_details)
    .find("#comment-form")
    .on("submit", function (e) {
      e.preventDefault();

      const form = $(this);
      const content = form.find("#content").val(); // Lấy nội dung comment

      if (!content.trim()) {
        alert("Comment cannot be empty!");
        return;
      }

      // Lấy postId từ thuộc tính data-post-id
      const postId = $(this).closest("form").prev().data("post-id");

      // Gửi dữ liệu comment về server qua AJAX
      $.ajax({
        url: `/posts/comment/${postId}`,
        method: "POST",
        data: { content },
        success: function (response) {
          // Thêm comment mới vào danh sách mà không cần reload
          $(post_details)
            .find("#container")
            .append(
              `
                <div class="flex p-4 border-b">
                  <img class="rounded-full w-12 h-12 mr-4" src="${response.user.avatar_url}" alt="user-avatar">
                  <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                    <div class="rounded-xl p-2 pl-4 pr-4">
                      <div class="font-bold">${response.user.first_name} ${response.user.last_name}</div>
                      <div>${response.content}</div>
                    </div>
                    <div class="comment-like flex text-xl mr-2">
                      <i class="fa-regular fa-thumbs-up mr-2 cursor-pointer"></i>
                    </div>
                  </div>
                </div>
                `
            );
          form[0].reset(); // Reset form sau khi gửi thành công
        },
        error: function (err) {
          console.error(err);
          alert("Failed to add comment.");
        },
      });
    });

  // Thêm modal vào body
  $("body").append(post_details);

  $("body").addClass("no-scroll");

  // Đóng modal khi nhấn nút close
  $(document).on("click", "#close-modal", function () {
    post_details.remove();
    $("body").removeClass("no-scroll");
  });
});

$(document).on("click", ".post-more-btn", function () {
  $(this).siblings("#items").toggleClass("hidden");
});

$(document).on("click", "#edit-post", function (e) {
  e.preventDefault();
  // fetch lấy post từ post id
  const postId = $(this).closest("[data-post-id]").data("post-id");

  let data;

  // Fetch the post data
  $.ajax({
    url: `/posts/${postId}`,
    method: "GET",
    async: false, // Make the request synchronous
    success: function (response) {
      data = response;
    },
    error: function (error) {
      console.error("Failed to fetch post:", error);
      alert("Failed to load post. Please try again!");
    },
  });

  const post = data;

  const edit_post_container = $(`
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50">
            <div class="flex flex-col w-1/2 h-2/3 bg-white rounded justify-between items-center  p-4">
                <div class="text-3xl font-bold ">
                    Edit your post
                </div>

                <div class="flex justify-between border-b rounded p-4 w-full">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between border-b rounded p-4 w-full">
                            <div class="flex items-center">
                                <img class="rounded-full w-12 h-12 mr-4"
                                    src="${post.user.avatar_url}"
                                    alt="user-avatar"
                                >
                                <div>
                                    <div>
                                        ${post.user.first_name} ${post.user.last_name}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <form id="edit-post-form">
                            <textarea class="px-8 pt-4 pb-8 h-52 overflow-auto w-full">${post.content}</textarea>
                        </form>
                    </div>
                </div>

                <div class="flex self-end gap-4 m-2">
                    <button id="submit-form" class="py-2 px-4 bg-gray-300 rounded-xl" > Done </button>
                    <button id="close-modal" class="py-2 px-4 bg-gray-300 rounded-xl"> Cancel </button>
                </div>
            </div>
        </div>
    `);

  $("body").append(edit_post_container);
  $("body").addClass("no-scroll");

  $(document).on("click", "#close-modal", function () {
    edit_post_container.remove();
    $("body").removeClass("no-scroll");
  });

  $(document).on("click", "#submit-form", function () {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const content = $("#edit-post-form textarea").val();
    fetch(`/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Gửi dữ liệu dạng x-www-form-urlencoded
      },
      body: new URLSearchParams({
        content,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Post updated successfully!");
        edit_post_container.remove(); // Đóng modal sau khi cập nhật thành công
        $("body").removeClass("no-scroll");
        // Update the post content on the page
        const postElement = $(`[data-post-id="${postId}"]`);
        postElement.find(".text-lg").text(content);
      })
      .catch((error) => {
        console.error("Failed to update post:", error);
        alert("Failed to update the post. Please try again!");
      });
  });
});
