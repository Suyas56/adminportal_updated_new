import { Checkbox, FormControlLabel } from '@material-ui/core'
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
import { UpdateMainAttachment } from './../common-props/update-main-attachment'
import { FormControl } from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import { administrationList } from '@/lib/const'
import { fileUploader } from './../common-props/useful-functions'

import { dateformatter } from './../common-props/date-formatter'
import { ConfirmDelete } from './confirm-delete'

export const EditForm = ({ data, handleClose, modal }) => {
    const deleteArray = useRef([])

    const [session, loading] = useSession()
    const [content, setContent] = useState({
        id: data.id,
        title: data.title,
        openDate: dateformatter(data.openDate),
        main_attachment: JSON.parse(data.notice_link) || {},
        closeDate: dateformatter(data.closeDate),
        notice_type: data.notice_type,
        isVisible: data.isVisible ? true : false,
        important: data.important ? true : false,
    })

    const [verifyDelete, setVerifyDelete] = useState(false)
    const handleDelete = () => {
        setVerifyDelete(false)
    }

    const [attachments, setAttachments] = useState(data.attachments)
    const [submitting, setSubmitting] = useState(false)
    const [newAttachments, setNewAttachments] = useState([])

    const [updateMainAttachment, setUpdateMainAttachment] = useState(false)
    const [newMainAttachment, setNewMainAttachment] = useState({})

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
        if (attachments[idx].url)
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
        open = open.getTime()
        close = close.getTime()
        let now = Date.now()
        let new_attach = [...newAttachments]
        new_attach = await handleNewAttachments(new_attach)
        let new_main_attach = newMainAttachment

        if (updateMainAttachment && new_main_attach.url) {
            // delete old file and upload new one
            deleteArray.current.push(content.main_attachment.url.split('/')[5])
            if (!new_main_attach.typeLink) {
                new_main_attach.url = await fileUploader(new_main_attach)
            }
        } else {
            console.log('no update')
            new_main_attach = content.main_attachment
        }
        console.log(new_main_attach)

        let finaldata = {
            ...content,

            isVisible: content.isVisible ? 1 : 0,
            important: content.important ? 1 : 0,
            openDate: open,
            closeDate: close,
            timestamp: now,
            main_attachment: new_main_attach,
            email: session.user.email,
            attachments: [...attachments, ...new_attach],
        }

        console.log(finaldata)

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
        let result = await fetch('/api/update/notice', {
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
                <form
                    onSubmit={(e) => {
                        handleSubmit(e)
                    }}
                >
                    <DialogTitle
                        disableTypography
                        style={{ fontSize: `2rem`, position: 'relative' }}
                    >
                        Edit Notice
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
                        main_notice={content.main_attachment}
                        delArray={deleteArray.current}
                        attachments={attachments}
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="important"
                                    checked={content.important}
                                    onChange={(e) => handleChange(e)}
                                />
                            }
                            label="Important"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isVisible"
                                    checked={content.isVisible}
                                    onChange={(e) => handleChange(e)}
                                />
                            }
                            label="Visibility"
                        />

                        <FormControl
                            style={{ margin: `10px auto`, width: `100%` }}
                            required
                        >
                            <InputLabel id="demo-dialog-select-label30">
                                Notice Type
                            </InputLabel>

                            {session.user.role == 1 && (
                                <Select
                                    labelId="demo-dialog-select-label30"
                                    id="demo-dialog-select30"
                                    name="notice_type"
                                    fullWidth
                                    value={content.notice_type}
                                    onChange={(e) => handleChange(e)}
                                    input={<Input />}
                                >
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="department">
                                        Department
                                    </MenuItem>
                                    {[...administrationList].map(
                                        ([key, value]) => (
                                            <MenuItem value={key}>
                                                {value}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            )}
                        </FormControl>
                        {content.main_attachment && (
                            <>
                                <h2>Main Attachment</h2>

                                <div>
                                    <TextField
                                        placeholder="SubTitle for main attachment"
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
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="UpdateMainAttachment"
                                            checked={updateMainAttachment}
                                            onChange={(e) =>
                                                setUpdateMainAttachment(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="Edit Main Attachment"
                                />
                                {updateMainAttachment && (
                                    <UpdateMainAttachment
                                        attachment={newMainAttachment}
                                        setAttachment={setNewMainAttachment}
                                    />
                                )}
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
