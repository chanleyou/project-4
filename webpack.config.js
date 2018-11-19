const webpack = require('webpack');

module.exports = {
	target: 'web',
	mode: 'development',
	entry: [
		'webpack-hot-middleware/client',
		'./src/index.tsx'
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/, 
				loader: "awesome-typescript-loader" 
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.scss$/,
				use: [
					"style-loader", // creates style nodes from JS strings
					"css-loader", // translates CSS into CommonJS
					"sass-loader" // compiles Sass to CSS, using Node Sass by default
				]
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.png|.jpg$/,
				loader: 'file-loader'
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
	},
	output: {
		path: `${__dirname}/dist`,
		publicPath: '/',
		filename: 'bundle.js'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
	devtool: 'source-map',
	devServer: {
		contentBase: './client',
		hot: true
	},
	// externals: {
	// 	"react": "React",
	// 	"react-dom": "ReactDOM"
	// }
};