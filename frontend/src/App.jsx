import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './App.css'
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import SupportIcon from '@mui/icons-material/Support'
import BarChartIcon from '@mui/icons-material/BarChart'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import ReportIcon from '@mui/icons-material/Report'
import ForumIcon from '@mui/icons-material/Forum'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const drawerWidth = 260


const monthlyData = [
  { month: 'Jan', impact: 1200 },
  { month: 'Feb', impact: 2100 },
  { month: 'Mar', impact: 800 },
  { month: 'Apr', impact: 1600 },
  { month: 'May', impact: 2000 },
  { month: 'Jun', impact: 2400 },
  { month: 'Jul', impact: 1900 },
  { month: 'Aug', impact: 2200 },
  { month: 'Sep', impact: 1800 },
  { month: 'Oct', impact: 2600 },
  { month: 'Nov', impact: 3000 },
  { month: 'Dec', impact: 3200 },
]

const initialProject = {
  project_code: '',
  project_name: '',
  community: '',
  status: '',
  funding_amount: '',
  jobs_created: '',
  people_supported: '',
  training_hours: '',
  start_date: '',
  end_date: '',
  description: '',
}

const supportTickets = [
  { id: 'T-101', subject: 'Data sync error in dashboard', status: 'Open', invested: '$0', priority: 'High' },
  { id: 'T-102', subject: 'Funding report export issue', status: 'In progress', invested: '$0', priority: 'Medium' },
  { id: 'T-103', subject: 'Training metrics missing', status: 'Resolved', invested: '$0', priority: 'Low' },
]

const reports = [
  { title: 'Annual Impact Summary', subtitle: 'Comprehensive project outcomes, funding and job creation', status: 'Ready to download' },
  { title: 'Stakeholder Brief', subtitle: 'Executive summary for investors and partners', status: 'Draft' },
  { title: 'Sustainability Scorecard', subtitle: 'Environmental and social outcome metrics', status: 'Ready to download' },
]

const csvStats = [
  { label: 'Last imported', value: '2 hours ago' },
  { label: 'Records available', value: '1,248 rows' },
  { label: 'Pending export', value: '4 reports' },
]

const impactSummary = [
  { label: 'Engagement rate', value: '92%', change: '+7%' },
  { label: 'Long-term jobs', value: '4,120', change: '+12%' },
  { label: 'Fund utilisation', value: '87%', change: '+4%' },
]

