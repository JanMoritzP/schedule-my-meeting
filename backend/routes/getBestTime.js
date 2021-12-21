const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', '*')
    next();
})

const time2number = time => {
    //Time can be anywhere between '0:00' = 0 and '23:45' = 97
    let hours = parseInt(time.split(':')[0])
    let minutes = parseInt(time.split(':')[1])
    return hours*4 + minutes / 15
}

const number2time = number => {
    let hours = number/4 | 0
    let minutes = pad2((number % 4) * 15)
    return hours + ':' + minutes
}

const pad2 = string => {
    if(string < 10) {
        return "0" + parseInt(string)
    }
    else return string
}

function timeSlot(time, date, priority, user) {
    this.time = time
    this.date = date
    this.priority = priority
    this.user.push(user)
}

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/getBestTime', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(409).send({message: `There is no meeting named ${req.body.name}`})
        else {
            if(!meeting.validatePassword(req.body.password)) res.status(403).send({message: 'The provided password is incorrect'})
            else {
                //Calc the best meeting time here
                //Go through the time data and fill a vector and search through it. Then validate times and remove if not enough participants
                var data = []
                var timeData = meeting.timeData
                var time
                var dateIndex
                var priority
                var userIndex
                for(let i = 0; i < meeting.timeData.length; i++) {
                    time = timeData[i].split(';')[0]
                    dateIndex = timeData[i].split(';')[1]
                    priority = timeData[i].split(';')[2]
                    userIndex = timeData[i].split(';')[3]
                    if(i === 0) {
                        data.push(new timeSlot(time, date, priority, userIndex))
                    }   
                    else {
                        let idx = data.findIndex((element) => {
                            return element.time === time && element.data === date
                        })
                        if(idx === -1) {
                            data.push(new timeSlot(time, date, priority, userIndex))
                        }
                        else {
                            data[idx].user.push(userIndex)
                        }
                    }
                }
                //Vector now filled. Now it needs to be filtered
                var bestMeetings = data.filter((element) => {
                    return element.user.length === meeting.participantAmount
                })

                res.status(200).send({
                    data: bestMeetings
                })                
            }
        }
    })
})

module.exports = router
