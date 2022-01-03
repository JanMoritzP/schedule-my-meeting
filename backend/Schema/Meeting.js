const mongoose = require('mongoose')
const crypto = require('crypto')

const MeetingSchema = mongoose.Schema({
    sessionActivity: {type: Date, expires: 1209600, default: Date.now}, //Two weeks expiration
    participants: [String],
    participantAmount: {type: Number, required: true},
    timeData: [String],
    meetingLength: String,
    hash: String,
    salt: String,
    name: {type: String, unique: true, required: true},
    startingDate: {type: String, required: true},
    endingDate: {type: String, required: true}
})

MeetingSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(32)
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}

MeetingSchema.methods.validatePassword = function(password) {
    tmpHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.hash == tmpHash
}

const Meeting = module.exports = mongoose.model('meeting', MeetingSchema, 'scheduleMeeting')