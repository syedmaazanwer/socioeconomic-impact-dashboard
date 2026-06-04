const express = require('express')
const multer = require('multer')
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  importProjectsCsv,
  exportProjectsCsv,
} = require('../controllers/projectsController')

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.get('/', getProjects)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)
router.post('/import-csv', upload.single('file'), importProjectsCsv)
router.get('/export-csv', exportProjectsCsv)

module.exports = router
