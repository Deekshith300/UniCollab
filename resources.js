const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { isModerator } = require('../middleware/auth');

// Resources CRUD
router.post('/', auth, resourceController.createResource);
router.get('/', auth, resourceController.getResources);
router.get('/:id', auth, resourceController.getResourceById);
router.put('/:id', auth, resourceController.updateResource);
router.delete('/:id', auth, resourceController.deleteResource);

// Upload resource file
router.post('/upload', auth, upload.single('file'), resourceController.uploadResourceFile);

// Report resource
router.post('/:id/report', auth, resourceController.reportResource);

// Moderator endpoints
router.get('/reported', isModerator, resourceController.getReportedResources);
router.delete('/:id/moderate', isModerator, resourceController.moderatorDeleteResource);

module.exports = router; 