  
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require("fs");
var isDevelopment = true;

module.exports = {
	entry: {
	  Index: '/src/index.ts',
	},
	module: {
        rules: [
			{
				test: /\.(tsx|ts)$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(txt)$/,
				use: 'raw-loader'
			},
			{ 
				test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
				type: 'asset/resource',
			},    
			{
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    minimize: {
						caseSensitive: true,
						collapseWhitespace : false,
						removeComments: true
					}
                }
            },
			{
				test: /\.s(a|c)ss|css$/,
				exclude: /\.module.(s(a|c)ss)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					 },
					{ loader: "css-loader" , options: {
						modules: false,         
						importLoaders: 1,
						sourceMap: true}},
					{ loader: "sass-loader" , options: {
						sassOptions: {
							silenceDeprecations: ['legacy-js-api', 'import']
						},
						sourceMap: true}}
				],
			},
        ],
    },
	resolve: {
	  extensions: ['.ts', '.tsx',  '.js', '.scss'],
	  alias: {
		server: path.resolve(__dirname, "../Server/Base/")
	  }
	},
	output: {
	  path: path.resolve(__dirname, 'dist'),
	  filename: '[name].js'
	},
	plugins: [
        new webpack.SourceMapDevToolPlugin({
          moduleFilenameTemplate : "[absolute-resource-path]"
        }),
        
        new HtmlWebPackPlugin({
          template: "./index.html",
          filename: "./index.html",
          inject: true,
         // minify:{
         //   removeRedundantAttributes: false, // do not remove type="text"
         // },
		      baseUrl: process.env.NODE_ENV == 'development'? '/yurirec':'/yurirec',
          chunks: ['Index']
        }),

        new MiniCssExtractPlugin({
          filename: isDevelopment ? '[name].css' : '[name].[hash].css',
          chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
        })
    ]
};