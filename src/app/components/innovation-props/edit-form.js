import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from '@mui/material'
import { Delete, Link } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import React, { useRef, useState } from 'react'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'
import { AddAttachments } from './../common-props/add-attachment'
import { handleNewAttachments } from './../common-props/add-attachment'

export const EditForm = ({ data, handleClose, modal }) => {
    const deleteArray = useRef([])
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        description: data.description,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        type: data.type || 'general',
    })

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(true)
    }

    const [add_attach, setAdd_attach] = useState(() => {
        if (!data.image) return [];
        
        try {
            // Handle both string and already parsed data
            const imageData = typeof data.image === 'string' ? 
                JSON.parse(data.image) : 
                data.image;
                
            // Ensure we're working with an array
            return Array.isArray(imageData) ? imageData : [];
        } catch (e) {
            console.error('Error parsing image data:', e);
            return [];
        }
    });

    const [new_attach, setNew_attach] = useState([]);

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            let attachments = [...add_attach]
            if (new_attach.length) {
                const processedAttachments = await handleNewAttachments(new_attach)
                const newAttachmentsWithIds = processedAttachments.map(attachment => ({
                    id: Date.now() + Math.random(),
                    caption: attachment.caption,
                    url: attachment.url,
                    typeLink: attachment.typeLink
                }))
                attachments = [...attachments, ...newAttachmentsWithIds]
            }

            const finaldata = {
                id: content.id,
                title: content.title,
                description: content.description,
                openDate: new Date(content.openDate).getTime(),
                closeDate: new Date(content.closeDate).getTime(),
                type: content.type,
                updatedAt: Date.now(),
                updatedBy: session.user.email,
                image: JSON.stringify(attachments),
                deleteArray: deleteArray.current
            }

            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finaldata,
                    type: "innovation"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to update innovation')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error updating innovation:', error)
            alert('Failed to update innovation. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Edit Innovation
                    <IconButton
                        onClick={handleDelete}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            color: '#d32f2f'
                        }}
                    >
                        <Delete />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        type="text"
                        required
                        fullWidth
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        multiline
                        rows={4}
                        required
                        fullWidth
                        value={content.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Open Date"
                        name="openDate"
                        type="date"
                        required
                        fullWidth
                        value={content.openDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Close Date"
                        name="closeDate"
                        type="date"
                        required
                        fullWidth
                        value={content.closeDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={content.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="intranet">Intranet</MenuItem>
                        </Select>
                    </FormControl>

                    <DisplayAdditionalAttach
                        add_attach={add_attach}
                        setAdd_attach={setAdd_attach}
                        deleteArray={deleteArray}
                    />

                    <AddAttachments
                        attachments={new_attach}
                        setAttachments={setNew_attach}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>

            <ConfirmDelete
                handleClose={() => setVerifyDelete(false)}
                modal={verifyDelete}
                id={data.id}
            />
        </Dialog>
    )
}

const DisplayAdditionalAttach = ({ add_attach, setAdd_attach, deleteArray }) => {
    const deleteAttachment = (idx) => {
        const values = [...add_attach]
        const attachmentToDelete = values[idx]
        
        if (attachmentToDelete.id) {
            deleteArray.current = [...deleteArray.current, {
                id: attachmentToDelete.id,
                url: attachmentToDelete.url
            }]
        }
        
        values.splice(idx, 1)
        setAdd_attach(values)
    }

    return (
        <>
            {add_attach?.map((attachment, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px'
                    }}
                >
                    <TextField
                        type="text"
                        value={attachment.caption || ''}
                        fullWidth
                        label={`Attachment ${idx + 1}`}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        disabled
                    />
                    {attachment.url && (
                        <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#1976d2',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center' 
                            }}
                        >
                            <Link style={{ marginRight: '5px' }} />
                            View
                        </a>
                    )}
                    <Delete
                        onClick={() => deleteAttachment(idx)}
                        style={{
                            cursor: 'pointer',
                            color: '#d32f2f'
                        }}
                    />
                </div>
            ))}
        </>
    )
}
