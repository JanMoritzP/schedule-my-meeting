const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
router.use(bodyParser)
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', '*')
    next();
})

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/checkUniqueMeeting', (req, res) => {
    console.log(req.body)
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(meeting) res.status(409).send({messsage: 'This name is not unique'})
        else res.status(200).send({message: 'This name is unique, you can use it'})
    })
})

module.exports = router
