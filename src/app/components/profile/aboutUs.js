import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export function AboutYouPage() {
    const [content, setContent] = useState("");
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(() => {
        const savedContent = localStorage.getItem("aboutYou");
        if (savedContent) setContent(savedContent);
    }, []);

    const handleSave = (newContent) => {
        localStorage.setItem("aboutYou", newContent);
        setContent(newContent);
        setOpenEdit(false);
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
                <Typography variant="body1">{content || "No information provided yet."}</Typography>
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