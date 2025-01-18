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

    const deleteInnovation = async () => {
        try {
            setIsDeleting(true)
            const result = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id, 
                    type: "innovation"
                }),
            });

            if (!result.ok) {
                throw new Error('Failed to delete innovation');
            }

            window.location.reload();
        } catch (error) {
            console.error('Error deleting innovation:', error);
            alert('Failed to delete innovation. Please try again.');
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
                Do you want to Delete This Innovation?
            </DialogTitle>

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={deleteInnovation}
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
