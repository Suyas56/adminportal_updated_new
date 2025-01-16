import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Delete } from '@material-ui/icons'
import React from 'react'

export const AddAttachments = ({
    attachments,
    setAttachments,
    attachmentTypes,
}) => {
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

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    return (
        <>
            {attachments.map((attachment, idx) => {
                return (
                    <React.Fragment key={`${attachment}-${idx}`}>
                        <TextField
                            type="file"
                            name="url"
                            value={attachment.value}
                            style={{ margin: `8px` }}
                            inputProps={{ accept: `${attachmentTypes}` }}
                            onChange={(e) => {
                                handleChangeFile(idx, e)
                            }}
                        />

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
                    </React.Fragment>
                )
            })}
            {/* <button type="button" onClick={() => console.log(attachments)}>
				Status
			</button> */}
        </>
    )
}
