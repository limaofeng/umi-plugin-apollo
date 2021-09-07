import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../dist')],
  apollo: {
    uri: 'https://countries.trevorblades.com/',
  },
});
