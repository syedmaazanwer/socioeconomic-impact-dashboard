const express = require('express')
const { getHealth } = require('../controllers/healthController')
const projectsRouter = require('./projects')

const router = express.Router()

router.get('/health', getHealth)
router.use('/projects', projectsRouter)

module.exports = router
