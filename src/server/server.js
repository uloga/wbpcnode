import "source-map-support/register";
import express from "express";
import http from "http";
import socket from "socket.io";

import chalk from "chalk";

// -- setup
const isDev = process.env.NODE_ENV !== "production";

const app = express();
const server = new http.Server(app);
const io = socket(server);

// -- client webpack

if(process.env.USE_WEBPACK === "true"){

	let webpackMiddleWare = require("webpack-dev-middleware");
	let webpack = require("webpack");
	let clientConfig = require("../../webpack.client").create;
	let hotMiddleware= require("webpack-hot-middleware");

	const compiler = webpack(clientConfig(true));

	app.use(webpackMiddleWare(compiler, {
		publicPath: "/build/",
		stats: {
			colors: true,
			chunks: false,
			assets: false,
			modules: false,
			hash: false,
			version: false
		}
	}));

	// --- use hot middleware to reload
	app.use(hotMiddleware(compiler));
	console.log(chalk.bgRed("USING WEBPACK MIDDLEWARE !! THIS IS FOR DEVELOPMENT ONLY !!"));
	
}

// -- express configuration
app.set("view engine", "jade");
app.use(express.static("public"));

// setup the routes

// --- single page route
const useExternalStyles = !isDev;
app.get("/", (reg, res) => {
	res.render("index", {
		useExternalStyles
	});
});

// --- modules

// --- socket

io.on("connection", socket =>{
	console.log(`Got connection from ${socket.request.connection.remoteAddress}`);
});

// --- startup
const port = process.env.PORT || 3000;
function start(){
	server.listen(port, () =>{
		console.log(`Started http server on ${port}`);	
	});
}
start();