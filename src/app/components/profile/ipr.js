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
  InputLabel
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        title: '',
        type: '',
        registration_date: null,
        publication_date: null,
        grant_date: null,
        grant_no: '',
        applicant_name: '',
        inventors: ''
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
                    type: 'ipr',
                    ...content,
                    // Example: Handle date fields if present (e.g., creation_date, expiry_date)
                    creation_date: content.creation_date
                        ? new Date(content.creation_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                        : null,
                    expiry_date: content.expiry_date
                        ? new Date(content.expiry_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                        : null,
                    id: Date.now().toString(),
                    email: session?.user?.email
                }),
            });
            
            
            
            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            refreshData()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add IPR</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <InputLabel id="type">IPR Type</InputLabel>
                    <Select
                        labelId="type"
                        name="type"
                        value={content.type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Patent">Patent</MenuItem>
                        <MenuItem value="Copyright">Copyright</MenuItem>
                        <MenuItem value="Trademark">Trademark</MenuItem>
                        <MenuItem value="Industrial Design">Industrial Design</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Registration Date"
                            value={content.registration_date}
                            onChange={(newValue) => 
                                setContent({ ...content, registration_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="Publication Date"
                            value={content.publication_date}
                            onChange={(newValue) => 
                                setContent({ ...content, publication_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="Grant Date"
                            value={content.grant_date}
                            onChange={(newValue) => 
                                setContent({ ...content, grant_date: newValue})
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Grant Number"
                        name="grant_no"
                        fullWidth
                        value={content.grant_no}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Applicant Name"
                        name="applicant_name"
                        fullWidth
                        required
                        value={content.applicant_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Inventors"
                        name="inventors"
                        fullWidth
                        required
                        value={content.inventors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
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
                    type: 'ipr',
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
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit IPR</DialogTitle>
                <DialogContent>
                    {/* Same form fields as AddForm */}
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
export default function IPRManagement() {
    const { data: session } = useSession()
    const [iprs, setIprs] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedIpr, setSelectedIpr] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchIprs = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setIprs(data.ipr || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchIprs()
        }
    }, [session, refreshData])

    const handleEdit = (ipr) => {
        setSelectedIpr(ipr)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this IPR?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'ipr',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenAdd(true)}
                sx={{ mb: 2 }}
            >
                Add IPR
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Grant No</TableCell>
                            <TableCell>Grant Date</TableCell>
                            <TableCell>Inventors</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {iprs?.map((ipr) => (
                            <TableRow key={ipr.id}>
                                <TableCell>{ipr.title}</TableCell>
                                <TableCell>{ipr.type}</TableCell>
                                <TableCell>{ipr.grant_no}</TableCell>
                                <TableCell>
                                    {ipr.grant_date ? new Date(ipr.grant_date).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>{ipr.inventors}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(ipr)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(ipr.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {iprs?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No IPR records found
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

            {selectedIpr && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedIpr(null)
                    }}
                    values={selectedIpr}
                />
            )}
        </div>
    )
} 