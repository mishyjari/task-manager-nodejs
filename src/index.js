const app = require('./app.js');
const port = process.env.PORT;

// Open server
app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});

