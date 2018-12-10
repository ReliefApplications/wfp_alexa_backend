const io = require('socket.io')();

io.on('connection', (client) => {
        console.log('connected');
        client.on('newDashboard', (userId, country, data) => {
                client.emit('dashboardModified');
                client.broadcast.emit('dashboardChanges', userId, country, data);
                client.disconnect(true);
        });
        client.on('focusDashboard', (userId, column, country, data) => {
                client.emit('dashboardModified');
                client.broadcast.emit('dashboardFocus', userId, column, country, data);
                client.disconnect(true);
        });
        client.on('error', function (err) {
                console.error('received error from client:', client.id);
                console.error(err);
        });
        client.on('disconnect', function () {
                console.log('Client disconnected.');
        });
});

const port = 12112;
io.listen(port);
console.log('listening on port ', port);
