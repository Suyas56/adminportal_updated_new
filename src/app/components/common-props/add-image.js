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
        values[i].typeLink = false
        setAttachments(values)
    }

    function handleChangeLink(i, event) {
        const values = [...attachments]
        values[i].url = event.target.value
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
            typeLink: false
        })
        setAttachments(values)
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    function handleTypeLink(i) {
        const values = [...attachments]
        values[i].typeLink = !values[i].typeLink
        values[i].url = undefined
        values[i].value = undefined
        setAttachments(values)
    }

    const DisplayAttachments = useMemo(() => {
        return attachments.map((field, idx) => {
            return (
                <div key={field.id} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <TextField
                        label={`Image ${idx + 1}`}
                        type="text"
                        value={field.caption || ''}
                        onChange={(e) => handleChange(idx, e)}
                        fullWidth
                        margin="dense"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={field.typeLink || false}
                                onChange={() => handleTypeLink(idx)}
                            />
                        }
                        label="Link"
                    />
                    <TextField
                        type={field.typeLink ? "text" : "file"}
                        onChange={(e) => field.typeLink ? handleChangeLink(idx, e) : handleChangeFile(idx, e)}
                        value={field.value || ''}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={field.typeLink ? {} : {
                            accept: 'image/*'
                        }}
                    />
                    <Delete
                        onClick={() => handleRemove(idx)}
                        style={{
                            cursor: 'pointer',
                            color: '#d32f2f',
                            marginTop: '20px'
                        }}
                    />
                </div>
            )
        })
    }, [attachments])

    return (
        <div style={{ marginTop: '8px' }}>
            <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={() => handleAdd()}
                disabled={limit ? (attachments.length < limit ? false : true) : false}
            >
                + Add Images
            </Button>
            {DisplayAttachments}
        </div>
    )
}

export const handleNewImages = async (new_images) => {
    for (let i = 0; i < new_images.length; i++) {
        delete new_images[i].value;

        if (new_images[i].typeLink === false && new_images[i].url) {
            let file = new FormData();
            file.append('file', new_images[i].url);

            try {
                let response = await fetch('/api/upload', {
                    method: 'POST',
                    body: file,
                });

                if (!response.ok) {
                    throw new Error('Image upload failed');
                }

                let data = await response.json();
                new_images[i].url = data.url;
            } catch (error) {
                console.error('Image upload error:', error);
                new_images[i].url = '';
            }
        }
    }

    return new_images;
};
