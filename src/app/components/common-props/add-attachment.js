import React, { useMemo } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Delete } from '@material-ui/icons'
import { FormControlLabel, Checkbox } from '@mui/material'

export const AddAttachments = ({ attachments, setAttachments, limit }) => {
    function handleChange(i, event) {
        const values = [...attachments]
        values[i].caption = event.target.value
        setAttachments(values)
    }
    function handleChangeFile(i, event) {
        const values = [...attachments]
        values[i].url = event.target.files[0]
        values[i].value = event.target.value
        setAttachments(values)
    }

    function handleAdd() {
        const values = [...attachments]
        values.push({
            id: Date.now(),
            caption: '',
            url: undefined,
            value: undefined,
            typeLink: false,
        })
        setAttachments(values)
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    function handleType(i) {
        const values = [...attachments]
        let val = {
            typeLink: !values[i].typeLink,
            url: undefined,
            value: undefined,
        }
        values.splice(i, 1, val)
        setAttachments(values)
    }

    function handleLink(i, event) {
        const values = [...attachments]
        values[i].url = event.target.value
        setAttachments(values)
    }

    const DisplayAttachments = attachments.map((attachment, idx) => {
        return (
            <div key={`${attachment.id}`}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={attachment.typeLink}
                            onChange={() => handleType(idx)}
                            name="typeLink"
                            color="primary"
                        />
                    }
                    style={{ width: `20%` }}
                    label="Link"
                />
                <TextField
                    placeholder="SubTitle"
                    name="caption"
                    value={attachment.caption}
                    fullWidth
                    onChange={(e) => handleChange(idx, e)}
                    style={{ margin: `8px`, display: 'inline' }}
                />
                <div style={{ display: 'flex' }}>
                    {attachment.typeLink ? (
                        <TextField
                            placeholder="File Link"
                            name="link"
                            value={attachment.url ?? ''}
                            onChange={(e) => handleLink(idx, e)}
                            style={{ margin: `8px`, width: `90%` }}
                        />
                    ) : (
                        <TextField
                            type="file"
                            name="url"
                            files={attachment.url}
                            style={{ margin: `8px` }}
                            onChange={(e) => {
                                handleChangeFile(idx, e)
                            }}
                        />
                    )}

                    <Button
                        type="button"
                        onClick={() => {
                            handleRemove(idx)
                        }}
                        style={{ display: `inline-block`, fontSize: `1.5rem` }}
                    >
                        <Delete color="secondary" />{' '}
                    </Button>
                </div>
            </div>
        )
    })

    return (
        <div style={{ marginTop: `8px` }}>
            <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={() => handleAdd()}
                disabled={
                    limit ? (attachments.length < limit ? false : true) : false
                }
            >
                + Additional Attachments
            </Button>
            {DisplayAttachments}
        </div>
    )
}

export const handleNewAttachments = async (new_attach) => {
    for (let i = 0; i < new_attach.length; i++) {
        delete new_attach[i].value;

        // If it's not a link and it's a file, upload the file
        if (new_attach[i].typeLink === false && new_attach[i].url) {
            let file = new FormData();
            file.append('file', new_attach[i].url);

            try {
                let response = await fetch('/api/upload', {
                    method: 'POST',
                    body: file,
                });

                if (!response.ok) {
                    throw new Error('File upload failed');
                }

                let data = await response.json();
                // Update the attachment with the webViewLink
                new_attach[i].url = data.url; // This will now be the webViewLink from Google Drive
            } catch (error) {
                console.error('File upload error:', error);
                new_attach[i].url = ''; // Set it to empty if there was an error
            }
        } else {
            console.log('NOT A FILE, It is a link');
        }
    }

    return new_attach;
};
