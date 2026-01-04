module.exports = {
  models: {
    single_vibe: 'gpt-4o-mini',
    multi_pattern: 'gpt-4o',
    full_report: 'gpt-4o'
  },

  temperature: {
    single_vibe: 0.5,
    multi_pattern: 0.7,
    full_report: 0.4
  },

  maxTokens: {
    single_vibe: 50,
    multi_pattern: 200,
    full_report: 1200
  }
};
