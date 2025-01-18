import { 
    Button,
    Dialog,
    DialogActions,
    DialogTitle 
} from '@mui/material'
import React, { useState } from 'react'

export const ConfirmDelete = ({
    handleClose,
    modal,
    id
}) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const deleteEvent = async () => {
        try {
            setIsDeleting(true)
            const result = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id, 
                    type: 'news'
                }),
            });

            if (!result.ok) {
                throw new Error('Failed to delete news');
            }

            window.location.reload();
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Failed to delete news. Please try again.');
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog 
            open={modal} 
            onClose={handleClose}
            PaperProps={{
                style: {
                    padding: '1rem'
                }
            }}
        >
            <DialogTitle>
                Do you want to Delete This News?
            </DialogTitle>

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={deleteEvent}
                    color="error"
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button 
                    onClick={handleClose} 
                    color="primary"
                    variant="outlined"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
