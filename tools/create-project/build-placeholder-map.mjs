export function buildPlaceholderMap(answers) {
  return {
    __PROJECT_NAME__: answers.projectName,
    __THEME_PRIMARY__: answers.themePrimary,
    __API_BASE_URL__: answers.apiBaseUrl,
  };
}
