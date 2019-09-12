/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {resolve} = require("path");

module.exports = {
  resolver:{
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders:[
    resolve(__dirname, "node_modules/@holusion/react-native-holusion"),
  ],
};
