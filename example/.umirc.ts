import { defineConfig } from "umi";

export default defineConfig({
  plugins: [require.resolve('../dist/cjs')],
  apollo: {
    url: 'https://api.asany.cn/graphql',
    wsUrl: 'wss://api.asany.cn/subscriptions'
  },
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
  ],
  npmClient: 'npm',
});
