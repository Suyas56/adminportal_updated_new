'use client'

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
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format, parseISO } from 'date-fns'
import AddIcon from '@mui/icons-material/Add'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        authors: '',
        title: '',
        journal_name: '',
        volume: '',
        publication_year: new Date().getFullYear(),
        pages: '',
        journal_quartile: '',
        publication_date: null,
        student_involved: false,
        student_details: '',
        doi_url: ''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setContent({ ...content, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'journal_papers',
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
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Journal Paper</DialogTitle>
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
                        label="Journal Name"
                        name="journal_name"
                        fullWidth
                        required
                        value={content.journal_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Volume"
                        name="volume"
                        fullWidth
                        value={content.volume}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Publication Year"
                        name="publication_year"
                        type="number"
                        fullWidth
                        required
                        value={content.publication_year}
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
                    <InputLabel id="quartile">Journal Quartile</InputLabel>
                    <Select
                        labelId="quartile"
                        name="journal_quartile"
                        value={content.journal_quartile}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Q1">Q1</MenuItem>
                        <MenuItem value="Q2">Q2</MenuItem>
                        <MenuItem value="Q3">Q3</MenuItem>
                        <MenuItem value="Q4">Q4</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Publication Date"
                            value={content.publication_date ? parseISO(content.publication_date) : null}
                            onChange={(newValue) => {
                                setContent({
                                    ...content,
                                    publication_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                                })
                            }}
                            slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                        />
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={content.student_involved}
                                onChange={handleChange}
                                name="student_involved"
                            />
                        }
                        label="Student Involved"
                    />
                    {content.student_involved && (
                        <TextField
                            margin="dense"
                            label="Student Details"
                            name="student_details"
                            fullWidth
                            required
                            value={content.student_details}
                            onChange={handleChange}
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="DOI URL"
                        name="doi_url"
                        fullWidth
                        value={content.doi_url}
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
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setContent({ ...content, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'journal_papers',
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
                <DialogTitle>Edit Journal Paper</DialogTitle>
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
export default function JournalPaperManagement() {
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
                setPapers(data.journal_papers || [])
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
                        type: 'journal_papers',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!result.ok) throw new Error('Failed to delete')
                refreshData()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Journal Papers</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                >
                    Add Journal Paper
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Journal</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Quartile</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {papers?.map((paper) => (
                            <TableRow key={paper.id}>
                                <TableCell>{paper.title}</TableCell>
                                <TableCell>{paper.authors}</TableCell>
                                <TableCell>{paper.journal_name}</TableCell>
                                <TableCell>{paper.publication_year}</TableCell>
                                <TableCell>{paper.journal_quartile}</TableCell>
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
                                    No papers found
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