module.exports = function (api) {
    api.cache(true)
    return {
      "presets": ["react-native", "module:metro-react-native-babel-preset"]
    };
  }