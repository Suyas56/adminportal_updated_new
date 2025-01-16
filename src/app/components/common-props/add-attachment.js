import React, { useMemo } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Delete } from '@material-ui/icons'
import { FormControlLabel, Checkbox } from '@material-ui/core'
import { randomBytes } from 'crypto'

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

{
    /* <button type="button" onClick={() => console.log(attachments)}>
				Status
			</button> */
}
export const handleNewAttachments = async (new_attach) => {
    for (let i = 0; i < new_attach.length; i++) {
        delete new_attach[i].value

        if (new_attach[i].typeLink == false && new_attach[i].url) {
            let file = new FormData()
            file.append('files', new_attach[i].url)
            // console.log(file.get("files"));
            let viewLink = await fetch('/api/gdrive/uploadfiles', {
                method: 'POST',
                body: file,
            })
            viewLink = await viewLink.json()
            // console.log("Client side link");
            // console.log(viewLink);
            new_attach[i].url = viewLink[0].webViewLink
        } else {
            console.log('NOT A FILE')
        }
    }
    return new_attach
}
