import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../dist')],
  apollo: {
    uri: 'http://localhost:8080/graphql',
  },
});
