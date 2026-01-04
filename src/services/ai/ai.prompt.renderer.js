function renderPrompt(template, variables = {}) {
  let output = template;

  for (const [key, value] of Object.entries(variables)) {
    output = output.replaceAll(`{{${key}}}`, String(value));
  }

  return output;
}

module.exports = { renderPrompt };
