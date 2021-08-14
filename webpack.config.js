const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	// The main JS file
	entry: "./src/main.ts",
	// Where the output get saved. Import "bundle.js" in index.html.
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
		assetModuleFilename: "static/[hash][ext][query]",
	},

	// Use source maps
	devtool: "inline-source-map",

	// Use web server for development.
	devServer: {
		contentBase: "./dist",
		hot: false,
	},
	module: {
		rules: [
			// Automatically imports CSS files.
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			// Import images in a JS file as their final URL.
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
				generator: {
					filename: "static/textures/[hash][ext][query]",
				},
			},
			{
				test: /\.(glb|gltf)$/i,
				type: "asset/resource",
				generator: {
					filename: "static/models/[hash][ext][query]",
				},
			},
			// Import CSV, XML // Run `npm i -D csv-loader xml-loader`.
			// {
			// 	test: /\.(csv|tsv)$/i,
			// 	use: ["csv-loader"],
			// },
			// {
			// 	test: /\.xml$/i,
			// 	use: ["xml-loader"],
			// },
			// OBJ -> Object
			{
				test: /\.obj$/,
				loader: "webpack-obj-loader",
			},
			// Typescript
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			// GLSL -> string (for TS project)
			{
				test: /\.(glsl|vs|fs)$/,
				loader: "ts-shader-loader",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "src/index.html",
		}),
	],
};
