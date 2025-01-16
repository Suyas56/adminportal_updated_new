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
    TableRow
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'

// Add Form Component
export function AddWork({ handleClose, modal }) {
    const { data: session } = useSession()
    const initialState = {
        designation: '',
        organization: '',
        from_date: null,
        to_date: null,
        description: ''
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
                    type: 'work_experience',
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
                <DialogTitle>Add Work Experience</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Designation"
                        name="designation"
                        fullWidth
                        required
                        value={content.designation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Organization"
                        name="organization"
                        fullWidth
                        required
                        value={content.organization}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="From Date"
                            value={content.from_date}
                            onChange={(date) => setContent({ ...content, from_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                        <DatePicker
                            label="To Date"
                            value={content.to_date}
                            onChange={(date) => setContent({ ...content, to_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        value={content.description}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={submitting}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Edit Form Component
export function EditWork({ handleClose, modal, values }) {
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
                    type: 'work_experience',
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
                <DialogTitle>Edit Work Experience</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Designation"
                        name="designation"
                        fullWidth
                        required
                        value={content.designation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Organization"
                        name="organization"
                        fullWidth
                        required
                        value={content.organization}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="From Date"
                            value={content.from_date}
                            onChange={(date) => setContent({ ...content, from_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                        <DatePicker
                            label="To Date"
                            value={content.to_date}
                            onChange={(date) => setContent({ ...content, to_date: date })}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    margin: 'dense' 
                                } 
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        fullWidth
                        multiline
                        rows={4}
                        value={content.description}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Work Experience Row Component
export function WorkExpRow({ data, onEdit, onDelete }) {
    return (
        <TableRow>
            <TableCell>{data.designation}</TableCell>
            <TableCell>{data.organization}</TableCell>
            <TableCell>
                {data.from_date ? format(new Date(data.from_date), 'dd/MM/yyyy') : ''}
            </TableCell>
            <TableCell>
                {data.to_date ? format(new Date(data.to_date), 'dd/MM/yyyy') : ''}
            </TableCell>
            <TableCell>{data.description}</TableCell>
            <TableCell>
                <IconButton onClick={() => onEdit(data)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(data.id)}>
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    )
} 