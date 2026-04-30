const chatEl = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");

let chatHistory = [];
try {
  const stored = localStorage.getItem("chatHistory");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every(msg => msg && typeof msg.text === 'string' && typeof msg.sender === 'string')) {
      chatHistory = parsed;
    } else {
      console.warn("Malformed chat history found. Resetting.");
      localStorage.removeItem("chatHistory");
    }
  }
} catch (e) {
  console.error("Error parsing chat history:", e);
  localStorage.removeItem("chatHistory");
}

const addMessage = (text, sender, save = true) => {
  if (!text) return;
  const el = document.createElement("div");
  el.className = `message ${sender}`;
  
  if (sender === "bot") {
    try {
      el.innerHTML = marked.parse(text);
    } catch (e) {
      console.error("Error parsing markdown:", e);
      el.textContent = text;
    }
  } else {
    el.textContent = text;
  }
  
  chatEl.insertBefore(el, typingIndicator);
  scrollToBottom();

  if (save) {
    chatHistory.push({ text, sender });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
};

const initChat = () => {
  try {
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
  } catch (e) {
    console.error("Error initializing chat:", e);
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
      let errorMessage = `${data.error}: ${data.details || ''}`;
      if (data.details && data.details.includes('"code": 429')) {
        errorMessage = "Oops! The chatbot has exceeded its API quota (free tier limit reached). Please try again tomorrow, or use a new Groq API key.";
      }
      addMessage(errorMessage, "bot", false);
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

// Calculator Buttons
const calcBtns = document.querySelectorAll(".calc-btn");
calcBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const query = btn.getAttribute("data-query");
    if (query) {
      messageInput.value = query;
      sendMessage();
    }
  });
});
