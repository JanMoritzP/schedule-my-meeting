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

const prio2number = prio => {
    if(prio === "perfect") return 2
    if(prio === "works") return 1
    if(prio === "ratherNot") return 0
    console.log("Bad prio, please check" + prio)
}

function timeSlot(time, date, priority) {
    this.time = time
    this.date = date
    this.priority = priority
    this.users = 1
}

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/data/getBestTime', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(409).send({message: `There is no meeting named ${req.body.name}`})
        else {
            if(req.body.password === "" || req.body.password === undefined) res.status(403).send({message: "You have to provide a password"})
            else if(!meeting.validatePassword(req.body.password)) res.status(403).send({message: 'The entered password is incorrect'})
            else {
                //Calc the best meeting time here
                //Go through the time data and fill a vector and search through it. Then validate times and remove if not enough participants
                var data = []
                var timeData = meeting.timeData
                var time
                var date
                var priority
                for(let i = 0; i < timeData.length; i++) {
                    time = timeData[i].split(';')[0]
                    date = timeData[i].split(';')[1]
                    priority = prio2number(timeData[i].split(';')[2])
                    if(i === 0) {
                        data.push(new timeSlot(time, date, priority))
                    }   
                    else {
                        let idx = data.findIndex((element) => {
                            return element.time === time && element.date === date
                        })
                        if(idx === -1) {
                            data.push(new timeSlot(time, date, priority))
                        }
                        else {
                            data[idx].users = data[idx].users + 1
                            data[idx].priority = data[idx].priority + priority
                        }
                    }
                }
                //First sort data by date
                data.sort((date1, date2) => { //Negative value if first < second
                    if(date1.date < date2.date) return -1
                    else if(date1.date === date2.date) return 0
                    else return 1
                })

                //Before i can check if everyone is available, i first check if the times are long enough for the meeting length
                var timedMeetings = []
                if(time2number(meeting.meetingLength) !== 1) {
                    for(let i = 0; i < data.length; i++) {
                        //Look ahead meetingLength and if true, take everything until it breaks, if not, go to the failing index - 1 [because of incrementation] and look from there
                        //How to check: Make times to numbers and check if number is exactly one bigger and if the date is still the same
                        var checked = true
                        for(let k = 0; k < time2number(meeting.meetingLength) - 1 && i + k < data.length - 1; k++) {
                            if(!((time2number(data[i + k].time) === (time2number(data[i + k + 1].time) - 1))  //Check if time is correct and the date is the same
                            && (data[i + k].date === data[i + k + 1].date))) {
                                checked = false
                                i = i + k
                                break
                            }
                        }
                        if(i === data.length - 1) break
                        if(checked) { //Add stuff and look ahead
                            timedMeetings.push(data[i])
                            while(i < data.length - 1 && (time2number(data[i].time) === (time2number(data[i + 1].time) - 1)) && (data[i].date === data[i + 1].date)) {
                                timedMeetings.push(data[i + 1])
                                i = i + 1
                            }
                        }
                    }
                }
                else timedMeetings = data

                //Vector now filled. Now it needs to be filtered by checking if everyone is available and for the length of the time slot                
                var allAvailable = timedMeetings.filter((element) => {
                    return element.users === meeting.participantAmount
                })

                if(allAvailable.length !== 0) {
                    res.status(200).send({
                        data: allAvailable,
                        message: "Possible"
                    })
                }
                else {
                    res.status(200).send({
                        data: timedMeetings,
                        message: "Not Possible"
                    })
                }
            }
        }
    })
})

module.exports = router
