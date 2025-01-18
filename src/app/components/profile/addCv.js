import { 
    Button, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { AddPic } from './addpic'

export const AddCv = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [attachments, setAttachments] = useState([{ url: '', value: '' }])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            // Get the uploaded CV URL from attachments
            const cvUrl = attachments[0]?.url
            if (!cvUrl) {
                throw new Error('Please upload a CV first')
            }

            // Update user profile with CV URL
            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'profile',
                    email: session.user.email,
                    cv: cvUrl
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            handleClose()
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            setError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add CV</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <AddPic
                        attachments={attachments}
                        setAttachments={setAttachments}
                        attachmentTypes="application/pdf"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
