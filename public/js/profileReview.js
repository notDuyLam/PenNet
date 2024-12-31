import { sendNotification } from "./notification.js";

$(document).ready(function () {
  // Xử lý sự kiện click vào nút edit review
  $(document).on("click", ".review-edit i", function (e) {
    $(".items").addClass("hidden"); // Ẩn tất cả các phần tử .items
    $(this).siblings(".items").toggleClass("hidden"); // Hiển thị/tắt phần tử .items gần nhất
    e.stopPropagation();
  });

  // Xử lý click bên ngoài để đóng các menu .items
  $(document).on("click", function (e) {
    if (
      !$(e.target).closest(".review-edit").length &&
      !$(e.target).closest(".items").length
    ) {
      $(".items").addClass("hidden");
    }
  });

  // Xử lý gửi comment mới
  $("#comment-form").on("submit", function (e) {
    e.preventDefault(); // Ngăn chặn hành động submit mặc định

    const form = $(this);
    const content = form.find("#content").val().trim(); // Lấy nội dung comment và xóa khoảng trắng thừa

    if (!content) {
      sendNotification("error", "Comment cannot be empty!");
      return;
    }

    // Lấy profileId từ thuộc tính data-profile-id
    const profileId = $("#viewer_id").text().trim();

    const response = {
      user: {
        avatar_url: $(".image-avatar").attr("src"),
        name: $(".ml-8.mt-4.font-medium.fullName").text().trim(),
      },
      content: content,
    };
    const newReview = `
                    <div class="comment flex p-4 border-b">
                        <img class="rounded-full w-12 h-12 mr-4" src="${response.user.avatar_url}" alt="user-avatar">
                        <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                            <div class="rounded-xl p-2 pl-4 pr-4">
                                <div class="font-bold">${response.user.name}</div>
                                <div>${response.content}</div>
                            </div>
                            <div class="review-edit flex text-xl mr-2 relative">
                                <i class="fa-solid fa-pen-to-square mr-2 cursor-pointer"></i>
                                <div class="items absolute right-0 w-24 top-6 p-2 z-10 
                                    bg-white border rounded-xl shadow-lg hidden
                                    group-hover:block">
                                    <div class="edit-review w-full px-4 hover:bg-gray-200 cursor-pointer">
                                        Edit
                                    </div>
                                    <div class="delete-review w-full px-4 hover:bg-gray-200 cursor-pointer">
                                        Delete
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;

    form
      .closest("#your-review-tab")
      .find("#reviews-container")
      .append(newReview);
    form[0].reset(); // Reset form sau khi gửi thành công

    // Gửi dữ liệu comment về server qua AJAX
    $.ajax({
      url: `/users/profile/${profileId}/review`,
      method: "POST",
      data: { content },
      success: function (response) {
        // Thêm review
        const newReview = `
                    <div class="comment flex p-4 border-b">
                        <img class="rounded-full w-12 h-12 mr-4" src="${response.user.avatar_url}" alt="user-avatar">
                        <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                            <div class="rounded-xl p-2 pl-4 pr-4">
                                <div class="font-bold">${response.user.first_name} ${response.user.last_name}</div>
                                <div>${response.content}</div>
                            </div>
                            <div class="review-edit flex text-xl mr-2 relative">
                                <i class="fa-solid fa-pen-to-square mr-2 cursor-pointer"></i>
                                <div class="items absolute right-0 w-24 top-6 p-2 z-10 
                                    bg-white border rounded-xl shadow-lg hidden
                                    group-hover:block">
                                    <div class="edit-review w-full px-4 hover:bg-gray-200 cursor-pointer">
                                        Edit
                                    </div>
                                    <div class="delete-review w-full px-4 hover:bg-gray-200 cursor-pointer">
                                        Delete
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;

        form.closest("#reviews-container").append(newReview);
        form[0].reset(); // Reset form sau khi gửi thành công
        sendNotification("success", "Comment added successfully!");
      },
      error: function (err) {
        sendNotification("error", "Failed to add comment!");
      },
    });
  });

  // xử lý edit comment
  $(document).on("click", ".edit-review", function (e) {
    const viewerId = $("#viewer_id").text().trim();
    // Lấy postId từ thuộc tính data-post-id
    const reviewId = $(this).closest(".comment").attr("data-review-id");
    const review = $(this).closest(".comment").find(".review-content");
    review.attr("contenteditable", "true").focus();
    review.siblings(".submit-btn").removeClass("hidden");
    review.siblings(".submit-btn").on("click", function (e) {
      e.preventDefault();
      const reviewContent = review.text().trim();
      review.attr("contenteditable", "false");
      fetch(`/users/profile/${viewerId}/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: reviewContent }),
      })
        .then((response) => {
          if (response.ok) {
            review.siblings(".submit-btn").addClass("hidden");
            review.attr("contenteditable", "false");
          } else {
            throw new Error("Failed to edit comment.");
          }
        })
        .catch((err) => {
          sendNotification("error", "Failed to edit comment!");
          review.siblings(".submit-btn").removeClass("hidden");
          review.attr("contenteditable", "false");
        });
    });
  });
  // xử lý delete comment
  $(document).on("click", ".delete-review", function (e) {
    const reviewId = $(this).closest(".comment").attr("data-review-id");
    const viewerId = $("#viewer_id").text().trim();
    fetch(`/users/profile/${viewerId}/review/${reviewId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          sendNotification("success", "Comment deleted successfully.");
          $(this).closest(".comment").remove();
        } else {
          sendNotification("error", "Failed to delete comment.");
        }
      })
      .catch((err) => {
        console.error(err);
        sendNotification("error", "Failed to delete comment.");
      });
  });
});
