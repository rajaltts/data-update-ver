"use strict";

const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'web',
    node: {
        fs: 'empty'  // need to us plotly
    },
    
    // The application entry point
    entry:{
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    // Where to compile the bundle
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist'
    },
    // Supported file loaders
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
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
            loader: 'file-loader',
            type: 'javascript/auto',
        }
        ]
    },
   
    // Set debugging source maps to be "inline" for
    // simplicity and ease of use
    devtool: "inline-source-map",  //  need in tsconfig "sourceMap": true 
    // File extensions to support resolving
    resolve: {
        extensions: ['*','.ts', '.tsx', '.js']
    },
    devServer: {
        contentBase: path.join(__dirname, ""),
        port: 3000
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]

};