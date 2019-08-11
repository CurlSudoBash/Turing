const mongoose = require('mongoose');
const Schema = mongoose.Schema;

voterSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    id: String,
    epicNumber: String,
    name: String,
    gender: String,
    age: String,
    fatherName: String,
    state: String,
    district: String,
    assemblyConstituencyName: String,
    assemblyConstituencyNumber: String,
    parliamentaryConstituencyName: String,
    pollingStationName: String,
    pollingStationLocation: String,
    partNumber: String,
    partName: String,
    serialNumber: String,
    lastUpdatedOn: String
});

const voter = mongoose.model('Voter', voterSchema);

voterModel = {
    createVoter: (details, cb) => {
        const newVoter = new voter(details);
        newVoter.save(function(err) {
            if (err) {
                return cb(false);
            }
            return cb(true);
        })
    },

    fetchVoter: (id) => {
        return voter.findById(id).lean().exec(); 
    }
};

module.exports = voterModel;
