const socket = io('http://localhost:3000');

let sentId = -1;

async function fetchConversations() {
    try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        console.log(data);
        const conversationList = document.getElementById('conversation-list');
        conversationList.innerHTML = '';

        data.forEach(conversation => {
            let conversationId = conversation.conversation_id;
            socket.emit('joinConversation', { conversationId });
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer';

            listItem.onclick = () => {
                conversationSwitch(conversation.conversation_id, conversation.name);
            };

            const avatar = document.createElement('div');
            avatar.className = 'w-10 h-10 bg-gray-300 rounded-full';
            const img = document.createElement('img');
            img.src = conversation.avatar_url;
            img.alt = conversation.name;
            img.className = 'w-full h-full rounded-full';
            avatar.appendChild(img);

            const textContainer = document.createElement('div');
            const name = document.createElement('p');
            name.className = 'font-medium text-gray-800';
            name.textContent = conversation.name;
            const content = document.createElement('p');
            content.id = `content-${conversation.conversation_id}`;
            content.className = 'text-sm text-gray-500 truncate';
            content.textContent = conversation.content.length > 20 
            ? conversation.content.substring(0, 20) + "..." 
            : conversation.content;

            textContainer.appendChild(name);
            textContainer.appendChild(content);

            listItem.appendChild(avatar);
            listItem.appendChild(textContainer);

            conversationList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
    }
}

const conversationSwitch = async (conversationId, conversationName) => {
    try {
      // Update the conversation header with the new conversation name
      const headerElement = document.querySelector("#conversation-header");
      if (headerElement) {
        headerElement.textContent = conversationName;
      }
  
      // Fetch messages from the API
      const response = await fetch(`/api/conversations/msgs/${conversationId}`);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
  
      const messages = await response.json();
  
      // Select the chat messages container
      const messagesContainer = document.querySelector("#message-list");
  
      if (!messagesContainer) {
        console.error("Messages container not found in the DOM.");
        return;
      }
  
      // Clear any existing messages
      messagesContainer.innerHTML = "";
  
      // Render messages
      messages.forEach((message) => {
        const messageElement = document.createElement("div");
  
        if (message.isSender) {
          // Sent Message
          messageElement.className = "flex justify-end";
          messageElement.innerHTML = `
            <div class="bg-blue-500 text-white p-3 rounded-lg max-w-md max-w-[200px] break-words overflow-hidden">
              <p>${message.content}</p>
              <span class="text-xs text-white block mt-1">${new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
          `;
        } else {
          // Received Message
          messageElement.className = "flex items-start gap-3";
          messageElement.innerHTML = `
            <img class="w-8 h-8 rounded-full object-cover" src="${message.user.avatar_url}" alt="User Avatar" />
            <div class="bg-gray-200 p-3 rounded-lg max-w-md">
              <h1><b>${message.user.first_name}</b></h1>
              <p class="text-gray-800">${message.content}</p>
              <span class="text-xs text-gray-500 block mt-1">${new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
          `;
        }
  
        messagesContainer.appendChild(messageElement);
      });

      const newMessageInput = `
        <div class="p-4 bg-white border-t flex items-center gap-2">
        <input
            id="message-input-content"
            type="text"
            placeholder="Message ..."
            class="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600" onclick="sendMessage(${conversationId})">
            Send
        </button>
        </div>
        `;

        // Append to messagesContainer
      document.getElementById('message-input').innerHTML = newMessageInput;
      setTimeout(()=>{
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 500);
    } catch (error) {
      console.error("Error in conversationSwitch:", error);
    }
  };

const sendMessage = async (conversationId) => {
    try {
        const content = document.getElementById('message-input-content').value;
        const response = await fetch('/api/conversations/msgs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: conversationId,
                content: content,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log('Message sent successfully:', data);

        sentId = data.id;

        const messagesContainer = document.querySelector("#message-list");

        const messageElement = document.createElement("div");
  
        // Sent Message
        messageElement.className = "flex justify-end";
        messageElement.innerHTML = `
        <div class="bg-blue-500 text-white p-3 rounded-lg max-w-md">
            <p>${data.content}</p>
            <span class="text-xs text-white block mt-1">${new Date().toLocaleTimeString()}</span>
        </div>
        `;

        messagesContainer.appendChild(messageElement);

        socket.emit('sendMessage', {messageId: data.id, conversationId: data.conversation_id, senderId: data.user_id, message: data.content });

        document.getElementById('message-input-content').value = "";

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return data; // Trả về dữ liệu từ server
    } catch (error) {
        console.error('Failed to send message:', error.message);
        return null;
    }
}

// Call the function to fetch and render conversations
fetchConversations();

socket.on('receiveMessage', (data) => {
    const messagesContainer = document.querySelector("#message-list");

    const messageElement = document.createElement("div");

    console.log(data);
    console.log(sentId);
    if (data.id != sentId) {
        // Received Message
        messageElement.className = "flex items-start gap-3";
        messageElement.innerHTML = `
            <img class="w-8 h-8 rounded-full object-cover" src="${data.user.avatar_url}" alt="User Avatar" />
            <div class="bg-gray-200 p-3 rounded-lg max-w-md">
            <h1><b>${data.user.first_name}</b></h1>
            <p class="text-gray-800">${data.content}</p>
            <span class="text-xs text-gray-500 block mt-1">${new Date(data.createdAt).toLocaleTimeString()}</span>
            </div>
        `;
    }

    messagesContainer.appendChild(messageElement);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const contentElement = document.getElementById(`content-${data.conversation_id}`);

    const truncatedContent = data.content.length > 20 
    ? data.content.substring(0, 20) + "..." 
    : data.content;

    contentElement.innerHTML = truncatedContent;
});