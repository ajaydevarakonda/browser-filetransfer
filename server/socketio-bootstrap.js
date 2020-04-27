const usernameGenerator = require("random-username-generator");
const usernameMap = {};

const checkValidHash = hash => hash.length && (/^[A-Za-z0-9]{64,}$/.test(hash));

function bootstrapSocketIo(io) {
    io.on("connection", (socket) => {
        // create a fun username
        const newUsername = usernameGenerator.generate();
        socket.username = newUsername;
        usernameMap[socket.id] = {}; // it must be an object first to set a property to it.
        usernameMap[socket.id]["username"] = newUsername;

        console.log(`${newUsername} is connected!`);

        // socket.on('message', function (jsonData) {
        //     jsonData = JSON.parse(jsonData);
        //     const { room, message } = jsonData;
        //     // check if the message has some message.
        //     if (!message || !message.length || !room) return false;
        //     if (!checkValidHash(room)) return false;
        //     // check if the user is actually in that room
        //     const socketsRooms = Object.keys(socket.rooms) || [];
        //     if (socketsRooms.indexOf(room) < 0) return false;
    
        //     const payload = {
        //         username: socket.username,
        //         message,
        //         timestamp: new Date().toString(),
        //     };
        //     return sendMessageToRoom(room, payload);
        // });
    
        socket.on('disconnect', () => {
            // if disconnected its socket.rooms will be empty, we'll have to record which room
            // it is(was) in.
            if (!usernameMap[socket.id] || !usernameMap[socket.id]["room"])
                return false;
    
            const hash = usernameMap[socket.id]["room"];
            const usersList = getUsersInRoom(hash);

            if (!usersList || !usersList.length) {
                return false;
            }
    
            delete usernameMap[socket.id];
        });
    });

    return io;
}

module.exports = { bootstrapSocketIo };