var express = require('express');
var router = express.Router();
const userModel = require('../models/userModel');
const electionModel = require('../models/electionModel');
const voterModel = require('../models/voterModel');
const blockchain = require('../blockchain/provider');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.login) {
    return res.redirect('/login');
  }
  return res.render('ra/dashboard');
});

router.get('/electiongen', function(req, res, next) {
  return res.render('create-election');
});

router.post('/elections', async function(req, res, next) {
  const votingAddress = await blockchain.deployVotingContract();
  const authenticationAddress = await blockchain.deployAuthenticationContract({ votingAddress });
  const payload = req.body;
  Object.assign(payload, { votingAddress, authenticationAddress });
  electionModel.createElection(payload, (status) => {
    if (!status) {
      return res.redirect('/electiongen');
    }
    return res.redirect('/');
  });
});

// API
router.get('/elections/:electionId', (req, res, next) => {
  const electionId = req.params.electionId;
  electionModel.fetchElectionById(electionId).then((election) => {
    return res.json({ election });
  }).catch((err) => {
    return res.json({ err });
  })
});


router.post('/elections/:electionId/candidates', async (req, res, next) => {
  const { candidate, constituency } = req.body;
  const _id = req.params.electionId;
  electionModel.fetchElectionById(_id).then(async (election) => {
    const votingAddress = election.votingAddress;
    const candidateRegistrationStatus = await blockchain.registerCandidate({ candidate, constituency, votingAddress });
    electionModel.updateElection({ _id: electionId, addCandidate: candidate }).then(election => {
      return res.json({
        success: true,
        update: true,
        election
      });
    }).catch(err => {
      return res.json({
        success: false,
        update: false
      })
    })
    if (!candidateRegistrationStatus) {
      return res.redirect('/');
    } else {
      res.render('elections');
    }
  })
});

router.post('/voters', function (req, res, next) {
  const payload = req.body;
  payload._id = payload.epicNumber;
  voterModel.createVoter(payload, function(status) {
    if (!status) {
      return res.json({
        success: false
      });
    }
    return res.json({
      success: true
    })
  });
});

router.post('')

router.get('/voters/:voterId', function(req, res, next) {
  voterModel.fetchVoter(req.params.voterId).then((voter) => {
    if (!voter) {
      return res.json({
        success: false
      });
    }
    return res.json({
      success: false,
      voter
    })
  })
});

router.post('/vote/:electionId', async (req, res, next) => {
  const { candidate, voter } = req.body;
  const _id = req.params.electionId;
  electionModel.fetchElectionById(_id).then(async (election) => {
    const votingAddress = election.votingAddress;
    const votingStatus = await blockchain.voteForCandidate({ candidate, voter, votingAddress });
    if (!votingStatus) {
      return res.redirect('/');
    } else {
      res.render('elections');
    }
  });
});

router.get('/elections', function(req, res, next) {
  electionModel.fetchElections().then((elections) => {
    return res.render('elections', elections);
  }).catch(err => {
    return res.redirect('/');
  });
});

// API
router.get('/api/elections', function(req, res, next) {
  electionModel.fetchElections().then((elections) => {
    return res.json({
      success: true,
      elections
    });
  }).catch((err) => {
    return res.json({
      success: false
    })
  })
});

router.get('/login', function(req, res, next) {
  return res.render('auth/signin');
});

router.get('/signup', function(req, res, next) {
  return res.render('auth/signup');
});

router.post('/login', function(req, res, next) {
  if (req.session.login) {
    return res.redirect('/');
  }
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const _id = req.body.username;
  const password = req.body.password;

  if (!re.test(String(_id).toLowerCase())) {
    //return res.render('auth/signin');
  }
  userModel.fetchUser({ _id, password }).then((user) => {
    if (!user) {
      return res.redirect('/login');
    } else {
      req.session.login = true;
      res.redirect('/');
    }
  }).catch((err) => {
    console.log("Error during login");
    return res.redirect('/login');
  })
});

router.post('/signup', function(req, res, next) {
  if (req.session.login) {
    return res.redirect('/');
  }

  const _id = req.body.username;
  const password = req.body.password;

  userModel.saveUser({ _id, password }, (status) => {
    if (!status) {
      return res.redirect('/signup');
    }
    return res.redirect('/');
  });
});

module.exports = router;
