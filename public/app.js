const chatEl = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

const addMessage = (text, sender, save = true) => {
  const el = document.createElement("div");
  el.className = `message ${sender}`;
  
  if (sender === "bot") {
    // Parse markdown if it's the bot
    el.innerHTML = marked.parse(text);
  } else {
    el.textContent = text;
  }
  
  // Insert before the typing indicator
  chatEl.insertBefore(el, typingIndicator);
  scrollToBottom();

  if (save) {
    chatHistory.push({ text, sender });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
};

const initChat = () => {
  if (chatHistory.length > 0) {
    const existingMessages = chatEl.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    chatHistory.forEach(msg => {
      addMessage(msg.text, msg.sender, false);
    });
  } else {
    chatHistory.push({ text: "Hello! I'm your travel guide. Where would you like to explore today? 🌍", sender: "bot" });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
};

initChat();

const scrollToBottom = () => {
  chatEl.scrollTop = chatEl.scrollHeight;
};

const showTyping = () => {
  typingIndicator.style.display = "flex";
  scrollToBottom();
};

const hideTyping = () => {
  typingIndicator.style.display = "none";
};

const sendMessage = async () => {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  messageInput.value = "";
  sendButton.disabled = true;
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: chatHistory })
    });

    const data = await response.json();
    hideTyping();
    if (data.error) {
      addMessage(`${data.error}: ${data.details || ''}`, "bot");
    } else {
      addMessage(data.reply || "No reply from server.", "bot");
    }
  } catch (error) {
    hideTyping();
    addMessage("Error connecting to server. Please try again.", "bot");
  } finally {
    sendButton.disabled = false;
    messageInput.focus();
  }
};

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Quick Action Buttons
const quickActions = document.querySelectorAll(".action-btn");
quickActions.forEach(btn => {
  btn.addEventListener("click", () => {
    messageInput.value = btn.textContent;
    sendMessage();
  });
});
