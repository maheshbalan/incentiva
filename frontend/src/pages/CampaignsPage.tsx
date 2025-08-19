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
  Alert
} from '@mui/material'
import { Add, Visibility, Edit, PlayArrow, People, Receipt } from '@mui/icons-material'
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
                          onClick={() => navigate(`/campaigns/${campaign.id}/participants`)}
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
    </Box>
  )
}

export default CampaignsPage 