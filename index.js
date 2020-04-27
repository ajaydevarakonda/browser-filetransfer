const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const usernameGenerator = require("random-username-generator");

const ip = process.env.IP || "0.0.0.0";
const port = process.env.PORT || "3000";
var usernameMap = {};

const checkValidHash = hash => hash.length && (/^[A-Za-z0-9]{64,}$/.test(hash));

/**
 * Returns an array of usernames of all users in the room;
 * @param {String} room     Room name
 */
function getUsersInRoom(room) {
    if (!room) return []; // prevent issues with Array.<Methods>

    var clients_in_the_room = io.sockets.adapter.rooms[room];
    if (!clients_in_the_room) return [];

    const socketIds = Object.keys(clients_in_the_room.sockets);
    const usernames = socketIds.map(sid => usernameMap[sid]["username"]);
    return usernames;
}

function joinRoom(roomHash, socket) {
    const isValidHash = checkValidHash(roomHash);
    if (!isValidHash) {
        return false;
    } else {
        socket.join(roomHash);
        if (![socket.id] in usernameMap) return false;
        usernameMap[socket.id]["room"] = roomHash;
        return true;
    }
}

function sendMessageToRoom(roomHash, message) {
    return io.in(roomHash).emit('user-message', JSON.stringify(message));
}

io.on("connection", (socket) => {
    // create a fun username
    const newUsername = usernameGenerator.generate();
    socket.username = newUsername;
    usernameMap[socket.id] = {}; // it must be an object first to set a property to it.
    usernameMap[socket.id]["username"] = newUsername;

    socket.on("join", async function (hash) {
        const hasJoinedSuccessfully = joinRoom(hash, socket);

        if (hasJoinedSuccessfully) {
            const usersList = getUsersInRoom(hash)
            socket.emit('join-ack', JSON.stringify({
                room: hash,
                username: socket.username,
                users: usersList,
                numberOfUsers: usersList.length,
            }));
            socket.currentRoomName = hash;
            io.in(hash).emit('system-message', `'${usernameMap[socket.id]["username"]}' has joined the room`);
            return io.in(hash).emit('user-list-update', JSON.stringify({ users: usersList }));
        } else {
            return socket.emit('join-fail');
        }
    });

    socket.on('user-message', function (jsonData) {
        jsonData = JSON.parse(jsonData);
        const { room, message } = jsonData;
        // check if the message has some message.
        if (!message || !message.length || !room) return false;
        if (!checkValidHash(room)) return false;
        // check if the user is actually in that room
        const socketsRooms = Object.keys(socket.rooms) || [];
        if (socketsRooms.indexOf(room) < 0) return false;

        const payload = {
            username: socket.username,
            message,
            timestamp: new Date().toString(),
        };
        return sendMessageToRoom(room, payload);
    });

    socket.on('disconnect', () => {
        // if disconnected its socket.rooms will be empty, we'll have to record which room
        // it is(was) in.
        if (!usernameMap[socket.id] || !usernameMap[socket.id]["room"])
            return false;

        const hash = usernameMap[socket.id]["room"];
        const usersList = getUsersInRoom(hash);
        if (!usersList || !usersList.length)
            return false;

        io.in(hash).emit('system-message', `'${usernameMap[socket.id]["username"]}' has left the room`);
        io.in(hash).emit('user-list-update', JSON.stringify({ users: usersList }));
        delete usernameMap[socket.id];
    });
});

server.listen(port, ip, function () {
    console.log(`Running application at https://${process.env.IP}:${process.env.port}`);
});