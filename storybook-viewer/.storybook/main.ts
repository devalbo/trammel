import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import path from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> || {}),
      '@app-claude': path.resolve(__dirname, '../../app-claude/src'),
    };
    // BASE_PATH is set during CI builds for GitHub Pages (e.g., "/trammel/")
    const basePath = process.env.BASE_PATH;
    if (basePath) {
      config.base = `${basePath.replace(/\/$/, '')}/app-storybook/`;
    }
    return config;
  },
};

export default config;
