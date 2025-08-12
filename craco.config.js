module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore critical dependency warnings from Supabase
      webpackConfig.ignoreWarnings = [
        {
          module: /@supabase\/realtime-js/,
        },
        {
          message: /Critical dependency/,
        },
      ];
      
      return webpackConfig;
    },
  },
}; 