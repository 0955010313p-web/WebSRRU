module.exports = {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite'
  },
};
