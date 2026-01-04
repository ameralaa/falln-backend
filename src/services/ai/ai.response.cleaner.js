function cleanJsonResponse(raw) {
  if (!raw) return raw;

  let text = raw.trim();
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start !== -1 && end !== -1) {
    return text.slice(start, end + 1);
  }

  return text;
}

function cleanTextResponse(raw) {
  return raw ? raw.trim() : raw;
}

module.exports = {
  cleanJsonResponse,
  cleanTextResponse
};
