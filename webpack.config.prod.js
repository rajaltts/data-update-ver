"use strict";

const path = require("path");
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports =  {
    
    mode: 'production',
    target: 'web',
    stats: 'errors-warnings',
    optimization: {
        minimize: true // set to false to have a readable bundle.js file
    },
    // The application entry point
    entry:{
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    // Where to compile the bundle
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    // Supported file loaders
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { presets: ["@babel/env"] },
            },
        {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
        },
        {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        },
        {
            test: /\.(wasm)$/,
            loader: "file-loader",
            type: "javascript/auto"
        }
        ]
    },

    devtool: false,  
    // File extensions to support resolving
    resolve: {
        extensions: ['*','.ts', '.tsx', '.js', '.jsx'],
        fallback : {
            fs: false,
            crypto: false,
            path: false,
            stream: false,
            assert: false,
            buffer: false
        }
    },
    plugins: [
        // to clean dist before 
        new CleanPlugin.CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['*.js','*.html']
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: true,
            template: path.resolve(__dirname, 'public', 'index.html')}),
    ]
    
};