# Travel Guide Chatbot

A simple travel guide chatbot that uses the Groq API to answer travel-related questions and rejects off-topic requests with the message:

"Ask questions related to Travel only"

## Setup

1. Copy `.env.example` to `.env`.
2. Set your `GROQ_API_KEY` and optionally update `GROQ_API_URL` if needed.
3. Run:

```bash
npm install
npm start
```

4. Open http://localhost:3000 in your browser.

## Usage

- Ask travel-related questions like "What should I see in Paris?"
- If you ask something outside travel, the bot will reply:

  `Ask questions related to Travel only`
