// darkmode.js
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const darkModeToggle = document.getElementById("darkmode");

  // Kiểm tra trạng thái dark mode từ localStorage
  const darkModeEnabled = localStorage.getItem("darkMode") === "true";

  // Áp dụng chế độ dark mode nếu đã được lưu
  if (darkModeEnabled) {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
    updateToggleState(darkModeToggle, true);
  } else {
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
    updateToggleState(darkModeToggle, false);
  }

  // Xử lý sự kiện khi nhấn vào nút dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isDarkMode = body.classList.toggle("dark-mode");
      body.classList.toggle("light-mode", !isDarkMode);

      // Cập nhật trạng thái nút
      updateToggleState(darkModeToggle, isDarkMode);

      // Lưu trạng thái dark mode vào localStorage
      localStorage.setItem("darkMode", isDarkMode);
    });
  }

  // Hàm cập nhật trạng thái của nút Dark Mode
  function updateToggleState(toggleElement, isDarkMode) {
    const icon = toggleElement.querySelector("i");
    const text = toggleElement.querySelector("span");
    if (isDarkMode) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      text.textContent = "Light Mode";
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      text.textContent = "Dark Mode";
    }
  }
});
