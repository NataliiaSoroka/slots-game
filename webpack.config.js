'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');

module.exports = {
    // Entry point : first executed file
    // This may be an array. It will result in many output files.
    entry: './src/main.ts',

    // What files webpack will manage
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },

    // Make errors mor clear
    devtool: 'inline-source-map',

    // Configure output folder and file
    output: {
        path: distDir,
        filename: 'main_bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },

    devServer: {
        contentBase: ['./dist', './src']
    },


    plugins: [
        new CopyWebpackPlugin([{
            from: './src/assets',
            to: 'assets'
          }]),
        new ImageminPlugin({ 
            disable: process.env.NODE_ENV !== 'production',
            test: /\.(jpe?g|png|gif|svg)$/i ,
            optipng: {
                optimizationLevel: 9
              }
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
};