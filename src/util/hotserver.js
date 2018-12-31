var WebpackDevServer = require("webpack-dev-server"),
    webpack = require("webpack"),
    config = require("../../webpack.config"),
    path = require("path");

PORT = process.env.PORT || 3000;

// inject dev server config to each webpack entry
for (var entryName in config.entry) {
  config.entry[entryName] = [
      ("webpack-dev-server/client?http://localhost:" + PORT),
      "webpack/hot/dev-server"
    ].concat(config.entry[entryName]);
}

// react-hot-loader to the babel-loader 
const tsxRule = config.module.rules.find(r => r.test.toString().includes('.tsx'));
const babelLoader = tsxRule.use.find(l => l.loader = 'babel-loader');
babelLoader.options.cacheDirectory = true;
babelLoader.options.plugins.push('react-hot-loader/babel');

// add HMR plugin to the config
config.plugins =
  [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

var compiler = webpack(config);

var server =
  new WebpackDevServer(compiler, {
    hot: true,
    contentBase: path.join(__dirname, "../../dist-dev"),
    headers: { "Access-Control-Allow-Origin": "*" }
  });

server.listen(PORT);
