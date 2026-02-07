
const env = import.meta.env;

export const appConfig = {
  githubRepoUrl: env.VITE_GITHUB_REPO_URL ?? 'https://github.com/devalbo/trammel',
} as const;
