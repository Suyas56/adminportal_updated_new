import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Loading from '../common/Loading'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add'
import { format } from 'date-fns';
// Add formatDate helper function at the top
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        activity_description: '',
        start_date: null,
        end_date: null,
        institute_name: 'National Institute of Technology, Patna'
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }
    const formatDateToMySQL = (date) => {
        if (!date) return null;
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day} 00:00:00`;
      };

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()
        if (!content.start_date) {
            alert('Start date is required');
            setSubmitting(false);
            return;
        }

        if (!content.end_date && content.end_date !== "Continue") {
            alert('End date or "Continue" must be selected');
            setSubmitting(false);
            return;
        }
        try {
            const formattedStartDate = format(content.start_date, 'yyyy-MM-dd');
            const formattedEndDate = content.end_date ? format(content.end_date, 'yyyy-MM-dd') : null;
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'department_activities',
                  ...content,
                  // Format start_date and end_date to 'YYYY-MM-DD' for DATE or 'YYYY-MM-DD HH:MM:SS' for DATETIME
                  start_date: content.start_date 
                    ? formatDateToMySQL(new Date(content.start_date).toLocaleDateString().split("T")[0])  // Format as 'YYYY-MM-DD'
                    : null,
                  end_date: content.end_date?content.end_date === "Continue"?"Continue"
                    : formatDateToMySQL(new Date(content.end_date).toLocaleDateString().split("T")[0])  // Format as 'YYYY-MM-DD'
                    : null,
                  id: Date.now().toString(),
                  email: session?.user?.email,
                }),
              });
              

            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            refreshData()
            setContent(initialState)
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }



    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Department Activity</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Activity Description"
                        name="activity_description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={content.activity_description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Institute Name"
                        name="institute_name"
                        fullWidth
                        required
                        value={content.institute_name}
                        onChange={handleChange}
                        size="medium"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        
                        <DatePicker
                            label="Start Date"
                           value={content.start_date}
                            onChange={(newValue) => 
                                setContent({ ...content, start_date: newValue})
                            }
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}  
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date === "Continue" ? null : content.end_date}
                            onChange={(newValue) =>
                                setContent({ ...content, end_date: newValue })
                            }
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={content.end_date === "Continue"}
                                    onChange={(e) => 
                                        setContent({
                                            ...content,
                                            end_date: e.target.checked ? "Continue" : null,
                                        })
                                    }
                                />
                            }
                            label="Continue"
                        />

                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Edit Form Component
export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession()
    // Parse dates when initializing content
    const [content, setContent] = useState({
        ...values,
        start_date: values.start_date ? new Date(values.start_date) : null,
        end_date: values.end_date ? new Date(values.end_date) : null
    })
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true);
        e.preventDefault();
       
        try {
            const formatToISODate = (date) => {
                if (!date) return null;
                return new Date(date).toLocaleDateString('en-CA', { timeZone: 'UTC' }); // 'YYYY-MM-DD' format
            };
    
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'department_activities',
                    ...content,
                    start_date: formatToISODate(content.start_date),
                    end_date: content.end_date === "Continue" 
                        ? "Continue" 
                        : formatToISODate(content.end_date),
                    id: Date.now().toString(),
                    email: session?.user?.email,
                }),
            });
    
            if (!result.ok) throw new Error('Failed to create');
    
            handleClose();
            refreshData();
            setContent(initialState);
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };
    
    
    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Department Activity</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Activity Description"
                        name="activity_description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        value={content.activity_description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Institute Name"
                        name="institute_name"
                        fullWidth
                        required
                        value={content.institute_name}
                        onChange={handleChange}
                        size="medium"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    start_date: newValue
                                }))
                            }}
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date === "Continue" ? null : content.end_date}
                            onChange={(newValue) =>
                                setContent({ ...content, end_date: newValue })
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={content.end_date === "Continue"}
                                    onChange={(e) => 
                                        setContent({
                                            ...content,
                                            end_date: e.target.checked ? "Continue" : null,
                                        })
                                    }
                                />
                            }
                            label="Continue"
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Main Component
export default function DepartmentActivityManagement() {
    const { data: session } = useSession()
    const [activities, setActivities] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    // Fetch data
    React.useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setActivities(data.department_activities || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchActivities()
        }
    }, [session, refreshData])

    const handleEdit = (activity) => {
        setSelectedActivity(activity)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'department_activities',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
            window.location.reload()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <Loading />

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Department Activities</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                >
                    Add Department Activity
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Activity Description</TableCell>
                            <TableCell>Institute Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities?.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell>{activity.activity_description}</TableCell>
                                <TableCell>{activity.institute_name?activity.institute_name:"-"}</TableCell>
                                <TableCell>
                                    {new Date(activity.start_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                </TableCell>
                                <TableCell>
                                {activity.end_date ? (activity.end_date === "Continue" ? "Continue" : new Date(activity.end_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })) : "Present"}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(activity)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(activity.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {activities?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No department activities found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddForm 
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedActivity && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedActivity(null)
                    }}
                    values={selectedActivity}
                />
            )}
        </div>
    )
}