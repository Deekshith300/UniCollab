const Job = require('../models/Job');

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('poster', 'name username');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job by ID
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('poster', 'name username');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create job
exports.createJob = async (req, res) => {
  try {
    const { title, link, referral } = req.body;
    const job = new Job({
      title,
      link,
      referral,
      poster: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create job' });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    const { title, link, referral } = req.body;
    job.title = title || job.title;
    job.link = link || job.link;
    job.referral = referral || job.referral;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update job' });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await job.remove();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete job' });
  }
}; 