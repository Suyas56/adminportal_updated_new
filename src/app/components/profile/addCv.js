import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { AddAttachments } from './addpic'

export const AddCv = ({ handleClose, modal }) => {

    const { data: session } = useSession()

    const [submitting, setSubmitting] = useState(false)

    const [attachments, setAttachments] = useState([{ url: '', value: '' }])

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        let data = {
            email: session.user.email,

            cv: [...attachments],
        }
        for (let i = 0; i < data.cv.length; i++) {
            delete data.cv[i].value
            // if (data.cv[i].url === undefined) {
            // 	data.cv[i].url = "";
            // }
            console.log(data.cv[i])

            if (data.cv[i].url) {
                let file = new FormData()
                file.append('files', data.cv[i].url)
                // console.log(file.get("files"));
                let viewLink = await fetch('/api/gdrive/uploadfiles', {
                    method: 'POST',
                    body: file,
                })
                // https://drive.google.com/uc?export=view&id=${props.id}
                viewLink = await viewLink.json()
                // console.log("Client side link");
                console.log(viewLink)
                data.cv[
                    i
                ].url = `https://drive.google.com/open?authuser=0&sz=w320&id=${viewLink[0].id}`
            } else {
                console.log('Request Not Sent')
            }
        }
        // data.attachments = JSON.stringify(data.attachments);

        let result = await fetch('/api/create/cv', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(data),
        })
        result = await result.json()
        if (result instanceof Error) {
            console.log('Error Occured')
            console.log(result)
        }
        console.log(result)
        alert('CV uploaded successfully')
        window.location.reload()
    }

    return (
        <>
            <Dialog open={modal} onClose={handleClose}>
                <form
                    onSubmit={(e) => {
                        handleSubmit(e)
                    }}
                >
                    <DialogTitle disableTypography style={{ fontSize: `2rem` }}>
                        Add CV
                    </DialogTitle>
                    <DialogContent>
                        <AddAttachments
                            attachments={attachments}
                            setAttachments={setAttachments}
                            attachmentTypes={['application/pdf']}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting' : 'Submit'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}
