import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Typography
  } from '@mui/material'
  import { useSession } from 'next-auth/react'
  import React, { useState } from 'react'
  import useRefreshData from '@/custom-hooks/refresh'
  import EditIcon from '@mui/icons-material/Edit'
  import DeleteIcon from '@mui/icons-material/Delete'
  import AddIcon from '@mui/icons-material/Add'
  
  // Add Form Component
  
  export const AddForm = ({ handleClose, modal }) => {
      const { data: session } = useSession()
      const initialState = {
          authors: '',
          title: '',
          conference_name: '',
          location: '',
          conference_year: new Date().getFullYear(),
          pages: '',
          indexing: '',
          foreign_author: '',
          student_involved: '',
          doi: ''
      }
      const [content, setContent] = useState(initialState)
      const refreshData = useRefreshData(false)
      const [submitting, setSubmitting] = useState(false)
  
      const handleChange = (e) => {
          setContent({ ...content, [e.target.name]: e.target.value })
      }
  
      const handleSubmit = async (e) => {
          setSubmitting(true)
          e.preventDefault()
  
          try {
              const result = await fetch('/api/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      type: 'conference_papers',
                      ...content,
                      id: Date.now().toString(),
                      email: session?.user?.email
                  }),
              })
  
              if (!result.ok) throw new Error('Failed to create')
              
              handleClose()
              refreshData()
              setContent(initialState)
          } catch (error) {
              console.error('Error:', error)
          } finally {
              setSubmitting(false)
              window.location.reload()
          }
      }
  
      return (
          <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
              <form onSubmit={handleSubmit}>
                  <DialogTitle>Add Conference Paper</DialogTitle>
                  <DialogContent>
                      <TextField
                          margin="dense"
                          label="Paper Title"
                          name="title"
                          fullWidth
                          required
                          value={content.title}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Authors"
                          name="authors"
                          fullWidth
                          required
                          value={content.authors}
                          onChange={handleChange}
                          helperText="Enter names separated by commas"
                      />
                      <TextField
                          margin="dense"
                          label="Conference Name"
                          name="conference_name"
                          fullWidth
                          required
                          value={content.conference_name}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Location"
                          name="location"
                          fullWidth
                          required
                          value={content.location}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Conference Year"
                          name="conference_year"
                          type="number"
                          fullWidth
                          required
                          value={content.conference_year}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Pages"
                          name="pages"
                          fullWidth
                          value={content.pages}
                          onChange={handleChange}
                      />
                      <FormControl fullWidth margin="dense">
                          <InputLabel>Indexing</InputLabel>
                          <Select
                              name="indexing"
                              value={content.indexing}
                              onChange={handleChange}
                              label="Indexing"
                          >
                              <MenuItem value="Scopus">Scopus</MenuItem>
                              <MenuItem value="Web of Science">Web of Science</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>

                          </Select>
                      </FormControl>
                      <TextField
                          margin="dense"
                          label="Foreign Author"
                          name="foreign_author"
                          fullWidth
                          value={content.foreign_author}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Student Involved"
                          name="student_involved"
                          fullWidth
                          value={content.student_involved}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="DOI"
                          name="doi"
                          fullWidth
                          value={content.doi}
                          onChange={handleChange}
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button
                          type="submit"
                          color="primary"
                          disabled={submitting}
                      >
                          {submitting ? 'Submitting...' : 'Submit'}
                      </Button>
                  </DialogActions>
              </form>
          </Dialog>
      )
  }
  
  // Edit Form Component
  export const EditForm = ({ handleClose, modal, values }) => {
      const { data: session } = useSession()
      const [content, setContent] = useState(values)
      const refreshData = useRefreshData(false)
      const [submitting, setSubmitting] = useState(false)
  
      const handleChange = (e) => {
          setContent({ ...content, [e.target.name]: e.target.value })
      }
  
      const handleSubmit = async (e) => {
          setSubmitting(true)
          e.preventDefault()
  
          try {
              const result = await fetch('/api/update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      type: 'conference_papers',
                      ...content,
                      email: session?.user?.email
                  }),
              })
  
              if (!result.ok) throw new Error('Failed to update')
              
              handleClose()
              refreshData()
          } catch (error) {
              console.error('Error:', error)
          } finally {
              window.location.reload()
              setSubmitting(false)
          }
      }
  
      return (
          <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
              <form onSubmit={handleSubmit}>
                  <DialogTitle>Edit Conference Paper</DialogTitle>
                  <DialogContent>
                      <TextField
                          margin="dense"
                          label="Paper Title"
                          name="title"
                          fullWidth
                          required
                          value={content.title}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Authors"
                          name="authors"
                          fullWidth
                          required
                          value={content.authors}
                          onChange={handleChange}
                          helperText="Enter names separated by commas"
                      />
                      <TextField
                          margin="dense"
                          label="Conference Name"
                          name="conference_name"
                          fullWidth
                          required
                          value={content.conference_name}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Location"
                          name="location"
                          fullWidth
                          required
                          value={content.location}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Conference Year"
                          name="conference_year"
                          type="number"
                          fullWidth
                          required
                          value={content.conference_year}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Pages"
                          name="pages"
                          fullWidth
                          value={content.pages}
                          onChange={handleChange}
                      />
                      <FormControl fullWidth margin="dense">
                          <InputLabel>Indexing</InputLabel>
                          <Select
                              name="indexing"
                              value={content.indexing}
                              onChange={handleChange}
                              label="Indexing"
                          >
                              <MenuItem value="Scopus">Scopus</MenuItem>
                              <MenuItem value="Web of Science">Web of Science</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>

                          </Select>
                      </FormControl>
                      <TextField
                          margin="dense"
                          label="Foreign Author"
                          name="foreign_author"
                          fullWidth
                          value={content.foreign_author}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="Student Involved"
                          name="student_involved"
                          fullWidth
                          value={content.student_involved}
                          onChange={handleChange}
                      />
                      <TextField
                          margin="dense"
                          label="DOI"
                          name="doi"
                          fullWidth
                          value={content.doi}
                          onChange={handleChange}
                      />
                  </DialogContent><DialogActions>
                      <Button
                          type="submit"
                          color="primary"
                          disabled={submitting}
                      >
                          {submitting ? 'Saving...' : 'Save'}
                      </Button>
                  </DialogActions>
              </form>
          </Dialog>
      )
  }
  
  // Main Component
  export default function ConferencePaperManagement() {
      const { data: session } = useSession()
      const [papers, setPapers] = useState([])
      const [openAdd, setOpenAdd] = useState(false)
      const [openEdit, setOpenEdit] = useState(false)
      const [selectedPaper, setSelectedPaper] = useState(null)
      const [loading, setLoading] = useState(true)
      const refreshData = useRefreshData(false)
  
      // Fetch data
      React.useEffect(() => {
          const fetchPapers = async () => {
              try {
                  const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                  if (!response.ok) throw new Error('Failed to fetch')
                  const data = await response.json()
                  setPapers(data.conference_papers || [])
              } catch (error) {
                  console.error('Error:', error)
              } finally {
                  setLoading(false)
              }
          }
  
          if (session?.user?.email) {
              fetchPapers()
          }
      }, [session, refreshData])
  
      const handleEdit = (paper) => {
          setSelectedPaper(paper)
          setOpenEdit(true)
      }
  
      const handleDelete = async (id) => {
          if (confirm('Are you sure you want to delete this paper?')) {
              try {
                  const response = await fetch('/api/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          type: 'conference_papers',
                          id,
                          email: session?.user?.email
                      }),
                  })
                  
                  if (!response.ok) throw new Error('Failed to delete')
                  refreshData()
              } catch (error) {
                  console.error('Error:', error)
              }finally{
                  window.location.reload()
              }
          }
      }
  
      if (loading) return <div>Loading...</div>
  
      return (
          <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                  <Typography variant="h6">Conference Papers</Typography>
                  <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      onClick={() => setOpenAdd(true)}
                  >
                      Add Conference Paper
                  </Button>
              </div>
              <TableContainer component={Paper}>
                  <Table>
                      <TableHead>
                          <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Authors</TableCell>
                              <TableCell>Conference</TableCell>
                              <TableCell>Location</TableCell>
                              {/* <TableCell>Year</TableCell> */}
                              <TableCell>Pages</TableCell>
                              <TableCell>Indexing</TableCell>
                              <TableCell>Foreign Author</TableCell>
                              <TableCell>Student Involved</TableCell>
                              <TableCell>DOI</TableCell>
                              <TableCell>Year</TableCell>
                              <TableCell align="right">Actions</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {papers?.map((paper) => (
                              <TableRow key={paper.id}>
                                  <TableCell>{paper.title}</TableCell>
                                  <TableCell>{paper.authors}</TableCell>
                                  <TableCell>{paper.conference_name}</TableCell>
                                  <TableCell>{paper.location}</TableCell>
                                  {/* <TableCell>{paper.yea}</TableCell> */}
                                  <TableCell>{paper.pages}</TableCell>
                                  <TableCell>{paper.indexing}</TableCell>
                                  <TableCell>{paper.foreign_author}</TableCell>
                                  <TableCell>{paper.student_involved}</TableCell>
                                  <TableCell>{paper.doi}</TableCell>
                                  <TableCell>{paper.conference_year}</TableCell>
                                  
                                  <TableCell align="right">
                                      <IconButton 
                                          onClick={() => handleEdit(paper)}
                                          color="primary"
                                          size="small"
                                      >
                                          <EditIcon />
                                      </IconButton>
                                      <IconButton 
                                          onClick={() => handleDelete(paper.id)}
                                          color="error"
                                          size="small"
                                      >
                                          <DeleteIcon />
                                      </IconButton>
                                  </TableCell>
                              </TableRow>
                          ))}
                          {papers?.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={6} align="center">
                                      No conference papers found
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </TableContainer>
  
              <AddForm 
                  modal={openAdd}
                  handleClose={() => setOpenAdd(false)}
              />
  
              {selectedPaper && (
                  <EditForm
                      modal={openEdit}
                      handleClose={() => {
                          setOpenEdit(false)
                          setSelectedPaper(null)
                      }}
                      values={selectedPaper}
                  />
              )}
          </div>
      )
  }
  