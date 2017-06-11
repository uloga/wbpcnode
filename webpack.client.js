let path = require("path");
let webpack = require("webpack");
let ExtractText  = require("extract-text-webpack-plugin");

const dirname = path.resolve("./");

// require modules as vendor
const vendor = ["jquery", "lodash"];

function config(debug){

	const devTool = debug ? "eval-source-map" : "source-map";

	// --- put all of the client plugins into a vendor file
	const plugins = [
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor", 
			filename: "vendor.js"
		})];

	const cssLoader	= {test: /\.css$/, loader: "style-loader!css-loader"};
	const sassLoader= {test: /\.scss$/, loader: "style-loader!css-loader!sass-loader"};
	const entry = ["./src/client/application.js"];

	// --- minify files
	if(!debug){

		// --- minify all javascript
		plugins.push(new webpack.optimize.UglifyJsPlugin());

		// --- minify css into one file
		plugins.push(new ExtractText("[name].css"));

		// --- rewrite loader to use extract text
		cssLoader.loader = ExtractText.extract({
			fallback: "style-loader", use: "css-loader"
		});
		sassLoader.loader = ExtractText.extract({
			fallback: "style-loader", use: "css-loader!sass-loader"
		});

	}else{
		// --- webpack middleware auto reload
		plugins.push(new webpack.HotModuleReplacementPlugin());

		//---  append hot middleware client to wpc config entry
		entry.splice(0, 0, "webpack-hot-middleware/client");
	}

	return{
		
		devtool: devTool,
		entry:{
			application: entry,
			vendor: vendor
		},
		output: {
			path: path.join(dirname, "public", "build"),
			filename: "[name].js",
			publicPath: "/build/"
		},
		resolve: {
			alias:{
				shared: path.join(dirname, "src", "shared")
			}
		},
		module: {
			loaders:[
				{test: /\.js$/, loader: "babel-loader", exclude: /node_modules/},
				{test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/},
				{ test: /\.(png|jpg|jpeg|git|woff|ttf|svg|woff2|eot)/, loader: "url-loader?limit=1024"},
				cssLoader,
				sassLoader
			]
		},
		plugins: plugins
	};
	
}

module.exports.create = config;