import { Typography } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
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
