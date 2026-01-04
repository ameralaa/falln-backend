const { loadPrompt } = require('../ai.prompts.loader');
const { renderPrompt } = require('../ai.prompt.renderer');
const { executeAI } = require('../ai.executor');
const { cleanTextResponse } = require('../ai.response.cleaner');

async function runSingleVibe({ systemPrompt, messageText }) {
  if (!messageText) {
    throw new Error('runSingleVibe: messageText is required');
  }

  const userPromptTemplate = loadPrompt('single.md');

  const userPrompt = renderPrompt(userPromptTemplate, {
    SINGLE_MESSAGE_TEXT: messageText
  });

  const { content, usage } = await executeAI({
    systemPrompt,
    userPrompt,
    useCase: 'single_vibe'
  });

  return {
    result: cleanTextResponse(content),
    usage
  };
}

module.exports = { runSingleVibe };
