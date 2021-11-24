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

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/joinMeeting', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(409).send({message: `There is no meeting named ${req.body.name}`})
        else {
            if(!meeting.validatePassword(req.body.password)) res.status(403).send({message: 'The entered password is incorrect'})
            else {
                res.status(200).send({
                    timeData: meeting.timeData,
                    participants: meeting.participants,
                    participantAmount: meeting.participantAmount
                })
            }
        }
    })
})

module.exports = router
