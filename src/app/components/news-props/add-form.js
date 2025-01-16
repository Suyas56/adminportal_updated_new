import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { useSession } from 'next-auth/client'
import React, { useState } from 'react'
import { AddAttachments as AddImage } from './../common-props/add-image'
import { AddAttachments } from './../common-props/add-attachment'
import { fileUploader } from './../common-props/useful-functions'
import { BroadcastMail } from './../common-props/send-broadcast-mail'

export const AddForm = ({ handleClose, modal }) => {
    const [session, loading] = useSession()
    const [content, setContent] = useState({
        title: '',
        openDate: '',
        closeDate: '',
        description: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const [broadcastMail, setBroadcastMail] = useState({
        broadcast: false,
        mail: 'divyap.ug19.cs@nitp.ac.in', //"students@nitp.ac.in"
    })

    const [attachments, setAttachments] = useState([])
    const [add_attach, setAdd_attach] = useState([])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
        //console.log(content)
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()
        let open = new Date(content.openDate)
        let close = new Date(content.closeDate)
        open = open.getTime()
        close = close.getTime()
        let now = Date.now()

        let data = {
            ...content,
            id: now,
            openDate: open,
            closeDate: close,
            timestamp: now,
            email: session.user.email,
            author: session.user.name,
            image: [...attachments],
            add_attach: [...add_attach],
        }
        for (let i = 0; i < data.image.length; i++) {
            delete data.image[i].value
            // console.log(data.image[i]);

            if (data.image[i].typeLink == false && data.image[i].url) {
                delete data.image[i].typeLink

                data.image[i].url = await fileUploader(data.image[i])
            } else {
                delete data.image[i].typeLink
                console.log('NOT A FILE')
            }
        }

        for (let i = 0; i < data.add_attach.length; i++) {
            delete data.add_attach[i].value
            // console.log(data.add_attach[i]);

            if (
                data.add_attach[i].typeLink == false &&
                data.add_attach[i].url
            ) {
                delete data.add_attach[i].typeLink

                data.add_attach[i].url = await fileUploader(data.add_attach[i])
            } else {
                delete data.add_attach[i].typeLink
                console.log('NOT A FILE')
            }
        }

        console.log(data)

        let result = await fetch('/api/create/news', {
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

        // Broadcast after news is created
        if (broadcastMail.broadcast) {
            let data = {
                type: 'news',
                email: broadcastMail.mail,
                news: 'result',
            }
            let result = await fetch('/api/broadcast', {
                method: 'POST',
                body: JSON.stringify(data),
            })
            result = await result.json()
            if (result instanceof Error) {
                alert('Event created but an error occured while sending mail')
                console.log(result)
            }
        }

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
                        Add News
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            id="label"
                            label="Title"
                            name="title"
                            type="text"
                            required
                            fullWidth
                            placeholder="Title"
                            onChange={(e) => handleChange(e)}
                            value={content.title}
                        />
                        <TextField
                            margin="dense"
                            id="desc"
                            label="Description"
                            type="text"
                            fullWidth
                            placeholder={'Description'}
                            name="description"
                            required
                            onChange={(e) => handleChange(e)}
                            value={content.description}
                        />
                        <TextField
                            margin="dense"
                            id="openDate"
                            label="Open Date"
                            name="openDate"
                            type="date"
                            required
                            value={content.openDate}
                            onChange={(e) => handleChange(e)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            id="closeDate"
                            label="Close Date"
                            name="closeDate"
                            margin="dense"
                            required
                            type="date"
                            onChange={(e) => handleChange(e)}
                            value={content.closeDate}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <BroadcastMail
                            broadcastMail={broadcastMail}
                            setBroadcastMail={setBroadcastMail}
                        />

                        <h2>Attachments</h2>
                        <AddImage
                            attachments={attachments}
                            setAttachments={setAttachments}
                            limit={1}
                        />
                        <AddAttachments
                            attachments={add_attach}
                            setAttachments={setAdd_attach}
                        />
                        {/* <a href={data.attachments} target="_blank">
							<FontAwesomeIcon icon={faExternalLinkAlt} />
						</a> */}
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
