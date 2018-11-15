const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const express = require('express');
const app = express();

// Express will serve the static index.html from the ./src directory.
// index.html will load bundle.js, which is the compiled script file by webpack
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

// Note that you are free to write your express server logic here on. As long as the view that you render loads bundle.js, it will have access to React's code (and in turn, React will have access to your view).
app.get('/hello', (req, res) => {
    res.send('Hello back!');
});

const server = app.listen(3000, () => {console.log('Listening')});

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