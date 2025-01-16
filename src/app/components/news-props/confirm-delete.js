import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import React from 'react'

export const ConfirmDelete = ({
    handleClose,
    modal,
    id,
    attachments,
    add_attach,
    delArray,
}) => {
    const deleteEvent = async () => {
        const deleteArray = [...delArray]

        if (attachments.length) {
            for (let i = 0; i < attachments.length; i++) {
                const element = attachments[i]
                if (element.url) deleteArray.push(element.url.split('/')[5])
            }
        }

        if (add_attach.length) {
            for (let i = 0; i < add_attach.length; i++) {
                const element = add_attach[i]
                if (element.url && element.url.split('/')[5])
                    deleteArray.push(element.url.split('/')[5])
            }
        }

        if (deleteArray.length) {
            let result = await fetch('/api/gdrive/deletefiles', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deleteArray),
            })
            result = await result.json()
            if (result instanceof Error) {
                console.log('Error Occured')
            }
            console.log(result)
        }

        let result = await fetch('/api/delete/news', {
            method: 'DELETE',
            body: id.toString(),
        })
        result = await result.json()
        if (result instanceof Error) {
            console.log('Error Occured')
            console.log(result)
        }
        console.log(result)

        window.location.reload()
    }

    return (
        <div>
            <Dialog open={modal} onClose={handleClose}>
                <DialogTitle id="alert-dialog-title">
                    {'Do you want to Delete This News ?'}
                </DialogTitle>

                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => deleteEvent()}
                        color="secondary"
                    >
                        Delete
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
