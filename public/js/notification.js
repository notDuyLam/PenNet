export function sendNotification(type, text) {
  // Ensure notificationBox exists
  let notificationBox = document.querySelector(".notification-box");
  if (!notificationBox) {
    notificationBox = document.createElement("div");
    notificationBox.className =
      "notification-box flex flex-col items-end fixed bottom-5 right-5 z-50 space-y-2";
    document.body.appendChild(notificationBox);
  }

  const alerts = {
    info: {
      icon: `<svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
      color: "blue-500",
    },
    error: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
      color: "red-500",
    },
    warning: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`,
      color: "yellow-500",
    },
    success: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
      color: "green-500",
    },
  };

  let component = document.createElement("div");
  component.className = `relative flex items-center bg-${alerts[type].color} text-white text-sm font-bold px-4 py-3 rounded-md opacity-0 transform transition-all duration-500 shadow-lg`;
  component.setAttribute("role", "alert");
  component.innerHTML = `${alerts[type].icon}<p>${text}</p><button class="ml-4 text-white" onclick="this.parentElement.remove()">✖</button>`;

  notificationBox.appendChild(component);

  // Show notification
  setTimeout(() => {
    component.classList.remove("opacity-0");
    component.classList.add("opacity-100");
  }, 10);

  // Hide notification after 5 seconds
  setTimeout(() => {
    component.classList.remove("opacity-100");
    component.classList.add("opacity-0");
  }, 5000);

  // Remove from DOM
  setTimeout(() => {
    if (component.parentElement) {
      notificationBox.removeChild(component);
    }
  }, 5500);
}
