import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Paper,
    CircularProgress
} from '@mui/material';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export function AboutYouPage() {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/about?email=${session?.user?.email}`);
                if (!res.ok) throw new Error('Failed to fetch About You data');
                const data = await res.json();
                setContent(data.content || "");
            } catch (error) {
                console.error('Error fetching About You:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) {
            fetchContent();
        }
    }, [session]);

    const handleSave = async (newContent) => {
        try {
            const res = await fetch('/api/about', {
                method: 'PUT', // Changed from POST to PUT for updating data
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session?.user?.email,
                    content: newContent
                })
            });

            if (!res.ok) throw new Error('Failed to save About You');

            setContent(newContent);
        } catch (error) {
            console.error('Error saving About You:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">About You</Typography>
                <div>
                    <Button startIcon={<EditIcon />} variant="contained" onClick={() => setOpenEdit(true)}>
                        Edit
                    </Button>
                </div>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <Paper style={{ padding: '1rem', margin: '1rem' }}>
                    <Typography variant="body1">{content || "No information provided yet."}</Typography>
                </Paper>
            )}

            {openEdit && (
                <EditAboutDialog
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    initialContent={content}
                    onSave={(newContent) => {
                        handleSave(newContent);
                        setOpenEdit(false);
                    }}
                />
            )}
        </div>
    );
}

function EditAboutDialog({ open, onClose, initialContent, onSave }) {
    const [formContent, setFormContent] = useState(initialContent);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        onSave(formContent);
        setSubmitting(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit About You</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        margin="normal"
                        label="Write about yourself (max 1000 words)"
                        inputProps={{ maxLength: 1000 }}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={submitting} variant="contained" startIcon={<SaveIcon />}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
