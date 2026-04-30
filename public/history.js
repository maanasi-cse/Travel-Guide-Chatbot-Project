const historyContent = document.getElementById("historyContent");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const renderHistory = () => {
  historyContent.innerHTML = "";
  let chatHistory = [];
  
  try {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      chatHistory = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse chat history", e);
  }

  if (!chatHistory || chatHistory.length === 0) {
    historyContent.innerHTML = `<div class="empty-state">No chat history available. Start a conversation!</div>`;
    clearHistoryBtn.style.display = "none";
    return;
  }

  clearHistoryBtn.style.display = "inline-block";

  chatHistory.forEach(msg => {
    const el = document.createElement("div");
    el.className = `message ${msg.sender}`;
    
    if (msg.sender === "bot") {
      try {
        el.innerHTML = marked.parse(msg.text);
      } catch (e) {
        el.textContent = msg.text;
      }
    } else {
      el.textContent = msg.text;
    }
    
    historyContent.appendChild(el);
  });
  
  // Scroll to bottom
  historyContent.scrollTop = historyContent.scrollHeight;
};

clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
    localStorage.removeItem("chatHistory");
    renderHistory();
  }
});

// Initial render
renderHistory();
