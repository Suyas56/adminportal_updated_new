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
    Typography,
    MenuItem
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

export function EducationManagement() {
    const { data: session } = useSession()
    const [educations, setEducations] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedEducation, setSelectedEducation] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEducation = async () => {
            try {
                const res = await fetch(`/api/faculty?type=${session?.user?.email}`)
                const data = await res.json()
                setEducations(data.education || [])
            } catch (error) {
                console.error('Error fetching education:', error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.email) {
            fetchEducation()
        }
    }, [session])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this education record?')) return
        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'education',
                    id,
                    email: session?.user?.email
                })
            })
            if (!res.ok) throw new Error('Failed to delete')
            setEducations(prev => prev.filter(edu => edu.id !== id))
            window.location.reload()
        } catch (error) {
            console.error('Error deleting education:', error)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Education</Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenAdd(true)}>
                    Add Education
                </Button>
            </div>
            {loading ? (
                <div>Loading education details...</div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Degree</TableCell>
                                <TableCell>Specialization</TableCell>
                                <TableCell>Institution</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {educations.map((edu) => (
                                <TableRow key={edu.id}>
                                    <TableCell>{edu.certification}</TableCell>
                                    <TableCell>{edu.specialization?edu.specialization :"-"}</TableCell>
                                    <TableCell>{edu.institution}</TableCell>
                                    <TableCell>{edu.passing_year}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => { setSelectedEducation(edu); setOpenEdit(true) }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(edu.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <AddEducation open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={(newEdu) => { setEducations(prev => [...prev, newEdu]); setOpenAdd(false) }} />
            {selectedEducation && (
                <EditEducation open={openEdit} onClose={() => { setOpenEdit(false); setSelectedEducation(null) }} education={selectedEducation} onSuccess={(updatedEdu) => { setEducations(prev => prev.map(edu => edu.id === updatedEdu.id ? updatedEdu : edu)); setOpenEdit(false); setSelectedEducation(null) }} />
            )}
        </div>
    )
}

const degreeOptions = [
    "PhD", "M.Tech", "B.Tech", "M.Arch", "B.Arch", "BSc", "MSc", "MCA"
]

export function AddEducation({ open, onClose, onSuccess }) {
    const { data: session } = useSession()
    const [formData, setFormData] = useState({ degree: '', institution: '', year: '',specialization:"" })
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'education',
                    id: Date.now(),
                    ...formData,
                    email: session?.user?.email
                })
            })
            if (!res.ok) throw new Error('Failed to add education')
            const newEducation = await res.json()
            onSuccess(newEducation)
            window.location.reload()
        } catch (error) {
            console.error('Error adding education:', error)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Education</DialogTitle>
                <DialogContent>
                    <TextField fullWidth select label="Degree" value={formData.degree} onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))} margin="normal" required>
                        {degreeOptions.map((degree) => (
                            <MenuItem key={degree} value={degree}>{degree}</MenuItem>
                        ))}
                    </TextField>
                    <TextField fullWidth label="Institution" value={formData.institution} onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))} margin="normal" required />
                    <TextField
                        fullWidth
                        label="Specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                        margin="normal"
                        required
                    />
                    <TextField fullWidth label="Year" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))} margin="normal" required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Add</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export function EditEducation({ open, onClose, education, onSuccess }) {
    const { data: session } = useSession()
    const [formData, setFormData] = useState(education)
    const [submitting, setSubmitting] = useState(false)

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear()
        const years = []
        for (let year = currentYear; year >= 1900; year--) {
            years.push(year)
        }
        return years
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'education',
                    ...formData,
                    email: session?.user?.email
                })
            })

            if (!res.ok) throw new Error('Failed to update education')

            const updatedEducation = await res.json()
            onSuccess(updatedEducation)
        } catch (error) {
            console.error('Error updating education:', error)
        } finally {
            window.location.reload()
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Education</DialogTitle>
                <DialogContent>
                    {/* Dropdown for Degree */}
                    <TextField
                        fullWidth
                        select
                        label="Degree"
                        value={formData.certification}
                        onChange={(e) => setFormData(prev => ({ ...prev, certification: e.target.value }))}
                        margin="normal"
                        required
                    >
                        {degreeOptions.map((degree) => (
                            <MenuItem key={degree} value={degree}>
                                {degree}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Input for Institution */}
                    <TextField
                        fullWidth
                        label="Institution"
                        value={formData.institution}
                        onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                        margin="normal"
                        required
                    />

                    <TextField
                            fullWidth
                            label="Specialization"
                            value={formData.specialization}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            margin="normal"
                            required
                        />

                    {/* Dropdown for Year */}
                    <TextField
                        fullWidth
                        select
                        label="Year"
                        value={formData.passing_year}
                        onChange={(e) => setFormData(prev => ({ ...prev, passing_year: e.target.value }))}
                        margin="normal"
                        required
                    >
                        {generateYearOptions().map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={submitting} variant="contained">
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
