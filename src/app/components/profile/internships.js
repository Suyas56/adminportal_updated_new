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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Loading from '../common/Loading'
import AddIcon from '@mui/icons-material/Add'

// Add formatDate helper function at the top
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        student_name: '',
        qualification: '',
        affiliation: '',
        project_title: '',
        start_date: null,
        end_date: null,
        student_type: ''
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
                  type: 'internships',
                  ...content,
                  // Format start_date and end_date to 'YYYY-MM-DD' for DATE or 'YYYY-MM-DD HH:MM:SS' for DATETIME
                  start_date: content.start_date
                    ? new Date(content.start_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                    : null,
                  end_date: content.end_date
                    ? new Date(content.end_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                    : null,
                  id: Date.now().toString(),
                  email: session?.user?.email,
                }),
              });
              

            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            refreshData()
            setContent(initialState)
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Internship</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Student Name"
                        name="student_name"
                        fullWidth
                        required
                        value={content.student_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Qualification"
                        name="qualification"
                        fullWidth
                        required
                        value={content.qualification}
                        onChange={handleChange}
                        select
                    >
                        <MenuItem value="UG">UG</MenuItem>
                        <MenuItem value="PG">PG</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Affiliation"
                        name="affiliation"
                        fullWidth
                        required
                        value={content.affiliation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => 
                                setContent({ ...content, start_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) => 
                                setContent({ ...content, end_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <InputLabel id="student-type">Student Type</InputLabel>
                    <Select
                        labelId="student-type"
                        name="student_type"
                        value={content.student_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="UG">Internal Student</MenuItem>
                        <MenuItem value="PG">External Student</MenuItem>
                    </Select>
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
    // Parse dates when initializing content
    const [content, setContent] = useState({
        ...values,
        start_date: values.start_date ? new Date(values.start_date) : null,
        end_date: values.end_date ? new Date(values.end_date) : null
    })
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'internships',
                    ...content,
                    // Format dates before sending to API
                    start_date: content.start_date 
                        ? new Date(content.start_date).toISOString().split('T')[0]
                        : null,
                    end_date: content.end_date
                        ? new Date(content.end_date).toISOString().split('T')[0]
                        : null,
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            handleClose()
            refreshData()
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Internship</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Student Name"
                        name="student_name"
                        fullWidth
                        required
                        value={content.student_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Qualification"
                        name="qualification"
                        select
                        fullWidth
                        required
                        value={content.qualification}
                        onChange={handleChange}
                    >
                        <MenuItem value="UG">UG</MenuItem>
                        <MenuItem value="PG">PG</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Affiliation"
                        name="affiliation"
                        fullWidth
                        required
                        value={content.affiliation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    start_date: newValue
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    end_date: newValue
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Student Type"
                        name="student_type"
                        select
                        fullWidth
                        required
                        value={content.student_type}
                        onChange={handleChange}
                    >
                        <MenuItem value="UG">Internal Student</MenuItem>
                        <MenuItem value="PG">External Student</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
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
export default function InternshipManagement() {
    const { data: session } = useSession()
    const [internships, setInternships] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedInternship, setSelectedInternship] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchInternships = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setInternships(data.internships || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchInternships()
        }
    }, [session, refreshData])

    const handleEdit = (internship) => {
        setSelectedInternship(internship)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this internship?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'internships',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
                window.location.reload()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <Loading />

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Internships</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAdd(true)}
                >
                    Add Internship
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Project Title</TableCell>
                            <TableCell>Affiliation</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {internships?.map((internship) => (
                            <TableRow key={internship.id}>
                                <TableCell>{internship.student_name}</TableCell>
                                <TableCell>{internship.project_title}</TableCell>
                                <TableCell>{internship.affiliation}</TableCell>
                                <TableCell>
                                    {formatDate(internship.start_date)}
                                </TableCell>
                                <TableCell>
                                    {internship.end_date ? formatDate(internship.end_date) : 'Present'}
                                </TableCell>
                                <TableCell>{internship.student_type}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(internship)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(internship.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {internships?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No internships found
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

            {selectedInternship && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedInternship(null)
                    }}
                    values={selectedInternship}
                />
            )}
        </div>
    )
}