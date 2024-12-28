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
    success: function (response) {
      const likeCountElement = $(this).find(".like-count");
      let likeCount = parseInt(likeCountElement.text());
      if (isLike) {
        likeCount += 1;
      } else {
        likeCount -= 1;
      }
      likeCountElement.text(likeCount);
    }.bind(this),
    error: function (error) {
      console.error("Failed to like/unlike post:", error);
      alert("Failed to like/unlike the post. Please try again!");
    },
  });
});

$(document).on("click", ".post-comment", function () {
  // lấy user
  const user = {
    name: $(".fullName").first().text(),
    avatar: $(".image-avatar").first().attr("src"),
  };

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
                    <div class="comment-like flex text-xl mr-2 items-center">
                        <i class="fa-regular fa-thumbs-up mr-2 cursor-pointer"></i>
                        <div class="mr-4 text-xl like-count"> 0 </div>
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
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
          // Update the comment count
          const commentCountElement = $(`[data-post-id="${postId}"]`).find(
            ".comment-count"
          );
          let commentCount = parseInt(commentCountElement.text());
          commentCount += 1;
          commentCountElement.text(commentCount);
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

$(document).on("click", ".post-more-btn", function (e) {
  const $items = $(this).siblings(".items");
  $(".items").not($items).addClass("hidden");
  $items.toggleClass("hidden");
  e.stopPropagation();
});

// ẩn #items khi nhấn bên ngoài
$(document).on("click", function () {
  $(".items").addClass("hidden");
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
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <div class="flex flex-col w-1/2 h-2/3 bg-white rounded items-center p-4">
                <div class="text-3xl font-bold ">
                    Edit your post
                </div>

                <div class="grow flex justify-between border-b rounded w-full overflow-hidden">
                    <div class="flex flex-col w-full">
                        <div class="flex justify-between border-b rounded p-4 w-full">
                            <div class="flex items-center">
                                <img class="rounded-full w-12 h-12 mr-4"
                                    src="${post.user.avatar_url}"
                                    alt="user-avatar"
                                >
                                <div>
                                    <div>
                                        ${post.user.first_name} ${
    post.user.last_name
  }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="grow flex flex-col overflow-y-auto scroll-custom">
                            <div class="${
                              post.attachments.length > 0 ? "h-1/3" : "h-full"
                            }">
                                <form id="edit-post-form">
                                    <textarea class="px-4 overflow-auto w-full h-full scroll-custom resize-none"
                                        placeholder='${
                                          post.content.length > 0
                                            ? ""
                                            : "Type something here..."
                                        }'
                                    >${post.content}</textarea>
                                </form>
                            </div>
                            <div class="picture-container mt-1 grow overflow-y-auto flex justify-center flex-wrap">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 m-2 justify-between w-full px-4">
                    <div class="flex justify-around">
                        <label for="edit-image-upload" class="cursor-pointer flex items-center">
                        <i class="fa-solid fa-image mr-2"></i>
                        Add Media
                        </label>
                        <input type="file" id="edit-image-upload" name="images" accept="image/*" class="hidden" multiple>
                    </div>
                    <div>
                        <button id="submit-form" class="py-2 px-4 bg-gray-300 rounded-xl" > Done </button>
                        <button id="close-modal" class="py-2 px-4 bg-gray-300 rounded-xl"> Cancel </button>
                    <div>
                </div>
            </div>
        </div>
    `);
  if (post.attachments.length > 0) {
    let post_pictures = ``;
    for (let i = 0; i < post.attachments.length; i++) {
      post_pictures += createPostImgElement(post.attachments[i].media_url);
    }
    $(edit_post_container).find(".picture-container").append(post_pictures);
  }

  $("body").append(edit_post_container);
  $("body").addClass("no-scroll");

  $(document).on("click", "#close-modal", function () {
    edit_post_container.remove();
    $("body").removeClass("no-scroll");
  });

  $(document).on("click", ".image-post .remove-post", function (e) {
    $(this).parent().addClass("hidden");
  });

  $(document).on("change", "#edit-image-upload", function (e) {
    const files = e.target.files;
    const postPictures = $(edit_post_container).find(".picture-container");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgElement = $(createPostImgElement(e.target.result));
        imgElement.attr("getFromFile", `${i}`);
        postPictures.append(imgElement);
      };
      reader.readAsDataURL(file);
    }
  });

  $(document)
    .off("click", "#submit-form")
    .on("click", "#submit-form", function () {
      e.preventDefault();

      // Lấy dữ liệu từ form
      const content = $("#edit-post-form textarea").val();
      // Lấy ảnh
      const formData = new FormData();
      const fileInput = $("#edit-image-upload").get(0);
      const files = fileInput.files;

      const visibleImages = $(".picture-container .image-post:not(.hidden)");
      visibleImages.each(function () {
        const imgElement = $(this);
        if (imgElement.attr("getFromFile")) {
          formData.append("images", files[imgElement.attr("getFromFile")]);
        }
      });

      let removeImageSources = [];
      $(".picture-container .image-post.hidden").each(function () {
        const imgElement = $(this).find("img");
        if (!imgElement.attr("getFromFile")) {
          removeImageSources.push(imgElement.attr("src"));
        }
      });

      // removeImageSources: mảng chứa src các ảnh cần xóa
      // formData: chứa các file (ảnh) cần thêm vào

      if(content.length === 0 && visibleImages.length === 0){
        alert("Post content is empty!");
        return;
      }

      formData.append("content", content);
      formData.append("removeImageSources", JSON.stringify(removeImageSources));

      const spinner = $(`
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div class="spinner"> </div> 
        </div>`);
      $('body').append(spinner).addClass('no-scroll');
      console.log($('body').attr('class'));

      fetch(`/posts/${postId}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          // Update the post content on the page
          const postElement = $(`[data-post-id="${postId}"]`);
          postElement.find(".text-lg").text(content);
          // Update the post attachments on the page
          console.log(data);
          const postPictures = postElement.find(".picture-container");
          postPictures.empty();
          postPictures.removeClass("grid-cols-2").removeClass("grid-cols-1");
          postPictures.addClass(`grid-cols-${data.attachments.length > 1? "2" : "1"}`);
          if (data.attachments.length > 0) {
            let post_pictures = ``;
            for (let i = 0; i < data.attachments.length; i++) {
              post_pictures += createPostImgElementAfterEdit(data.attachments[i].media_url);
            }
            postPictures.append(post_pictures);
          }
        })
        .catch((error) => {
          console.error("Failed to update post:", error);
          alert("Failed to update the post. Please try again!");
        })
        .finally(() => {
          edit_post_container.remove(); // Đóng modal sau khi cập nhật thành công
          spinner.remove();
          $("body").removeClass("no-scroll");
        });
    });
});

$(document).on("click", "#delete-post", function (e) {
  e.preventDefault();
  const postId = $(this).closest("[data-post-id]").data("post-id");

  if (confirm("Are you sure you want to delete this post?")) {
    $.ajax({
      url: `/posts/${postId}`,
      method: "DELETE",
      success: function () {
        alert("Post deleted successfully!");
        $(`[data-post-id="${postId}"]`).remove();
      },
      error: function (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete the post. Please try again!");
      },
    });
  }
});

function createPostImgElement(url) {
  return `
        <div class="image-post max-w-44 bg-gray-200 p-2 flex flex-wrap relative">
            <div 
                class="remove-post absolute top-2 right-2 rounded-full
                bg-white flex items-center justify-center cursor-pointer"
                style="height:20px; width:20px"
            >
                <span>&times</span>
            </div>
            <img src="${url}" alt="post-pictures" class="w-full h-full rounded object-cover">
        </div>`;
}
function createPostImgElementAfterEdit(url) {
  return `
        <div class="max-h-96 bg-gray-200">
            <img src="${url}" alt="post-attachment" class="w-full h-full rounded object-contain">
        </div>`;
}
