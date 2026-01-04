const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, '../../prompts');

function loadPrompt(filename) {
  const filePath = path.join(PROMPTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filename}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

module.exports = { loadPrompt };
