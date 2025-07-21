const express = require('express')
const https = require("https")
const path = require("path")
const app = express()
const cors = require('cors')
const fs = require('fs')

const httpsServer = https.createServer(
    {
        key: fs.readFileSync(path.join(__dirname, 
            "cert", "key.pem")),
        cert: fs.readFileSync(path.join(__dirname,
            "cert", "cert.pem")),
    },
    app
)

app.use(express.json({limit: '50mb'}))
app.use(cors())

const db = require('./models')



//Routes
const usersRouter = require('./routes/users')
app.use("/user", usersRouter)

const roomsRouter = require('./routes/rooms')
app.use("/room", roomsRouter)

const bookingRouter = require('./routes/bookings')
app.use("/booking", bookingRouter)

const ratingRouter = require('./routes/rating')
app.use("/rating", ratingRouter)

const chatRouter = require('./routes/chats')
app.use("/chat", chatRouter)

const messageRouter = require('./routes/messages')
app.use("/message", messageRouter)



db.sequelize.sync({alter: true}).then(async () => {
    try {
        const { user, room, booking } = require('./models'); // Import your Sequelize model

        var rawData = fs.readFileSync('../user_data.json', 'utf-8');
        var jsonData = JSON.parse(rawData);

        // Insert the data into the 'User' model
        user.bulkCreate(jsonData)
        .then(() => {
            console.log('users imported successfully.');
        })
        .catch((error) => {
          
            console.error('Error importing data:', error);
        });

        rawData = fs.readFileSync('../room_data.json', 'utf-8');
        jsonData = JSON.parse(rawData);

        // Insert the data into the 'room' model
        room.bulkCreate(jsonData)
        .then(() => {
            console.log('rooms imported successfully.');
        })
        .catch((error) => {
            console.error('Error importing data:', error);
        });

        rawData = fs.readFileSync('../bookings_data.json', 'utf-8');
        jsonData = JSON.parse(rawData);

        // Insert the data into the 'booking' model
        booking.bulkCreate(jsonData)
        .then(() => {
            console.log('bookings imported successfully.');
        })
        .catch((error) => {
            console.error('Error importing data:', error);
        });

    } catch(error) { console.error('Error importing dummy data:', error )}

    app.listen(3001, () => {
        console.log('listening on http://localhost:3001')
    })
})