import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { MainAttachment } from './../common-props/main-attachment';
import TextField from '@material-ui/core/TextField';
import { useSession } from 'next-auth/client';
import React, { useState } from 'react';
import { AddAttachments } from './../common-props/add-attachment';
import { fileUploader } from './../common-props/useful-functions';
import { BroadcastMail } from './../common-props/send-broadcast-mail';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export const AddForm = ({ handleClose, modal }) => {
    const [session, loading] = useSession();
    const [content, setContent] = useState({
        title: '',
        openDate: '',
        closeDate: '',
        venue: '',
        doclink: '',
        eventStartDate: '',
        eventEndDate: '',
        type: 'general', // New field for type
    });
    const [submitting, setSubmitting] = useState(false);

    const [attachments, setAttachments] = useState([]);
    const [mainAttachment, setMainAttachment] = useState({
        caption: '',
        url: '',
        value: '',
        typeLink: false,
    });

    const [broadcastMail, setBroadcastMail] = useState({
        broadcast: false,
        mail: 'students@nitp.ac.in',
    });

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        setSubmitting(true);
        e.preventDefault();
        
        // Convert dates to timestamps
        const open = new Date(content.openDate).getTime();
        const close = new Date(content.closeDate).getTime();
        const eventStart = new Date(content.eventStartDate).getTime();
        const eventEnd = new Date(content.eventEndDate).getTime();
        const now = Date.now();

        let data = {
            ...content,
            id: now,
            openDate: open,
            closeDate: close,
            eventStartDate: eventStart,
            eventEndDate: eventEnd,
            timestamp: now,
            email: session.user.email,
            main_attachment: mainAttachment,
            author: session.user.name,
            attachments: [...attachments],
        };

        for (let i = 0; i < data.attachments.length; i++) {
            delete data.attachments[i].value;
            if (!data.attachments[i].typeLink && data.attachments[i].url) {
                delete data.attachments[i].typeLink;
                data.attachments[i].url = await fileUploader(data.attachments[i]);
            }
        }

        delete data.main_attachment.value;
        if (!data.main_attachment.typeLink) {
            data.main_attachment.url = await fileUploader(data.main_attachment);
        }

        // Submit data to the API
        let result = await fetch('/api/create/event', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(data),
        });
        result = await result.json();
        if (result instanceof Error) {
            console.log('Error Occurred');
            console.log(result);
            window.location.reload();
        }

        // Broadcast after event is created
        if (broadcastMail.broadcast) {
            let data = {
                type: 'event',
                email: broadcastMail.mail,
                event: 'result',
            };
            let result = await fetch('/api/broadcast', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            result = await result.json();
            if (result instanceof Error) {
                alert('Event created but an error occurred while sending mail');
                console.log(result);
            }
        }

        window.location.reload();
    };

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle disableTypography style={{ fontSize: `2rem` }}>
                    Add Event
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        id="title"
                        label="Title"
                        name="title"
                        type="text"
                        required
                        fullWidth
                        placeholder="Title"
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        value={content.closeDate}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="eventStartDate"
                        label="Event Start Date"
                        name="eventStartDate"
                        type="date"
                        required
                        value={content.eventStartDate}
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        required
                        onChange={handleChange}
                        value={content.venue}
                    />
                    <TextField
                        margin="dense"
                        id="doclink"
                        label="Registration form link (like: Google Doc, etc.)"
                        type="text"
                        fullWidth
                        placeholder={'Leave it blank if not available'}
                        name="doclink"
                        onChange={handleChange}
                        value={content.doclink}
                    />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                            labelId="type-label"
                            id="type"
                            name="type"
                            value={content.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="intranet">Intranet</MenuItem>
                        </Select>
                    </FormControl>

                    <MainAttachment
                        mainAttachment={mainAttachment}
                        setMainAttachment={setMainAttachment}
                        placeholder="Main Event Link/Attach"
                    />

                    <BroadcastMail
                        broadcastMail={broadcastMail}
                        setBroadcastMail={setBroadcastMail}
                    />

                    <h2>Attachments</h2>
                    <AddAttachments
                        attachments={attachments}
                        setAttachments={setAttachments}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" color="primary" disabled={submitting}>
                        {submitting ? 'Submitting' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
