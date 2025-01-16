import { Checkbox, FormControlLabel } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { MainAttachment } from './../common-props/main-attachment'
import { useSession } from 'next-auth/client'
import React, { useState } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import { fileUploader } from './../common-props/useful-functions'
import { FormControl } from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import { administrationList } from '@/lib/const'
import { BroadcastMail } from './../common-props/send-broadcast-mail'

export const AddForm = ({ handleClose, modal }) => {
    const [session, loading] = useSession()
    const [content, setContent] = useState({
        title: '',
        openDate: '',
        closeDate: '',
        department: '',
        isVisible: true,
        important: false,
        notice_type: 'department',
    })

    const [broadcastMail, setBroadcastMail] = useState({
        broadcast: false,
        mail: 'students@nitp.ac.in', //"students@nitp.ac.in"
    })

    const [attachments, setAttachments] = useState([])
    const [mainAttachment, setMainAttachment] = useState({
        url: undefined,
        value: undefined,
        typeLink: false,
    })
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        if (e.target.name == 'important' || e.target.name == 'isVisible') {
            setContent({ ...content, [e.target.name]: e.target.checked })
        } else {
            setContent({ ...content, [e.target.name]: e.target.value })
        }
        // console.log(content);
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        let open = new Date(content.openDate)
        let close = new Date(content.closeDate)
        open = open.getTime()
        close = close.getTime()
        let now = Date.now()

        let data = {
            ...content,
            id: now,
            isVisible: content.isVisible ? 1 : 0,
            important: content.important ? 1 : 0,
            notice_type:
                session.user.role == 4
                    ? session.user.administration
                    : content.notice_type,
            department:
                session.user.role == 1
                    ? content.department
                    : session.user.department,
            openDate: open,
            closeDate: close,
            timestamp: now,
            main_attachment: mainAttachment,
            email: session.user.email,
            attachments: [...attachments],
        }

        for (let i = 0; i < data.attachments.length; i++) {
            delete data.attachments[i].value

            // if (data.attachments[i].url === undefined) {
            // 	data.attachments[i].url = "";
            // }
            console.log(data.attachments[i])

            if (
                data.attachments[i].typeLink == false &&
                data.attachments[i].url
            ) {
                delete data.attachments[i].typeLink

                data.attachments[i].url = await fileUploader(
                    data.attachments[i]
                )
            } else {
                delete data.attachments[i].typeLink
                console.log('NOT A FILE')
            }
        }
        delete data.main_attachment.value
        if (!data.main_attachment.typeLink) {
            data.main_attachment.url = await fileUploader(data.main_attachment)
        }
        // data.attachments = JSON.stringify(data.attachments);
        console.log(data)

        let result = await fetch('/api/create/notice', {
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
            // console.log(result);
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
                        Add Notice
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

                        {session &&
                            content.notice_type == 'department' &&
                            session.user.role == 1 && (
                                <FormControl
                                    style={{
                                        margin: `10px auto`,
                                        width: `100%`,
                                    }}
                                    required
                                >
                                    <InputLabel id="department">
                                        Department
                                    </InputLabel>
                                    <Select
                                        labelId="branch"
                                        autoWidth
                                        id="branch"
                                        name="department"
                                        value={content.department}
                                        onChange={(e) => handleChange(e)}
                                        input={<Input />}
                                    >
                                        <MenuItem value="Computer Science and Engineering">
                                            Computer Science and Engineering
                                        </MenuItem>
                                        <MenuItem value="Electronics & Communication Engineering">
                                            Electronics & Communication
                                            Engineering
                                        </MenuItem>
                                        <MenuItem value="Electrical Engineering">
                                            Electrical Engineering
                                        </MenuItem>
                                        <MenuItem value="Mechanical Engineering">
                                            Mechanical Engineering
                                        </MenuItem>
                                        <MenuItem value="Civil Engineering">
                                            Civil Engineering
                                        </MenuItem>
                                        <MenuItem value="Physics">
                                            Physics
                                        </MenuItem>
                                        <MenuItem value="Chemistry">
                                            Chemistry
                                        </MenuItem>
                                        <MenuItem value="Mathematics">
                                            Mathematics
                                        </MenuItem>
                                        <MenuItem value="Architecture">
                                            Architecture
                                        </MenuItem>
                                        <MenuItem value="Humanities & Social Sciences">
                                            Humanities & Social Sciences
                                        </MenuItem>
                                        <MenuItem value="Mechatronics and  Automation Engineering">
                                        Mechatronics and  Automation Engineering
                                        </MenuItem>
                                        <MenuItem value="Materials Science and  Engineering">
                                        Materials Science and  Engineering
                                        </MenuItem>
                                        <MenuItem value="Chemical Engineering and Technology">
                                        Chemical Engineering and Technology
                                        </MenuItem>
                                        
                                        
                                    </Select>
                                </FormControl>
                            )}
                        <MainAttachment
                            mainAttachment={mainAttachment}
                            setMainAttachment={setMainAttachment}
                            placeholder="Main Notice Link/Attach(less than 1mb* or add Link)"
                        />

                        <BroadcastMail
                            broadcastMail={broadcastMail}
                            setBroadcastMail={setBroadcastMail}
                        />

                        <h2>Attachments (less than 1 mb)</h2>
                        <AddAttachments
                            attachments={attachments}
                            setAttachments={setAttachments}
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
