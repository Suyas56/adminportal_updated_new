import {
    IconButton,
    TablePagination,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Tooltip,
    Chip
} from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Star as StarIcon,
    Description as DescriptionIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material'
import React, { useState, useEffect } from 'react'
import { AddForm } from './notices-props/add-form'
import { EditForm } from './notices-props/edit-form'
import { useSession } from 'next-auth/react'
import Filter from './common-props/filter'
import TablePaginationActions from './common-props/TablePaginationActions'

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '& .MuiCardContent-root': {
        flexGrow: 1,
        padding: theme.spacing(2)
    },
    '& .MuiCardActions-root': {
        padding: theme.spacing(1, 2)
    },
    '&:hover': {
        boxShadow: theme.shadows[4]
    }
}))

const Notice = ({ detail }) => {
    const [editModal, setEditModal] = useState(false)
    const { data: session } = useSession()
    const updatedAt = new Date(detail.updatedAt).toLocaleDateString('en-GB')
    const openDate = new Date(detail.openDate).toLocaleDateString('en-GB')

    return (
        <Grid item xs={12} sm={6} md={4}>
            <StyledCard>
                {detail.important && (
                    <Chip
                        icon={<StarIcon />}
                        label="Important"
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                )}
                <CardContent>
                    <Typography 
                        variant="subtitle1" 
                        component="h2"
                        sx={{ 
                            fontWeight: 500,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {detail.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Updated: {updatedAt}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Open Date: {openDate}
                    </Typography>
                    {detail.attachments?.length > 0 && (
                        <Box display="flex" alignItems="center" mt={1}>
                            <AttachFileIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                {detail.attachments.length} attachment{detail.attachments.length > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
                <CardActions>
                    <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    {session?.user?.role === 'SUPER_ADMIN' && (
                        <Tooltip title="Edit Notice">
                            <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => setEditModal(true)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </CardActions>
            </StyledCard>

            <EditForm
                data={detail}
                modal={editModal}
                handleClose={() => setEditModal(false)}
            />
        </Grid>
    )
}

function DataDisplay({ data: initialData }) {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [details, setDetails] = useState(
        initialData ? 
        [...initialData].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) 
        : []
    )
    const [filterQuery, setFilterQuery] = useState(null)
    const [addModal, setAddModal] = useState(false)

    useEffect(() => {
        if (!filterQuery) {
            fetch('/api/notice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: page * rowsPerPage,
                    to: (page + 1) * rowsPerPage,
                    type: 'between'
                })
            })
            .then(res => res.json())
            .then(data => {
                const sortedData = [...data].sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                )
                setDetails(sortedData)
            })
            .catch(err => console.error('Error fetching notices:', err))
        } else {
            const sortedFilterData = [...filterQuery].sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )
            setDetails(sortedFilterData)
        }
    }, [page, rowsPerPage, filterQuery])

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Recent Notices
                </Typography>
                
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => setAddModal(true)}
                        sx={{ mr: 2 }}
                    >
                        ADD +
                    </Button>
                    <Filter type="notice" setEntries={setFilterQuery} />
                </Box>
            </Box>

            <Grid container spacing={3}>
                {details?.map((notice, index) => (
                    <Notice key={notice.id || index} detail={notice} />
                ))}
            </Grid>

            <Box mt={3}>
                <TablePagination
                    component="div"
                    count={-1}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[15, 25, 50, 100]}
                    ActionsComponent={TablePaginationActions}
                />
            </Box>

            <AddForm 
                modal={addModal}
                handleClose={() => setAddModal(false)}
            />
        </Box>
    )
}

export default DataDisplay
