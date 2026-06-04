const { sql, pool, poolConnect } = require('../db')
const csvParser = require('csv-parser')
const { Readable } = require('stream')
const { Parser } = require('json2csv')

const getProjects = async (req, res, next) => {
  try {
    await poolConnect

    const result = await pool.request().query('SELECT * FROM Projects')
    res.json(result.recordset)
  } catch (error) {
    console.error('Error fetching projects:', error)
    next(error)
  }
}

const createProject = async (req, res, next) => {
  try {
    const {
      project_code,
      project_name,
      community,
      status,
      funding_amount,
      jobs_created,
      people_supported,
      training_hours,
      start_date,
      end_date,
      description,
    } = req.body

    if (!project_code || !project_name) {
      return res.status(400).json({ message: 'project_code and project_name are required.' })
    }

    await poolConnect

    const request = pool.request()
    request.input('project_code', sql.NVarChar(100), project_code)
    request.input('project_name', sql.NVarChar(255), project_name)
    request.input('community', sql.NVarChar(255), community || null)
    request.input('status', sql.NVarChar(100), status || null)
    request.input('funding_amount', sql.Float, funding_amount !== undefined && funding_amount !== '' ? parseFloat(funding_amount) : null)
    request.input('jobs_created', sql.Int, jobs_created !== undefined && jobs_created !== '' ? parseInt(jobs_created, 10) : null)
    request.input('people_supported', sql.Int, people_supported !== undefined && people_supported !== '' ? parseInt(people_supported, 10) : null)
    request.input('training_hours', sql.Int, training_hours !== undefined && training_hours !== '' ? parseInt(training_hours, 10) : null)
    request.input('start_date', sql.Date, start_date || null)
    request.input('end_date', sql.Date, end_date || null)
    request.input('description', sql.NVarChar(sql.MAX), description || null)

    const insertQuery = `
      INSERT INTO Projects
        (project_code, project_name, community, status, funding_amount, jobs_created, people_supported, training_hours, start_date, end_date, description)
      OUTPUT INSERTED.*
      VALUES
        (@project_code, @project_name, @community, @status, @funding_amount, @jobs_created, @people_supported, @training_hours, @start_date, @end_date, @description)
    `

    const result = await request.query(insertQuery)
    const createdProject = result.recordset[0]

    res.status(201).json({ message: 'Project created successfully', project: createdProject })
  } catch (error) {
    console.error('Error creating project:', error)
    next(error)
  }
}

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const parsedId = parseInt(id, 10)

    if (!parsedId || parsedId <= 0) {
      return res.status(400).json({ message: 'A valid project ID is required.' })
    }

    const {
      project_code,
      project_name,
      community,
      status,
      funding_amount,
      jobs_created,
      people_supported,
      training_hours,
      start_date,
      end_date,
      description,
    } = req.body

    if (!project_code || !project_name) {
      return res.status(400).json({ message: 'project_code and project_name are required.' })
    }

    await poolConnect

    const request = pool.request()
    request.input('id', sql.Int, parsedId)
    request.input('project_code', sql.NVarChar(100), project_code)
    request.input('project_name', sql.NVarChar(255), project_name)
    request.input('community', sql.NVarChar(255), community || null)
    request.input('status', sql.NVarChar(100), status || null)
    request.input('funding_amount', sql.Float, funding_amount !== undefined && funding_amount !== '' ? parseFloat(funding_amount) : null)
    request.input('jobs_created', sql.Int, jobs_created !== undefined && jobs_created !== '' ? parseInt(jobs_created, 10) : null)
    request.input('people_supported', sql.Int, people_supported !== undefined && people_supported !== '' ? parseInt(people_supported, 10) : null)
    request.input('training_hours', sql.Int, training_hours !== undefined && training_hours !== '' ? parseInt(training_hours, 10) : null)
    request.input('start_date', sql.Date, start_date || null)
    request.input('end_date', sql.Date, end_date || null)
    request.input('description', sql.NVarChar(sql.MAX), description || null)

    const updateQuery = `
      UPDATE Projects
      SET project_code = @project_code,
          project_name = @project_name,
          community = @community,
          status = @status,
          funding_amount = @funding_amount,
          jobs_created = @jobs_created,
          people_supported = @people_supported,
          training_hours = @training_hours,
          start_date = @start_date,
          end_date = @end_date,
          description = @description
      OUTPUT INSERTED.*
      WHERE id = @id
    `

    const result = await request.query(updateQuery)

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Project not found.' })
    }

    res.json({ message: 'Project updated successfully', project: result.recordset[0] })
  } catch (error) {
    console.error('Error updating project:', error)
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const parsedId = parseInt(id, 10)

    if (!parsedId || parsedId <= 0) {
      return res.status(400).json({ message: 'A valid project ID is required.' })
    }

    await poolConnect

    const request = pool.request()
    request.input('id', sql.Int, parsedId)

    const result = await request.query('DELETE FROM Projects WHERE id = @id')

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: 'Project not found.' })
    }

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    next(error)
  }
}

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null
  const numeric = Number(String(value).replace(/[^0-9.-]+/g, ''))
  return Number.isFinite(numeric) ? numeric : null
}

const parseNullableDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const importProjectsCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required.' })
    }

    await poolConnect

    const rows = []
    const stream = Readable.from(req.file.buffer)

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject)
    })

    if (!rows.length) {
      return res.status(400).json({ message: 'CSV file is empty or malformed.' })
    }

    let importedCount = 0
    let skippedCount = 0

    for (const rawRow of rows) {
      const project_code = (rawRow.project_code || rawRow.projectCode || rawRow['Project Code'] || rawRow['project code'] || '').trim()
      const project_name = (rawRow.project_name || rawRow.projectName || rawRow['Project Name'] || rawRow['project name'] || '').trim()

      if (!project_code || !project_name) {
        skippedCount += 1
        continue
      }

      const community = rawRow.community || rawRow.Community || ''
      const status = rawRow.status || rawRow.Status || ''
      const funding_amount = parseNullableNumber(rawRow.funding_amount ?? rawRow.Funding ?? rawRow['Funding Amount'])
      const jobs_created = parseNullableNumber(rawRow.jobs_created ?? rawRow.JobsCreated ?? rawRow['Jobs Created'])
      const people_supported = parseNullableNumber(rawRow.people_supported ?? rawRow.PeopleSupported ?? rawRow['People Supported'])
      const training_hours = parseNullableNumber(rawRow.training_hours ?? rawRow.TrainingHours ?? rawRow['Training Hours'])
      const start_date = parseNullableDate(rawRow.start_date ?? rawRow.StartDate ?? rawRow['Start Date'])
      const end_date = parseNullableDate(rawRow.end_date ?? rawRow.EndDate ?? rawRow['End Date'])
      const description = rawRow.description || rawRow.Description || ''

      const request = pool.request()
      request.input('project_code', sql.NVarChar(100), project_code)
      request.input('project_name', sql.NVarChar(255), project_name)
      request.input('community', sql.NVarChar(255), community || null)
      request.input('status', sql.NVarChar(100), status || null)
      request.input('funding_amount', sql.Float, funding_amount)
      request.input('jobs_created', sql.Int, jobs_created)
      request.input('people_supported', sql.Int, people_supported)
      request.input('training_hours', sql.Int, training_hours)
      request.input('start_date', sql.Date, start_date)
      request.input('end_date', sql.Date, end_date)
      request.input('description', sql.NVarChar(sql.MAX), description || null)

      const insertQuery = `
        INSERT INTO Projects
          (project_code, project_name, community, status, funding_amount, jobs_created, people_supported, training_hours, start_date, end_date, description)
        VALUES
          (@project_code, @project_name, @community, @status, @funding_amount, @jobs_created, @people_supported, @training_hours, @start_date, @end_date, @description)
      `

      await request.query(insertQuery)
      importedCount += 1
    }

    const message = `Imported ${importedCount} row${importedCount === 1 ? '' : 's'}.` +
      (skippedCount ? ` Skipped ${skippedCount} invalid row${skippedCount === 1 ? '' : 's'}.` : '')

    res.json({ message, importedCount, skippedCount })
  } catch (error) {
    console.error('Error importing CSV:', error)
    next(error)
  }
}

const exportProjectsCsv = async (req, res, next) => {
  try {
    await poolConnect

    const result = await pool.request().query('SELECT * FROM Projects')
    const rows = result.recordset

    if (!rows.length) {
      res.setHeader('Content-Type', 'text/csv')
      res.attachment('projects-export.csv')
      return res.send('')
    }

    const fields = [
      'id',
      'project_code',
      'project_name',
      'community',
      'status',
      'funding_amount',
      'jobs_created',
      'people_supported',
      'training_hours',
      'start_date',
      'end_date',
      'description',
    ]

    const parser = new Parser({ fields })
    const csv = parser.parse(rows)

    res.setHeader('Content-Type', 'text/csv')
    res.attachment('projects-export.csv')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    next(error)
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject, importProjectsCsv, exportProjectsCsv }
