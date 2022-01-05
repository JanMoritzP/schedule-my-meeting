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

const Meeting = require('../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/data/createNewMeeting', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: "There has been an error accessing the database"})
        else if (meeting) res.status(409).send({message: "You have to provide a unique name for a meeting"})
        else {
            if(req.body.meetingLength.split(':')[1]%15 !== 0 || req.body.meetingLength.split(':') < 0) return res.status(409).send({message: 'The provided meeting length is invalid'})
            let newMeeting = new Meeting();
            newMeeting.name = req.body.name;
            newMeeting.startingDate = req.body.startingDate;
            newMeeting.endingDate = req.body.endingDate;
            newMeeting.meetingLength = req.body.meetingLength;
            newMeeting.participantAmount = req.body.participantAmount;
            newMeeting.setPassword(req.body.password);
            newMeeting.save((err, meeting) => {
                if(err) res.status(500).send({message: "There has been an error accessing the database"})
                else {
                    res.status(200).send({message: "New Meeting created"})
                }
            })
        }
    })
})

module.exports = router
