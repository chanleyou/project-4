const path = require('path');
const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;

if (PORT === 3000) {

	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('./webpack.dev');
	const compiler = webpack(webpackConfig);
	
	console.log('Local development.');
	
	app.use(express.static('./src'));

	// Express will use webpack to compile the JS files
	app.use(webpackDevMiddleware(compiler, {
			noInfo: true,
			stats: {
					colors: true
			}
	}));
	
	// Furthermore, express will listen for file changes and trigger webpack's compiler if any file changes, then push the updated script to any client. This allows us to see changes live in our browser, very useful for development work!
	app.use(webpackHotMiddleware(compiler));
	
} else {
	console.log('Production.');

	app.use(express.static('./dist'));
	
	app.get('*', (req, res) => {
		res.sendFile(path.resolve('./src/', 'index.html'));
	});
}

const server = app.listen(PORT, () => {console.log('Listening on:', PORT)});

// Captures ctrl-C exit
process.on('SIGINT', () => {
    console.log('Server shutting down');

    // Note: Because of the Webpack Hot Module Reloading middleware, the server will always have at least 1 connection (to that middleware) and so it will not shutdown via the following method gracefully. The delayed forced shutdown will always be called here.
    server.close(() => {
        console.log('Server shutdown');
        process.exit(0);
    });

    setTimeout(() => {
        let exitCode = 0;
        server.getConnections((err, count) => {
            // If there is an error, or there is more than 1 connection (i.e. more than the webpack connection), exit with a non-zero error code so that the server admin can see that an improper exit was carried out.
            if (err || count > 1) {
                exitCode = 1
            };
            console.log('Server delayed shutdown');
            process.exit(exitCode);
        })  
    }, 500);
})