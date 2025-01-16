import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { Delete, Link } from '@material-ui/icons'
import { useSession } from 'next-auth/client'
import React, { useRef, useState } from 'react'
import {
    AddAttachments,
    handleNewAttachments,
} from './../common-props/add-attachment'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'

export const EditForm = ({ data, handleClose, modal }) => {
    const deleteArray = useRef([])
    const [session, loading] = useSession()
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        doclink: data.doclink,
        main_attachment: JSON.parse(data.event_link) || {},
        venue: data.venue,
        eventStartDate: dateformatter(data.eventStartDate),
        eventEndDate: dateformatter(data.eventEndDate),
    })

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(false)
    }
    const [attachments, setAttachments] = useState(data.attachments)
    const [submitting, setSubmitting] = useState(false)

    const [newAttachments, setNewAttachments] = useState([])

    const handleChange = (e) => {
        if (e.target.name == 'important' || e.target.name == 'isVisible') {
            setContent({ ...content, [e.target.name]: e.target.checked })
        } else {
            setContent({ ...content, [e.target.name]: e.target.value })
        }
        // console.log(content);
    }

    const handleAttachments = (e, idx) => {
        let attach = [...attachments]
        attach[idx].caption = e.target.value
        setAttachments(attach)
    }

    const deleteAttachment = (idx) => {
        deleteArray.current.push(attachments[idx].url.split('/')[5])
        console.log(deleteArray.current)
        let atch = [...attachments]
        atch.splice(idx, 1)
        setAttachments(atch)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        let open = new Date(content.openDate)
        let close = new Date(content.closeDate)
        let eventStart = new Date(content.eventStartDate)
        let eventEnd = new Date(content.eventEndDate)
        open = open.getTime()
        close = close.getTime()
        eventStart = eventStart.getTime()
        eventEnd = eventEnd.getTime()
        let now = Date.now()
        let new_attach = [...newAttachments]
        new_attach = await handleNewAttachments(new_attach)

        let finaldata = {
            ...content,
            openDate: open,
            closeDate: close,
            eventStartDate: eventStart,
            eventEndDate: eventEnd,
            main_attachment: { ...content.main_attachment },
            timestamp: now,
            email: session.user.email,
            attachments: [...attachments, ...new_attach],
        }

        if (deleteArray.current.length) {
            let result = await fetch('/api/gdrive/deletefiles', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deleteArray.current),
            })
            result = await result.json()
            if (result instanceof Error) {
                console.log('Error Occured')
            }
            console.log(result)
        }

        console.log(finaldata)
        let result = await fetch('/api/update/event', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(finaldata),
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
        <>
            <Dialog open={modal} onClose={handleClose}>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <DialogTitle
                        disableTypography
                        style={{ fontSize: `2rem`, position: `relative` }}
                    >
                        Edit Event
                        <i
                            style={{
                                position: `absolute`,
                                right: `15px`,
                                cursor: `pointer`,
                            }}
                        >
                            <Delete
                                type="button"
                                onClick={() => setVerifyDelete(true)}
                                style={{ height: `2rem`, width: `auto` }}
                                color="secondary"
                            />
                        </i>
                    </DialogTitle>
                    <ConfirmDelete
                        modal={verifyDelete}
                        handleClose={handleDelete}
                        id={content.id}
                        attachments={attachments}
                        delArray={deleteArray.current}
                        main_event={content.main_attachment}
                    />
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
                            id="openDate"
                            label="Open Date"
                            name="openDate"
                            type="date"
                            required
                            value={content.openDate}
                            onChange={(e) => handleChange(e)}
                            fullWidth
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
                        />
                        <TextField
                            margin="dense"
                            id="eventStartDate"
                            label="Event Start Date"
                            name="eventStartDate"
                            type="date"
                            required
                            value={content.eventStartDate}
                            onChange={(e) => handleChange(e)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            id="eventEndDate"
                            label="Event End Date"
                            name="eventEndDate"
                            margin="dense"
                            required
                            type="date"
                            onChange={(e) => handleChange(e)}
                            value={content.eventEndDate}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            margin="dense"
                            id="venue"
                            label="Venue"
                            type="text"
                            fullWidth
                            placeholder={'Venue of Event'}
                            name="venue"
                            type="text"
                            required
                            onChange={(e) => handleChange(e)}
                            value={content.venue}
                        />
                        <TextField
                            margin="dense"
                            id="Doclink"
                            label="Registration form link (like: Google Doc, etc.) "
                            type="text"
                            fullWidth
                            placeholder={'Leave it blank if not available'}
                            name="doclink"
                            type="text"
                            onChange={(e) => handleChange(e)}
                            value={content.doclink}
                        />

                        {content.main_attachment && (
                            <>
                                <h2>Main Attachment</h2>

                                <div>
                                    <TextField
                                        id="attachments"
                                        margin="dense"
                                        type="text"
                                        value={content.main_attachment.caption}
                                        onChange={(e) =>
                                            setContent({
                                                ...content,
                                                main_attachment: {
                                                    ...content.main_attachment,
                                                    caption: e.target.value,
                                                },
                                            })
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                    <a
                                        href={content.main_attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Link />
                                    </a>
                                </div>
                            </>
                        )}

                        {data.attachments && (
                            <>
                                <h2>Attachments</h2>
                                {attachments.map((attachment, idx) => {
                                    return (
                                        <div key={idx}>
                                            <TextField
                                                id="attachments"
                                                margin="dense"
                                                type="text"
                                                value={attachment.caption}
                                                onChange={(e) =>
                                                    handleAttachments(e, idx)
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Link />
                                            </a>
                                            <i
                                                style={{
                                                    position: `absolute`,
                                                    right: `15px`,
                                                    cursor: `pointer`,
                                                }}
                                            >
                                                <Delete
                                                    type="button"
                                                    onClick={() =>
                                                        deleteAttachment(idx)
                                                    }
                                                    style={{
                                                        height: `2rem`,
                                                        width: `auto`,
                                                    }}
                                                    color="secondary"
                                                />
                                            </i>
                                        </div>
                                    )
                                })}
                            </>
                        )}

                        <AddAttachments
                            attachments={newAttachments}
                            setAttachments={setNewAttachments}
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
