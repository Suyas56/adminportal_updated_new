import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useSession } from 'next-auth/react';

export function AboutYouPage() {
    const { data: session, status } = useSession();
    const [content, setContent] = useState('');
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(() => {
        const savedContent = localStorage.getItem("aboutYou");
        if (savedContent){setContent(savedContent);}
    }, []);

    const handleSave = async (newContent) => {
        localStorage.setItem('aboutYou', newContent);
        if (!session?.user?.email) {
            console.error('User is not authenticated.');
            return;
        }
        try {
            const response = await fetch('/api/about', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type:"about_me",
                    email: session.user.email,
                    content: newContent,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Content saved to DB:', data);
            } else {
                console.error('Failed to save content to DB');
            }
            setContent(newContent);
            setOpenEdit(false);
        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">About You</Typography>
                <Button startIcon={<EditIcon />} variant="contained" onClick={() => setOpenEdit(true)}>
                    Edit
                </Button>
            </div>
            <Paper style={{ padding: '1rem', margin: '1rem' }}>
                <Typography variant="body1">{content || 'No information provided yet.'}</Typography>
            </Paper>
            {openEdit && (
                <EditAboutDialog open={openEdit} onClose={() => setOpenEdit(false)} initialContent={content} onSave={handleSave} />
            )}
        </div>
    );
}

function EditAboutDialog({ open, onClose, initialContent, onSave }) {
    const [formContent, setFormContent] = useState(initialContent);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formContent);
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
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}