import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import { useSession } from 'next-auth/client'
import React, { useState, useEffect } from 'react'
import { AddAttachments } from './../common-props/add-attachment'
import useRefreshData from '@/custom-hooks/refresh'

export const AddSocialMediaForm = ({ handleClose, modal, links }) => {
    const [session, loading] = useSession()
    const refreshData = useRefreshData(false)
    const initialState = links

    const [content, setContent] = useState(links)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setContent(links)
    }, [links])

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
        // console.log(content)
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()
        let data = {
            ...content,
            update_social_media_links: true,
            email: session.user.email,
        }
        // data.attachments = JSON.stringify(data.attachments);

        let result = await fetch('/api/update/user', {
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
            // console.log(result)
        }
        // console.log(result)
        handleClose()
        refreshData()
        setSubmitting(false)
        setContent(initialState)
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
                        Add Social Media Links
                    </DialogTitle>
                    <DialogContent>
                        {content &&
                            Object.keys(content).map((key, index) => {
                                return (
                                    <TextField
                                        key={index}
                                        type="url"
                                        name={key}
                                        label={key}
                                        value={content[key]}
                                        onChange={handleChange}
                                        margin="normal"
                                        fullWidth
                                    />
                                )
                            })}
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
