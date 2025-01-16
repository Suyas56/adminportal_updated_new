import TextField from '@material-ui/core/TextField'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import React from 'react'

export const MainAttachment = ({
    mainAttachment,
    setMainAttachment,
    placeholder,
}) => {
    const handleType = (e) => {
        setMainAttachment({
            ...mainAttachment,
            typeLink: !mainAttachment.typeLink,
            url: undefined,
            value: undefined,
        })
    }
    const handleChange = (e) => {
        setMainAttachment({
            ...mainAttachment,
            [e.target.name]: e.target.value,
        })
    }

    const handleChangeFile = (e) => {
        setMainAttachment({
            ...mainAttachment,
            url: e.target.files[0],
            value: e.target.value,
        })
    }

    return (
        <>
            <div>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={mainAttachment.typeLink}
                            onChange={handleType}
                            name="isLink"
                            color="primary"
                        />
                    }
                    style={{ width: `20%` }}
                    label="Link"
                />
                <div style={{ display: 'flex' }}>
                    {mainAttachment.typeLink ? (
                        <TextField
                            placeholder="File Link"
                            name="url"
                            required
                            onChange={(e) => handleChange(e)}
                            style={{ margin: `8px`, width: `90%` }}
                        />
                    ) : (
                        <TextField
                            type="file"
                            name="url"
                            value={mainAttachment.value}
                            style={{ margin: `8px` }}
                            onChange={(e) => {
                                handleChangeFile(e)
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
