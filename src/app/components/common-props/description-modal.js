import { Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import React from 'react'

export const DescriptionModal = ({ handleClose, modal, data }) => {
    return (
        <>
            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={modal}
            >
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Description
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>{data.description}</Typography>
                </DialogContent>
            </Dialog>
        </>
    )
}
