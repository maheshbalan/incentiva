import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Add, Visibility, Edit, PlayArrow, People, Receipt, Close } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { CampaignStatus } from '@incentiva/shared'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'

interface Campaign {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: CampaignStatus
  individualGoal?: number
  overallGoal?: number
  createdAt: string
}

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Manage Participants dialog state
  const [openParticipantDialog, setOpenParticipantDialog] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedParticipantUsers, setSelectedParticipantUsers] = useState<any[]>([])
  const [currentParticipants, setCurrentParticipants] = useState<any[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchCampaigns()
    }
  }, [authLoading, user])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      // Use authenticated axios instance from authService
      console.debug('[CampaignsPage] Fetching campaigns...')
      const response = await authService.api.get('/campaigns')
      console.debug('[CampaignsPage] Campaigns response', response.status, response.data)
      setCampaigns(response.data.data || [])
    } catch (err: any) {
      console.error('[CampaignsPage] Error fetching campaigns:', err?.response?.status, err?.response?.data || err)
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        window.location.href = '/login'
        return
      }
      setError(err.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return 'default'
      case CampaignStatus.APPROVED:
        return 'warning'
      case CampaignStatus.ACTIVE:
        return 'success'
      case CampaignStatus.COMPLETED:
        return 'info'
      case CampaignStatus.CANCELLED:
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  // Manage Participants functions
  const handleManageParticipants = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setSelectedParticipantUsers([])
    // Load existing participants for this campaign
    authService.api
      .get(`/campaigns/${campaign.id}/participants`)
      .then(({ data }) => {
        const users = (data?.data || []).map((uc: any) => uc.user)
        setCurrentParticipants(users)
      })
      .catch((err) => {
        console.error('Failed to load campaign participants', err)
        setCurrentParticipants([])
      })
      .finally(() => setOpenParticipantDialog(true))
  }

  const handleAddParticipants = async (campaignId: string) => {
    try {
      for (const u of selectedParticipantUsers) {
        await authService.api.post(`/campaigns/${campaignId}/participants`, { userId: u.id })
      }
      // Refresh participants list and campaign counters
      const { data } = await authService.api.get(`/campaigns/${campaignId}/participants`)
      const users = (data?.data || []).map((uc: any) => uc.user)
      setCurrentParticipants(users)
      setSelectedParticipantUsers([])
      alert('Participants added successfully')
      fetchCampaigns()
    } catch (err) {
      console.error('Failed to add participants', err)
      alert('Failed to add participants')
    }
  }

  const handleRemoveParticipant = async (campaignId: string, userId: string) => {
    try {
      await authService.api.delete(`/campaigns/${campaignId}/participants/${userId}`)
      const { data } = await authService.api.get(`/campaigns/${campaignId}/participants`)
      const users = (data?.data || []).map((uc: any) => uc.user)
      setCurrentParticipants(users)
      fetchCampaigns()
    } catch (err) {
      console.error('Failed to remove participant', err)
      alert('Failed to remove participant')
    }
    }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Campaigns
        </Typography>
        <Typography>Initializing...</Typography>
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Campaigns
        </Typography>
        <Typography>Loading campaigns...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/campaigns/create')}
        >
          Create Campaign
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {campaigns.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
              No Campaigns Found
              </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You haven't created any campaigns yet. Start by creating your first campaign.
              </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate('/campaigns/create')}
            >
              Create Your First Campaign
            </Button>
            </CardContent>
          </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Individual Goal</TableCell>
                <TableCell>Overall Goal</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {campaign.name}
                      </Typography>
                      {campaign.description && (
                        <Typography variant="body2" color="text.secondary">
                          {campaign.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={campaign.status} 
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(campaign.individualGoal)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(campaign.overallGoal)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(campaign.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Campaign">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Campaign">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/campaigns/${campaign.id}/execute`)}
                      >
                        Execute
                      </Button>
                      <Tooltip title="Manage Participants">
                        <IconButton
                          size="small"
                          onClick={() => handleManageParticipants(campaign)}
                        >
                          <People />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Transactions">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/campaigns/${campaign.id}/transactions`)}
                        >
                          <Receipt />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Manage Participants Dialog */}
      <Dialog 
        open={openParticipantDialog} 
        onClose={() => setOpenParticipantDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Manage Participants - {selectedCampaign?.name}
            </Typography>
            <IconButton onClick={() => setOpenParticipantDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Current Participants</Typography>
            {currentParticipants.length === 0 ? (
              <Typography color="text.secondary">No participants yet</Typography>
            ) : (
              <List>
                {currentParticipants.map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemText
                      primary={`${participant.firstName || ''} ${participant.lastName || ''}`}
                      secondary={participant.email}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveParticipant(selectedCampaign!.id, participant.id)}
                      >
                        Remove
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipantDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CampaignsPage 