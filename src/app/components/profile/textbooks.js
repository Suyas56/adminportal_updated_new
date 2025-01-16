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
  TableRow
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        title: '',
        authors: '',
        publisher: '',
        isbn: '',
        year: new Date().getFullYear(),
        scopus: '',
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
                    type: 'textbooks',
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
                <DialogTitle>Add Textbook</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Book Title"
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
                        label="Publisher"
                        name="publisher"
                        fullWidth
                        required
                        value={content.publisher}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="ISBN"
                        name="isbn"
                        fullWidth
                        required
                        value={content.isbn}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Publication Year"
                        name="year"
                        type="number"
                        fullWidth
                        required
                        value={content.year}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Scopus"
                        name="scopus"
                        fullWidth
                        value={content.scopus}
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
                    type: 'textbooks',
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
                <DialogTitle>Edit Textbook</DialogTitle>
                <DialogContent>
                    {/* Same form fields as AddForm */}
                    <TextField
                        margin="dense"
                        label="Book Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    {/* ... other fields same as AddForm ... */}
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
export default function TextbookManagement() {
    const { data: session } = useSession()
    const [books, setBooks] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setBooks(data.textbooks || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchBooks()
        }
    }, [session, refreshData])

    const handleEdit = (book) => {
        setSelectedBook(book)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this textbook?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'textbooks',
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
                Add Textbook
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Publisher</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books?.map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.authors}</TableCell>
                                <TableCell>{book.publisher}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.year}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(book)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(book.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {books?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No textbooks found
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

            {selectedBook && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedBook(null)
                    }}
                    values={selectedBook}
                />
            )}
        </div>
    )
} 