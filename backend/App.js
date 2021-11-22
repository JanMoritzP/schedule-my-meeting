const app = require('express')()
const http = require('http').Server(app)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use(require('./routes/checkUniqueMeeting'))
app.use(require('./routes/createNewMeeting'))
app.use(require('./routes/joinMeeting'))

app.use(bodyParser.json())


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', '*')
    next();
})

const port = 3080

http.listen(port, () => console.log("Listening on port 3080"))
