import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [require.resolve('../lib')],
  apollo: {
    uri: 'https://countries.trevorblades.com/',
  },
});
