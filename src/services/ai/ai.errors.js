function normalizeAIError(error) {
  if (error.response) {
    return {
      type: 'OPENAI_ERROR',
      message: error.response.data?.error?.message || 'OpenAI error'
    };
  }

  return {
    type: 'INTERNAL_ERROR',
    message: error.message || 'Unknown AI error'
  };
}

module.exports = { normalizeAIError };
