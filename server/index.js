const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { bootstrapSocketIo } = require("./socketio-bootstrap");

const ip = process.env.IP || "0.0.0.0";
const port = process.env.PORT || "3000";

app.use(express.static('static'));

bootstrapSocketIo(io);

server.listen(port, ip, function () {
    console.log(`Running application at https://${process.env.IP}:${process.env.port}`);
});