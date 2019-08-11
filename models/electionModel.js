const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qualifications: {
        type: [String],
        default: []
    },
    criminalRecord: {
        type: [String],
        default: []
    },
    party: {
        type: String,
        default: "BJP"
    },
    age: Number,
    constituency: String
})

const electionSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: ''
    },
    candidates: [candidateSchema],
    voterRegistrationStartTime: {
        type: Date,
        required: true
    },
    voterRegistrationStopTime: {
        type: Date,
        required: true
    },
    pollingStartTime: {
        type: Date,
        required: true
    },
    pollingEndTime: {
        type: Date,
        required: true
    },
    authenticationAddress: {
        type: String,
        required: true
    },
    votingAddress: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});

const election = mongoose.model('Election', electionSchema);

electionModel = {
    fetchElections: () => {
        return election.find({}).lean().exec();
    },

    createElection: (data, cb) => {
        const newElection = new election(data);
        newElection.save(function(err) {
            if (err) {
                return cb(false);
            }
            return cb(true);
        })
    },

    updateElection: (payload) => {
        const _id = payload._id;
        let update = {};

        if (payload.addCandidate) {
            update.$addToSet = {
                candidates: payload.addCandidate
            }
        }
        return election.findByIdAndUpdate(_id, update, { new: true }).lean().exec();
    },

    fetchElectionById: (electionId) => {
        return election.findById(electionId).lean().exec();
    }
};

module.exports = electionModel;