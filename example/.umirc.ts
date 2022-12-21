import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../dist')],
  apollo: {
    url: 'http://localhost:8080/graphql',
    wsUrl: 'ws://localhost:8080/subscriptions'
  },
});
