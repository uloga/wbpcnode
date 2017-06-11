let path = require("path");
let fs = require("fs");
let webpack = require("webpack");

// --- scan and filter node modules
const nodeModules = fs
	.readdirSync("./node_modules")
	.filter(dir => dir != ".bin");

// --- ignore node_modules // require instead of import
function ignoreNodeModules(context, req, next) {
	if (req[0] == ".") {
		return next();
	}
	const module = req.split("/")[0];
	if (nodeModules.indexOf(module) !== -1) {
		return next(null, "commonjs " + req);
	}
	return next();
}

function config(debug) {

	const plugins = [];

	if (!debug) {
		plugins.push(new webpack.optimize.UglifyJsPlugin());
	}

	return {

		target: "node",
		devtool: "source-map",
		entry: "./src/server/server.js",
		output: {
			path: path.join(__dirname, "build"),
			filename: "server.js"
		},
		resolve: {
			alias: {
				shared: path.join(__dirname, "src", "shared")
			}
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: "babel-loader",
					exclude: /node_modules/,
					options: {
						sourceMap: true
					}
				},
				{
					test: /\.js$/,
					loader: "eslint-loader",
					exclude: /node_modules/,
					options: {
						sourceMap: true
					}
				}
			]
		},
		externals: [ignoreNodeModules],
		plugins: plugins

	};

}

module.exports.create = config;