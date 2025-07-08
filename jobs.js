const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth } = require('../middleware/auth');

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJob);
router.post('/', auth, jobController.createJob);
router.put('/:id', auth, jobController.updateJob);
router.delete('/:id', auth, jobController.deleteJob);

module.exports = router; 