export default function App() {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const handleDrawerToggle = () => setMobileOpen((s) => !s)
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState(initialProject)
  const [submittingProject, setSubmittingProject] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [csvMessage, setCsvMessage] = useState(null)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvExporting, setCsvExporting] = useState(false)
  const fileInputRef = useRef(null)

  const pages = [
    { key: 'Dashboard', icon: <DashboardIcon /> },
    { key: 'Projects', icon: <PeopleIcon /> },
    { key: 'Impact Metrics', icon: <AssessmentIcon /> },
    { key: 'CSV Import/Export', icon: <ImportExportIcon /> },
    { key: 'Support Tickets', icon: <ForumIcon /> },
    { key: 'Reports', icon: <ReportIcon /> },
  ]

  const loadProjects = async () => {
    setProjectsLoading(true)
    setProjectsError(null)

    try {
      const response = await axios.get('http://localhost:5000/api/projects')
      setProjects(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to load projects.'
      setProjectsError(message)
    } finally {
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleOpenAddDialog = () => {
    setSubmitError(null)
    setNewProject(initialProject)
    setEditingProjectId(null)
    setAddDialogOpen(true)
  }

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false)
    setSubmitError(null)
    setNewProject(initialProject)
    setEditingProjectId(null)
  }

  const getProjectId = (project) => project?.id ?? project?.ProjectID ?? null

  const handleOpenEditDialog = (project) => {
    setSubmitError(null)
    setEditingProjectId(getProjectId(project))
    setNewProject({
      project_code: project.project_code ?? project.project_code ?? '',
      project_name: project.project_name ?? project.project_name ?? '',
      community: project.community ?? project.community ?? '',
      status: project.status ?? project.Status ?? '',
      funding_amount: project.funding_amount ?? project.Funding ?? '',
      jobs_created: project.jobs_created ?? project.JobsCreated ?? '',
      people_supported: project.people_supported ?? project.PeopleSupported ?? '',
      training_hours: project.training_hours ?? project.TrainingHours ?? '',
      start_date: project.start_date ? String(project.start_date).slice(0, 10) : project.StartDate ? String(project.StartDate).slice(0, 10) : '',
      end_date: project.end_date ? String(project.end_date).slice(0, 10) : project.EndDate ? String(project.EndDate).slice(0, 10) : '',
      description: project.description ?? project.Description ?? '',
    })
    setAddDialogOpen(true)
  }

  const handleOpenDeleteDialog = (project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) {
      return
    }

    const projectId = getProjectId(projectToDelete)
    if (!projectId) {
      setSubmitError('Unable to identify the project to delete.')
      return
    }

    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`)
      handleCloseDeleteDialog()
      loadProjects()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to delete project.'
      setSubmitError(message)
    }
  }

  const handleCsvImportClick = () => {
    setCsvMessage(null)
    fileInputRef.current?.click()
  }

  const handleCsvFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setCsvMessage(null)
    setCsvUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:5000/api/projects/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setCsvMessage({ type: 'success', text: response.data.message || 'CSV imported successfully.' })
      loadProjects()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to import CSV.'
      setCsvMessage({ type: 'error', text: message })
    } finally {
      setCsvUploading(false)
      event.target.value = ''
    }
  }

  const handleExportCsv = async () => {
    setCsvMessage(null)
    setCsvExporting(true)

    try {
      const response = await axios.get('http://localhost:5000/api/projects/export-csv', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'projects-export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setCsvMessage({ type: 'success', text: 'CSV exported successfully.' })
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to export CSV.'
      setCsvMessage({ type: 'error', text: message })
    } finally {
      setCsvExporting(false)
    }
  }

  const handleProjectChange = (field) => (event) => {
    setNewProject((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const formData = newProject

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
  }

  const isEditingProject = Boolean(editingProjectId)

  const handleAddProjectSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    if (!newProject.project_code || !newProject.project_name) {
      setSubmitError('Project code and project name are required.')
      return
    }

    setSubmittingProject(true)

    try {
      if (isEditingProject) {
        await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, newProject)
      } else {
        await axios.post('http://localhost:5000/api/projects', newProject)
      }
      handleCloseAddDialog()
      loadProjects()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to save project.'
      setSubmitError(message)
    } finally {
      setSubmittingProject(false)
    }
  }

  const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') return 0
    const numeric = Number(String(value).replace(/[^0-9.-]+/g, ''))
    return Number.isFinite(numeric) ? numeric : 0
  }

  const totalProjects = projects.length
  const fundingTracked = projects.reduce(
    (sum, project) => sum + parseNumber(project.funding_amount ?? project.Funding ?? project.funding),
    0
  )
  const jobsCreated = projects.reduce(
    (sum, project) => sum + parseNumber(project.jobs_created ?? project.JobsCreated ?? project.jobsCreated),
    0
  )
  const peopleSupported = projects.reduce(
    (sum, project) => sum + parseNumber(project.people_supported ?? project.PeopleSupported ?? project.peopleSupported),
    0
  )
  const trainingHours = projects.reduce(
    (sum, project) => sum + parseNumber(project.training_hours ?? project.TrainingHours ?? project.trainingHours),
    0
  )

  const metrics = [
    { title: 'Total Projects', value: totalProjects, icon: <DashboardIcon /> },
    { title: 'Funding Tracked', value: `$${fundingTracked.toLocaleString()}`, icon: <MonetizationOnIcon /> },
    { title: 'Jobs Created', value: jobsCreated.toLocaleString(), icon: <PeopleIcon /> },
    { title: 'People Supported', value: peopleSupported.toLocaleString(), icon: <SupportIcon /> },
    { title: 'Training Hours', value: trainingHours.toLocaleString(), icon: <AssessmentIcon /> },
  ]

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">SocioImpact</Typography>
          <Typography variant="body2" color="text.secondary">
            Portfolio · Full-stack demo
          </Typography>
        </Box>
        <Divider />
        <List>
          {pages.map((p) => (
            <ListItemButton
              key={p.key}
              selected={currentPage === p.key}
              sx={{ px: 3 }}
              onClick={() => {
                setCurrentPage(p.key)
                setMobileOpen(false)
              }}
            >
              <ListItemIcon>{p.icon}</ListItemIcon>
              <ListItemText primary={p.key} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  )

  return (
    <Box sx={{ display: 'flex' }} className="app-root">
      <CssBaseline />
      <AppBar position="fixed" className="app-bar" sx={{ ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Socioeconomic Impact Dashboard
          </Typography>
          <IconButton color="inherit" size="large" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <BarChartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="sidebar">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" className="main-content" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {currentPage === 'Dashboard' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Grid container spacing={2}>
                {metrics.map((m) => (
                  <Grid item xs={12} sm={6} md={4} lg={4} key={m.title}>
                    <Card elevation={3} className="metric-card">
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <div>
                            <Typography variant="subtitle2" color="text.secondary">
                              {m.title}
                            </Typography>
                            <Typography variant="h5" sx={{ mt: 1 }}>
                              {m.value}
                            </Typography>
                          </div>
                          <Box sx={{ color: theme.palette.primary.main }}>{m.icon}</Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <div>
                      <Typography variant="h6">Monthly Impact</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track engagement and impact across all active socioeconomic initiatives.
                      </Typography>
                    </div>
                  </Stack>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="impact" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Key Projects</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    High-priority initiatives driving the next phase of socioeconomic growth.
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 1, maxHeight: 360 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Project</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projects.length > 0 ? (
                          projects.map((p) => (
                            <TableRow key={p.project_code ?? p.id ?? p.ProjectID ?? Math.random()} hover>
                              <TableCell>{p.project_code ?? p.id ?? p.ProjectID ?? '—'}</TableCell>
                              <TableCell>{p.project_name ?? p.name ?? p.ProjectName ?? 'Untitled Project'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                No projects available.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentPage === 'Projects' && (
          <>
            <Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Projects
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Portfolio of socioeconomic initiatives, including funding status, regional reach, and active impact.
                  </Typography>
                </Box>
                <Button variant="contained" onClick={handleOpenAddDialog}>
                  Add Project
                </Button>
              </Stack>
              <Card>
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Project</TableCell>
                          <TableCell>Region</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Impact</TableCell>
                          <TableCell align="right">Funding</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projectsLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 4 }}>
                              <LinearProgress />
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                Loading projects...
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : projectsError ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 4 }}>
                              <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                                {projectsError}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : projects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                No projects available.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          projects.map((p) => (
                            <TableRow key={p.project_code ?? p.id ?? p.ProjectID ?? Math.random()} hover>
                              <TableCell>{p.project_code ?? p.id ?? p.ProjectID ?? '—'}</TableCell>
                              <TableCell>{p.project_name ?? p.name ?? p.ProjectName ?? 'Untitled Project'}</TableCell>
                              <TableCell>{p.community ?? p.region ?? p.Region ?? '—'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={p.status ?? p.Status ?? 'Unknown'}
                                  size="small"
                                  color={
                                    p.status === 'Active' || p.Status === 'Active'
                                      ? 'success'
                                      : p.status === 'Completed' || p.Status === 'Completed'
                                      ? 'primary'
                                      : 'default'
                                  }
                                />
                              </TableCell>
                              <TableCell align="right">{p.people_supported ?? p.peopleSupported ?? p.impact ?? p.Impact ?? '—'}</TableCell>
                              <TableCell align="right">{p.funding_amount ?? p.Funding ?? p.funding ?? '—'}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button size="small" variant="outlined" onClick={() => handleOpenEditDialog(p)}>
                                    Edit
                                  </Button>
                                  <Button size="small" variant="outlined" color="error" onClick={() => handleOpenDeleteDialog(p)}>
                                    Delete
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>

            <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} fullWidth maxWidth="md">
              <DialogTitle>{isEditingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
              <DialogContent dividers sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleAddProjectSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Project Code"
                        value={newProject.project_code}
                        onChange={handleProjectChange('project_code')}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Project Name"
                        value={newProject.project_name}
                        onChange={handleProjectChange('project_name')}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Community"
                        value={newProject.community}
                        onChange={handleProjectChange('community')}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Status"
                        value={newProject.status}
                        onChange={handleProjectChange('status')}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Funding Amount"
                        value={newProject.funding_amount}
                        onChange={handleProjectChange('funding_amount')}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Jobs Created"
                        value={newProject.jobs_created}
                        onChange={handleProjectChange('jobs_created')}
                        fullWidth
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="People Supported"
                        value={newProject.people_supported}
                        onChange={handleProjectChange('people_supported')}
                        fullWidth
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Training Hours"
                        value={newProject.training_hours}
                        onChange={handleProjectChange('training_hours')}
                        fullWidth
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Start Date
                        </Typography>
                        <Box
                          component="input"
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          sx={{
                            width: '100%',
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: 1,
                            px: 1.5,
                            height: 56,
                            fontSize: '1rem',
                            '&:focus': {
                              outline: '2px solid rgba(25, 118, 210, 0.3)',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          End Date
                        </Typography>
                        <Box
                          component="input"
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          sx={{
                            width: '100%',
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: 1,
                            px: 1.5,
                            height: 56,
                            fontSize: '1rem',
                            '&:focus': {
                              outline: '2px solid rgba(25, 118, 210, 0.3)',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        value={newProject.description}
                        onChange={handleProjectChange('description')}
                        fullWidth
                        multiline
                        rows={3}
                      />
                    </Grid>
                    {submitError && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="error">
                          {submitError}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3, pt: 2, gap: 1 }}>
                <Button onClick={handleCloseAddDialog} disabled={submittingProject}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={submittingProject} onClick={handleAddProjectSubmit}>
                  {submittingProject ? 'Saving...' : isEditingProject ? 'Save Changes' : 'Add Project'}
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the project "{projectToDelete?.project_name ?? projectToDelete?.ProjectName ?? 'this project'}"? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                <Button onClick={handleConfirmDelete} variant="contained" color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {currentPage === 'Impact Metrics' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Impact Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review progress across key outcome indicators and identify areas for scaling impact.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Monthly Impact
                    </Typography>
                    <Box sx={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="impact" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  {impactSummary.map((item) => (
                    <Card key={item.label}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="h6">{item.value}</Typography>
                          <Chip label={item.change} color={item.change.startsWith('+') ? 'success' : 'default'} size="small" />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {currentPage === 'CSV Import/Export' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              CSV Import / Export
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload or download impact datasets to maintain a connected analytics pipeline.
            </Typography>
            <Grid container spacing={2}>
              {csvStats.map((item) => (
                <Grid item xs={12} sm={4} key={item.label}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                  <Button
                    variant="contained"
                    startIcon={<ImportExportIcon />}
                    onClick={handleCsvImportClick}
                    disabled={csvUploading}
                  >
                    {csvUploading ? 'Importing...' : 'Import CSV'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImportExportIcon />}
                    onClick={handleExportCsv}
                    disabled={csvExporting}
                  >
                    {csvExporting ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleCsvFileChange}
                  />
                </Stack>
                {csvMessage && (
                  <Typography
                    variant="body2"
                    color={csvMessage.type === 'error' ? 'error' : 'success.main'}
                    sx={{ mt: 2 }}
                  >
                    {csvMessage.text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {currentPage === 'Support Tickets' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Support Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage operational issues and track resolution progress for platform support requests.
            </Typography>
            <Card>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ticket</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supportTickets.map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell>{t.id}</TableCell>
                          <TableCell>{t.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={t.status}
                              size="small"
                              color={t.status === 'Open' ? 'warning' : t.status === 'In progress' ? 'info' : 'success'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t.priority}
                              size="small"
                              color={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {currentPage === 'Reports' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Curated report templates for stakeholders, investors, and program managers.
            </Typography>
            <Grid container spacing={3} className="reports-grid">
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.title}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {report.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                        {report.subtitle}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {report.status}
                        </Typography>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  )
}
