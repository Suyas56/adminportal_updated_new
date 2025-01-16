import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { Delete, Link } from '@material-ui/icons'
import { useSession } from 'next-auth/client'
import React, { useRef, useState } from 'react'
import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'
import { handleNewAttachments } from './../common-props/add-attachment'
import { AddAttachments as AddImages } from './../common-props/add-image'
import { AddAttachments } from './../common-props/add-attachment'

export const EditForm = ({ data, handleClose, modal }) => {
    const limit = 1
    const deleteArray = useRef([])
    const [session, loading] = useSession()
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        openDate: dateformatter(data.openDate),
        closeDate: dateformatter(data.closeDate),
        description: data.description,
    })
    const [submitting, setSubmitting] = useState(false)

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(false)
    }

    const [image, setImage] = useState(data.image)
    const [newImages, setNewImages] = useState([])

    const [add_attach, setAdd_attach] = useState(data.attachments || [])
    const [new_attach, setNew_attach] = useState([])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
        //console.log(content)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        let open = new Date(content.openDate)
        let close = new Date(content.closeDate)
        open = open.getTime()
        close = close.getTime()
        let now = Date.now()
        let new_image = [...newImages]
        new_image = await handleNewAttachments(new_image)
        let new_add_attach = await handleNewAttachments(new_attach)

        let finaldata = {
            ...content,
            openDate: open,
            closeDate: close,
            timestamp: now,
            email: session.user.email,
            author: session.user.name,
            image: [...image, ...new_image],
            add_attach: [...add_attach, ...new_add_attach],
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
        let result = await fetch('/api/update/news', {
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
                        style={{ fontSize: `2rem`, position: 'relative' }}
                    >
                        Edit News
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
                        attachments={image}
                        add_attach={add_attach}
                        delArray={deleteArray.current}
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

                        <DisplayImages
                            deleteArray={deleteArray}
                            image={image}
                            setImage={setImage}
                        />
                        <DisplayAdditionalAttach
                            deleteArray={deleteArray}
                            add_attach={add_attach}
                            setAdd_attach={setAdd_attach}
                        />

                        {limit > image.length && (
                            <AddImages
                                limit={limit - image.length}
                                attachments={newImages}
                                setAttachments={setNewImages}
                            />
                        )}
                        <AddAttachments
                            attachments={new_attach}
                            setAttachments={setNew_attach}
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

const DisplayImages = ({ image, setImage, deleteArray }) => {
    const handleAttachments = (e, idx) => {
        let attach = [...image]
        attach[idx].caption = e.target.value
        setImage(attach)
    }
    const deleteAttachment = (idx) => {
        deleteArray.current.push(image[idx].url.split('/')[5])
        console.log(deleteArray.current)
        let atch = [...image]
        atch.splice(idx, 1)
        setImage(atch)
    }

    return (
        <>
            {image && (
                <>
                    <h2>Images</h2>
                    {image.map((img, idx) => {
                        return (
                            <div key={idx}>
                                <TextField
                                    id="attachments"
                                    margin="dense"
                                    type="text"
                                    value={img.caption}
                                    onChange={(e) => handleAttachments(e, idx)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <a href={img.url} target="_blank" rel="noreferrer">
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
                                        onClick={() => deleteAttachment(idx)}
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
        </>
    )
}

const DisplayAdditionalAttach = ({
    add_attach,
    setAdd_attach,
    deleteArray,
}) => {
    const handleAttachments = (e, idx) => {
        let attach = [...add_attach]
        attach[idx].caption = e.target.value
        setAdd_attach(attach)
    }
    const deleteAttachment = (idx) => {
        deleteArray.current.push(add_attach[idx].url.split('/')[5])
        console.log(deleteArray.current)
        let atch = [...add_attach]
        atch.splice(idx, 1)
        setAdd_attach(atch)
    }

    return (
        <>
            {add_attach.length > 0 && (
                <>
                    <h2>Additional Attachments</h2>
                    {add_attach.map((img, idx) => {
                        return (
                            <div key={idx}>
                                <TextField
                                    id="attachments"
                                    margin="dense"
                                    type="text"
                                    value={img.caption}
                                    onChange={(e) => handleAttachments(e, idx)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <a
                                    href={img.url}
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
                                        onClick={() => deleteAttachment(idx)}
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
        </>
    )
}
