const { loadPrompt } = require('../ai.prompts.loader');
const { renderPrompt } = require('../ai.prompt.renderer');
const { executeAI } = require('../ai.executor');
const { cleanJsonResponse, cleanTextResponse } = require('../ai.response.cleaner');

async function runGenericAI({
  systemPrompt,
  promptFile,
  variables,
  useCase,
  expectsJson = false
}) {
  const template = loadPrompt(promptFile);
  const userPrompt = renderPrompt(template, variables);

  const { content, usage } = await executeAI({
    systemPrompt,
    userPrompt,
    useCase
  });

  return {
    result: expectsJson
      ? cleanJsonResponse(content)
      : cleanTextResponse(content),
    usage
  };
}

module.exports = { runGenericAI };
