import TextField from '@material-ui/core/TextField'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import React from 'react'

export const BroadcastMail = ({ broadcastMail, setBroadcastMail }) => {
    const handleEmailSend = (e) => {
        setBroadcastMail({
            ...broadcastMail,
            broadcast: !broadcastMail.broadcast,
        })
    }

    const handleChangeEmail = (e) => {
        setBroadcastMail({
            ...broadcastMail,
            mail: e.target.value,
        })
    }

    return (
        <>
            <div>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={broadcastMail.broadcast}
                            onChange={handleEmailSend}
                            name="broadcast"
                            color="primary"
                        />
                    }
                    style={{ width: `20%` }}
                    label="Broadcast"
                />
                <div style={{ display: 'flex' }}>
                    {broadcastMail.broadcast && (
                        <TextField
                            name="email"
                            type="email"
                            value={broadcastMail.mail}
                            style={{ margin: `8px` }}
                            onChange={(e) => {
                                handleChangeEmail(e)
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
