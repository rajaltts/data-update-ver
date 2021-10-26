"use strict";

const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'web',
    stats: 'errors-warnings',
    // The application entry point
    entry: './src/index.tsx',
    // Where to compile the bundle
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    // Supported file loaders
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
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
    devServer: {
        open: true,
        host: 'localhost',
        port: 3000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        })
    ]
};