// Lấy các phần tử cần thiết
const showRequestsButton = document.getElementById("show-requests");
const showFriendsButton = document.getElementById("show-friends");
const requestList = document.getElementById("request-list");
const friendsList = document.getElementById("friends-list");

// Xử lý sự kiện khi nhấn vào "Requests"
showRequestsButton.addEventListener("click", function () {
  // Ẩn danh sách bạn bè và hiển thị danh sách yêu cầu kết bạn
  friendsList.classList.add("hidden");
  requestList.classList.remove("hidden");

  // Cập nhật kiểu chữ (tùy chọn)
  showRequestsButton.classList.add("font-semibold");
  showRequestsButton.classList.remove("font-normal");
  showFriendsButton.classList.add("font-normal");
  showFriendsButton.classList.remove("font-semibold");
});

// Xử lý sự kiện khi nhấn vào "Your Friends"
showFriendsButton.addEventListener("click", function () {
  // Ẩn danh sách yêu cầu kết bạn và hiển thị danh sách bạn bè
  requestList.classList.add("hidden");
  friendsList.classList.remove("hidden");

  // Cập nhật kiểu chữ (tùy chọn)
  showFriendsButton.classList.add("font-semibold");
  showFriendsButton.classList.remove("font-normal");
  showRequestsButton.classList.add("font-normal");
  showRequestsButton.classList.remove("font-semibold");
});

// Lắng nghe sự kiện click cho các nút "Add friend" và "Remove"
requestList.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    const button = event.target;
    const requestId = button.closest("div[id]").id;

    if (button.textContent === "Add friend") {
      // Gửi yêu cầu kết bạn
      fetch(`/users/friend-request/accept/${requestId}`, {
        method: "POST",
      })
        .then(async (response) => {
          const data = await response.json();
          const user = data.result.info;
          if (response.ok) {
            // Xóa yêu cầu kết bạn khỏi danh sách
            document.getElementById(requestId).remove();
            const friendDiv = document.createElement("div");
            friendDiv.className =
              "flex flex-row bg-gray-50 p-4 border rounded-lg shadow-md";
            friendDiv.id = requestId;
            friendDiv.innerHTML = `
                                <img src='${user.avatar_url}' alt="Friend Avatar" class="w-20 h-20 rounded-full mb-3">
                                <div class="flex flex-col items-start gap-2 relative flex-1 grow">
                                        <div class="relative w-[248px] mt-6 pl-3 font-[Inter-Medium] font-medium text-[20px] leading-normal ">${user.first_name} ${user.last_name}</div>
                                        <div class="relative w-fit pl-3 font-normal text-[#B0B0B0] text-[14px] tracking-normal leading-normal whitespace-nowrap">You are now friends</div>
                                </div>
                                <img src="/images/bacham.png" class="w-20 h-20">
                        `;
            friendsList.appendChild(friendDiv);
            alert("Friend request accepted.");
            console.log(data);
          }
        })
        .catch((error) => console.error("Error:", error));
    } else if (button.textContent === "Remove") {
      // Gửi yêu cầu xóa kết bạn
      fetch(`/users/friend-request/denied/${requestId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            // Xóa yêu cầu kết bạn khỏi danh sách
            document.getElementById(requestId).remove();
            alert("Friend request removed.");
          } else {
            alert("Failed to remove friend request.");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }
});

// Lắng nghe sự kiện click trên biểu tượng ba chấm
document.querySelectorAll("#bacham").forEach((button) => {
  button.addEventListener("click", function (event) {
    const menu = button.nextElementSibling;

    // Kiểm tra nếu menu đang hiển thị hay không và toggle hiển thị
    if (menu.style.display === "block") {
      menu.style.display = "none"; // Ẩn menu
    } else {
      menu.style.display = "block"; // Hiển thị menu
    }

    // Ngừng sự kiện lan truyền để tránh đóng menu ngay lập tức
    event.stopPropagation();
  });
});

// Đóng menu nếu click ra ngoài
document.addEventListener("click", function (event) {
  document.querySelectorAll("#showMenu").forEach((menu) => {
    const button = menu.previousElementSibling;

    // Kiểm tra nếu người dùng nhấn vào ngoài menu hoặc nút ba chấm
    if (!menu.contains(event.target) && event.target !== button) {
      menu.style.display = "none"; // Ẩn menu nếu click ra ngoài
    }
  });
});

// Lắng nghe sự kiện click cho các nút "Unfriend" và "Block"
document.querySelectorAll("#showMenu").forEach((menu) => {
  menu.addEventListener("click", function (event) {
    const friendId = menu.closest("div[id]").parentElement.parentElement.id;

    if (event.target.classList.contains("unfriend-button")) {
      // Xử lý hành động hủy kết bạn
      fetch(`/users/friend/unfriend/${friendId}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            document.getElementById(friendId).remove();
            alert("Friend has been removed.");
          } else {
            alert("Failed to unfriend.");
          }
        })
        .catch((error) => console.error("Error:", error));
    } else if (event.target.classList.contains("block-button")) {
      // Xử lý hành động block
      fetch(`/users/friend-request/block/${friendId}`, { method: "POST" })
        .then((response) => {
          if (response.ok) {
            document.getElementById(friendId).remove();
            alert("User has been blocked.");
          } else {
            alert("Failed to block user.");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  });
});
