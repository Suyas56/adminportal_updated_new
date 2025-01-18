import { 
    Button, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Box
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { convertToThumbnailUrl } from '@/lib/utils'

export const AddProfilePic = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState('')

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file)
                setPreview(URL.createObjectURL(file))
                setError('')
            } else {
                setError('Please select an image file')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            setError('Please select an image first')
            return
        }

        setSubmitting(true)
        try {
            // Upload file
            const formData = new FormData()
            formData.append('file', selectedFile)

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) throw new Error('Failed to upload image')
            
            // Parse the response properly
            const uploadData = await uploadResponse.json()
            if (!uploadData.success || !uploadData.id) {
                throw new Error('Invalid upload response')
            }

            const url = convertToThumbnailUrl(uploadData.id)
            
            // Update profile with image URL
            const updateResponse = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'profile',
                    email: session.user.email,
                    image: url
                }),
            })

            if (!updateResponse.ok) throw new Error('Failed to update profile')

            handleClose()
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            setError(error.message || 'Failed to update profile picture')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Update Profile Picture</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ my: 2 }}>
                        <input
                            accept="image/*"
                            type="file"
                            id="profile-pic-upload"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="profile-pic-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                disabled={submitting}
                            >
                                Choose Image
                            </Button>
                        </label>
                        {selectedFile && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    style={{ 
                                        maxWidth: '200px', 
                                        maxHeight: '200px',
                                        objectFit: 'contain' 
                                    }} 
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || !selectedFile}
                    >
                        {submitting ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
