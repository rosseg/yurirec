const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
	mode: 'production',
	plugins: [      
		new webpack.DefinePlugin({
			__WEBPACK_DIRECTORY: JSON.stringify("/node_modules"),
            __WORKING_DIRECTORY: JSON.stringify("./"),
		}),
		new CopyPlugin({
      		patterns: [
        		{ 
					from: "assets/covers", 
					to: "assets/covers" 
				},
        	]}),
	],
	optimization: {
	  minimizer: [
		new TerserPlugin({
		  terserOptions: {
			keep_classnames: true
		  },
		}),
	  ],
	},
});