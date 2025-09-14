const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // asegúrate de tener esto en tu .env
});

module.exports = openai;