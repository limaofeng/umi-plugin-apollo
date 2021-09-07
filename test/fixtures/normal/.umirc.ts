export default {
  plugins: [require.resolve('../../../dist')],
  apollo: {
    uri: 'https://countries.trevorblades.com/',
  },
};
