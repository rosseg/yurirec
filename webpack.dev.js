  
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require("fs");
var isDevelopment = true;
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, 
	{
		mode: 'development',
		devtool: 'inline-source-map',
		context: __dirname,
		node: {
			__dirname : true,
			__filename: true
		},
		devServer: {
			//liveReload: true,
			hot: "only",
			historyApiFallback: true,
		// writeToDisk: true,
			port:8080,
			watchFiles:["./**/*.ts", "./**/*.html", "../Server/**/*.ts"],
			static: { 
				directory: path.resolve(__dirname, './assets'), 
				publicPath: '/assets'
			}
		},
		plugins: [        
			new webpack.DefinePlugin({
			    __WEBPACK_DIRECTORY: JSON.stringify(path.resolve(__dirname)),
			    __WORKING_DIRECTORY: JSON.stringify(path.resolve(__dirname)),
			})
			
		]
  	});
