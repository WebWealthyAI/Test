module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NativeWind ermöglicht TailwindCSS-Klassen über className.
    plugins: ['nativewind/babel'],
  };
};
