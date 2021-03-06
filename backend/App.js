const express = require('express')
const app = express()
const http = require('http').Server(app)

app.use(require('./routes/checkUniqueMeeting'))
app.use(require('./routes/createNewMeeting'))
app.use(require('./routes/joinMeeting'))
app.use(require('./routes/addNewUser'))
app.use(require('./routes/checkNewUser'))
app.use(require('./routes/getTimeData'))
app.use(require('./routes/saveTimeData'))
app.use(require('./routes/getBestTime'))
app.use(require('./routes/deleteMeeting'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', 'https://www.schedule-my-meeting.com')
    next();
})


const port = 3001

http.listen(port, () => console.log("Listening on port 3001"))
