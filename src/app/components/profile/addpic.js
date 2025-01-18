import { Button, IconButton, CircularProgress } from '@mui/material'
import { Delete } from '@mui/icons-material'
import React, { useState } from 'react'

export const AddPic = ({
    attachments,
    setAttachments,
    attachmentTypes = "image/*",
    onUploadComplete
}) => {
    const [uploading, setUploading] = useState(false)

    async function handleChangeFile(i, event) {
        const file = event.target.files[0]
        if (!file) return

        setUploading(true)
        const values = [...attachments]
        values[i].value = event.target.value

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()
            values[i].url = data.url
            setAttachments(values)
            
            if (onUploadComplete) {
                onUploadComplete(data.url)
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload file')
        } finally {
            setUploading(false)
        }
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    return (
        <div style={{ marginTop: '1rem' }}>
            {attachments.map((attachment, idx) => (
                <div key={`${attachment}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        disabled={uploading}
                    >
                        {uploading ? <CircularProgress size={20} /> : 'Choose File'}
                        <input
                            type="file"
                            hidden
                            accept={attachmentTypes}
                            onChange={(e) => handleChangeFile(idx, e)}
                        />
                    </Button>
                    
                    {attachment.value && (
                        <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>
                            {attachment.value.split('\\').pop()}
                        </span>
                    )}

                    <IconButton
                        onClick={() => handleRemove(idx)}
                        color="error"
                        size="small"
                        disabled={uploading}
                    >
                        <Delete />
                    </IconButton>
                </div>
            ))}
        </div>
    )
}
