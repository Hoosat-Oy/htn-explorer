module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress webpack-dev-server deprecation warnings
      if (webpackConfig.devServer) {
        // Remove deprecated options
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;

        // Use new setupMiddlewares option if needed
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          return middlewares;
        };
      }

      // Configure sass-loader to use modern API
      const oneOf = webpackConfig.module.rules.find(rule => rule.oneOf);
      if (oneOf) {
        const sassRule = oneOf.oneOf.find(rule =>
          rule.test && rule.test.toString().includes('scss|sass')
        );
        if (sassRule && sassRule.use) {
          sassRule.use.forEach(loader => {
            if (loader.loader && loader.loader.includes('sass-loader')) {
              loader.options = {
                ...loader.options,
                sassOptions: {
                  ...loader.options?.sassOptions,
                  silenceDeprecations: ['legacy-js-api', 'import'],
                },
              };
            }
          });
        }
      }

      return webpackConfig;
    },
  },
};
