import gulp from "gulp";
import webpack from "webpack";
import chalk from "chalk";
import rimraf from "rimraf";
import {create as serverConfig} from "./webpack.server";
import {create as clientConfig} from "./webpack.client";

const $ = require("gulp-load-plugins")();

// ---- public tasks ----

// --- clean everything in build
gulp.task("clean:server", cb => rimraf("./build", cb));

// --- clean everything in client public/build
gulp.task("clean:client", cb => rimraf("./public/build", cb));

// --- clean everything in server and client
gulp.task("clean", gulp.parallel("clean:server", "clean:client"));

// --- dev and prod server tasks
gulp.task("dev:server", gulp.series("clean:server", devServerBuild));
gulp.task("prod:server", gulp.series("clean:server", prodServerBuild));

// --- watch reload server build
gulp.task("dev", 
gulp.series("clean", 
devServerBuild, 
gulp.parallel(devServerWatch,devServerReload)));

// --- production build gulp tasks
gulp.task("prod:client", gulp.series("clean:client", prodClientBuild));

// --- gulp prod server buuild
gulp.task("prod", 
gulp.series("clean", 
gulp.parallel(prodServerBuild, prodClientBuild)));

// --- private client tasks
function prodClientBuild(next){
	const compiler = webpack(clientConfig(false));
	compiler.run((err, stats) =>{
		outputWebpack("Prod:Client", err, stats);
		next();
	});
}

// --- private server tasks
const devServerWebpack = webpack(serverConfig(true));
function devServerBuild(next){
	devServerWebpack.run((err, stats) => {
		outputWebpack("Dev:Server", err, stats);
		next();
	});
}

// --- private prod server task
function prodServerBuild(next){
	const prodServerWebpack = webpack(serverConfig(false));
	prodServerWebpack.run((err, stats) => {
		outputWebpack("Prod:Server", err, stats);
		next();
	});
}

// --- server watch ---
function devServerWatch(){
	devServerWebpack.watch({}, (err, stats) => {
		outputWebpack("Dev:Server", err, stats);
	});
}

// --- reload server ---

function devServerReload(){

	return $.nodemon({
		script: "./build/server.js",
		watch: "./build",
		env: {
			"NODE_ENV": "development",
			"USE_WEBPACK": "true"
		},
	});

}


// --- helpers ----
function outputWebpack(label, err, stats){
	if(err){
		throw new Error(err);
	}
	if(stats.hasErrors()){
		$.util.log(stats.toString({colors: true}));
	}else{
		const time = stats.endTime - stats.startTime;
		$.util.log(chalk.bgGreen(`Built ${label} in ${time} ms`));
	}
	$.util.log(stats.toString({colors: true}));
}