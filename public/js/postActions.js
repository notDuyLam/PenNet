import { sendNotification } from "./notification.js";

$(document).ready(() => {
  $(document).on("click", ".delete-post-btn", async function () {
    const postId = $(this).data("id");
    console.log("Deleting post ID:", postId);
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/posts/admin/${postId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          sendNotification("success", "Post deleted successfully");
          location.reload();
        } else {
          sendNotification("error", "Error deleting post");
        }
      } catch (error) {
        sendNotification("error", "Error deleting post");
      }
    }
  });
});
