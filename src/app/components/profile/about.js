'use client'

import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Paper,
    Typography,
    Box
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Toast from '../common/Toast'

// Edit/Add Form Component
const AboutForm = ({ handleClose, modal, initialContent = '', isEdit = false }) => {
    const { data: session } = useSession()
    const [content, setContent] = useState(initialContent)
    const [submitting, setSubmitting] = useState(false)
    const refreshData = useRefreshData()
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const endpoint = isEdit ? '/api/update' : '/api/create'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'about',
                    content: content,
                    email: session.user.email
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save about section')
            }

            await response.json()
            handleClose()
            refreshData()
            setToast({
                open: true,
                message: `About section ${isEdit ? 'updated' : 'created'} successfully`,
                severity: 'success'
            })
        } catch (error) {
            console.error('Error:', error)
            setToast({
                open: true,
                message: `Failed to ${isEdit ? 'update' : 'create'} about section`,
                severity: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEdit ? 'Edit About Section' : 'Add About Section'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="About"
                        fullWidth
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export function About({ about = null }) {
    console.log('About props:', about);
    const [openForm, setOpenForm] = useState(false)
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const hasAbout = about && about.length > 0
    const aboutContent = hasAbout ? about[0].content : ''

    console.log('hasAbout:', hasAbout);
    console.log('aboutContent:', aboutContent);

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">About</Typography>
                <Button
                    startIcon={hasAbout ? <EditIcon /> : <AddIcon />}
                    onClick={() => setOpenForm(true)}
                    variant="contained"
                    size="small"
                >
                    {hasAbout ? 'Edit' : 'Add About'}
                </Button>
            </Box>

            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {aboutContent || 'No information added yet.'}
            </Typography>

            <AboutForm
                modal={openForm}
                handleClose={() => setOpenForm(false)}
                initialContent={aboutContent}
                isEdit={hasAbout}
            />

            <Toast
                open={toast.open}
                handleClose={() => setToast(prev => ({ ...prev, open: false }))}
                message={toast.message}
                severity={toast.severity}
            />
        </Paper>
    )
} 