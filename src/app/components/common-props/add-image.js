import { Checkbox, FormControlLabel } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Delete } from '@material-ui/icons'
import React from 'react'

export const AddAttachments = ({ attachments, setAttachments, limit }) => {
    // const [attachments, setAttachments] = useState([{ value: "", file: "" }]);

    function handleChange(i, event) {
        const values = [...attachments]
        values[i].caption = event.target.value
        setAttachments(values)
    }
    function handleChangeFile(i, event) {
        const values = [...attachments]
        values[i].url = event.target.files[0]
        values[i].value = event.target.value
        // console.log(event);
        setAttachments(values)
    }

    function handleAdd() {
        const values = [...attachments]
        values.push({ caption: '', url: '', value: '', typeLink: false })
        setAttachments(values)
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    function handleType(i) {
        const values = [...attachments]
        values[i].typeLink = !values[i].typeLink
        setAttachments(values)
    }

    function handleLink(i, event) {
        const values = [...attachments]
        values[i].url = event.target.value
        setAttachments(values)
    }

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
                + Title Thumbnail Image
            </Button>
            {attachments.map((attachment, idx) => {
                return (
                    <div key={`${attachment}-${idx}`}>
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
                                    name="url"
                                    value={attachment.url}
                                    onChange={(e) => handleLink(idx, e)}
                                    style={{ margin: `8px`, width: `90%` }}
                                />
                            ) : (
                                <TextField
                                    type="file"
                                    name="url"
                                    value={attachment.value}
                                    style={{ margin: `8px` }}
                                    onChange={(e) => {
                                        handleChangeFile(idx, e)
                                    }}
                                    inputProps={{ accept: 'image/*' }}
                                />
                            )}

                            <Button
                                type="button"
                                onClick={() => {
                                    handleRemove(idx)
                                }}
                                style={{
                                    display: `inline-block`,
                                    fontSize: `1.5rem`,
                                }}
                            >
                                <Delete color="secondary" />{' '}
                            </Button>
                        </div>
                    </div>
                )
            })}
            {/* <button type="button" onClick={() => console.log(attachments)}>
				Status
			</button> */}
        </div>
    )
}
