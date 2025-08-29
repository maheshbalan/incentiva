import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material'
import { 
  Campaign, 
  EmojiEvents, 
  Redeem, 
  TrendingUp, 
  AccountBalance,
  Close
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'

interface UserCampaign {
  id: string
  currentPoints: number
  goalProgress?: number
  campaign: {
    id: string
    name: string
    description?: string
    startDate: string
    endDate: string
    status: string
    individualGoal?: number
    overallGoal?: number
  }
}

interface CampaignTransaction {
  id: string
  pointsEarned: number
  transactionData: any
  processedAt: string
}

interface RedemptionItem {
  id: string
  name: string
  description: string
  pointCost: number
  available: boolean
}

const ParticipantDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [userCampaigns, setUserCampaigns] = useState<UserCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<UserCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  
  // Simulated data for now
  const [transactions, setTransactions] = useState<CampaignTransaction[]>([])
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([])
  const [openRedemptionDialog, setOpenRedemptionDialog] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionItem | null>(null)
  const [redemptionQuantity, setRedemptionQuantity] = useState(1)

  useEffect(() => {
    if (!authLoading && user) {
      if (campaignId) {
        // Load specific campaign data
        loadCampaignData(campaignId)
      } else {
        // Load all user campaigns
        fetchUserCampaigns()
      }
    }
  }, [authLoading, user, campaignId])

  const fetchUserCampaigns = async () => {
    try {
      setLoading(true)
      const response = await authService.api.get('/participants/campaigns')
      setUserCampaigns(response.data.data || [])
      
      // If we have campaigns and one is selected, set it
      if (response.data.data && response.data.data.length > 0) {
        setSelectedCampaign(response.data.data[0])
      }
    } catch (err: any) {
      console.error('Error fetching user campaigns:', err)
      setError(err.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignData = async (campaignId: string) => {
    try {
      setLoading(true)
      // Load campaign progress
      const progressResponse = await authService.api.get(`/participants/${campaignId}/progress`)
      const campaignData = progressResponse.data.data
      
      // Find the campaign in userCampaigns or create a mock one
      const campaign = userCampaigns.find(uc => uc.campaign.id === campaignId) || {
        id: 'temp',
        currentPoints: campaignData.currentPoints || 0,
        goalProgress: campaignData.goalProgress || 0,
        campaign: campaignData.campaign || { id: campaignId, name: 'Campaign', status: 'ACTIVE' }
      }
      
      setSelectedCampaign(campaign)
      
      // Load simulated transactions and redemption items
      loadSimulatedData(campaignId)
    } catch (err: any) {
      console.error('Error loading campaign data:', err)
      setError(err.message || 'Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  const loadSimulatedData = (campaignId: string) => {
    // Simulated transactions
    const mockTransactions = [
      {
        id: '1',
        pointsEarned: 500,
        transactionData: { invoiceId: 'INV-001', amount: 5000, product: 'Premium Tires' },
        processedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '2',
        pointsEarned: 300,
        transactionData: { invoiceId: 'INV-002', amount: 3000, product: 'Standard Tires' },
        processedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: '3',
        pointsEarned: 800,
        transactionData: { invoiceId: 'INV-003', amount: 8000, product: 'Premium Tires' },
        processedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ]
    
    // Simulated redemption items
    const mockRedemptionItems = [
      {
        id: '1',
        name: 'Gift Card - Amazon',
        description: '$50 Amazon gift card',
        pointCost: 5000,
        available: true
      },
      {
        id: '2',
        name: 'Gift Card - Walmart',
        description: '$100 Walmart gift card',
        pointCost: 10000,
        available: true
      },
      {
        id: '3',
        name: 'Premium Coffee Mug',
        description: 'Incentiva branded coffee mug',
        pointCost: 1000,
        available: true
      },
      {
        id: '4',
        name: 'Company Swag Pack',
        description: 'T-shirt, hat, and stickers',
        pointCost: 2000,
        available: true
      }
    ]
    
    setTransactions(mockTransactions)
    setRedemptionItems(mockRedemptionItems)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRedemption = (item: RedemptionItem) => {
    setSelectedRedemption(item)
    setRedemptionQuantity(1)
    setOpenRedemptionDialog(true)
  }

  const confirmRedemption = () => {
    if (selectedRedemption && selectedCampaign) {
      // Simulate redemption
      alert(`Redemption successful! ${selectedRedemption.name} redeemed for ${selectedRedemption.pointCost * redemptionQuantity} points.`)
      setOpenRedemptionDialog(false)
      setSelectedRedemption(null)
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

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Please log in to view your dashboard.</Alert>
      </Box>
    )
  }

  if (campaignId && !selectedCampaign) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Campaign not found or you are not enrolled.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 160,
            height: 60,
            backgroundColor: '#FF6B35',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          Incentiva
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Welcome, {user.firstName || user.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Participant Dashboard
          </Typography>
        </Box>
      </Box>

      {!campaignId ? (
        // Show all enrolled campaigns
        <Box>
          <Typography variant="h5" gutterBottom>Your Enrolled Campaigns</Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : userCampaigns.length === 0 ? (
            <Alert severity="info">You are not enrolled in any campaigns yet.</Alert>
          ) : (
            <Grid container spacing={3}>
              {userCampaigns.map((userCampaign) => (
                <Grid item xs={12} md={6} lg={4} key={userCampaign.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 }
                    }}
                    onClick={() => navigate(`/participant/campaigns/${userCampaign.campaign.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {userCampaign.campaign.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {userCampaign.campaign.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current Points: <strong>{userCampaign.currentPoints.toLocaleString()}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Goal Progress: <strong>{typeof userCampaign.goalProgress === 'number' ? userCampaign.goalProgress.toFixed(1) : '0.0'}%</strong>
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={typeof userCampaign.goalProgress === 'number' ? userCampaign.goalProgress : 0} 
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={userCampaign.campaign.status} 
                          color={userCampaign.campaign.status === 'ACTIVE' ? 'success' : 'default'}
                          size="small"
                        />
                        <Chip 
                          label={`${formatDate(userCampaign.campaign.startDate)} - ${formatDate(userCampaign.campaign.endDate)}`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        // Show specific campaign dashboard
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {selectedCampaign?.campaign.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Campaign Dashboard
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/participant/campaigns')}
            >
              Back to Campaigns
            </Button>
          </Box>

          {/* Campaign Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {selectedCampaign?.currentPoints.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {typeof selectedCampaign?.goalProgress === 'number' ? selectedCampaign.goalProgress.toFixed(1) : '0.0'}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Goal Progress
                  </Typography>
                </CardContent>
              </Card>
            
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {selectedCampaign?.campaign.individualGoal ? 
                      formatCurrency(selectedCampaign.campaign.individualGoal) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Individual Goal
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Campaign sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {transactions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Goal Progress</Typography>
              <LinearProgress 
                variant="determinate" 
                value={selectedCampaign?.goalProgress || 0} 
                sx={{ height: 20, borderRadius: 10 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedCampaign?.currentPoints.toLocaleString()} / {selectedCampaign?.campaign.individualGoal ? 
                  formatCurrency(selectedCampaign.campaign.individualGoal) : 'Goal'} 
                ({typeof selectedCampaign?.goalProgress === 'number' ? selectedCampaign.goalProgress.toFixed(1) : '0.0'}%)
              </Typography>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Transactions" icon={<TrendingUp />} />
                <Tab label="Redemption" icon={<Redeem />} />
              </Tabs>

              {/* Transactions Tab */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                  {transactions.length === 0 ? (
                    <Alert severity="info">No transactions found.</Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Points Earned</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.processedAt)}</TableCell>
                              <TableCell>{transaction.transactionData.invoiceId}</TableCell>
                              <TableCell>{transaction.transactionData.product}</TableCell>
                              <TableCell>{formatCurrency(transaction.transactionData.amount)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`+${transaction.pointsEarned}`} 
                                  color="success" 
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* Redemption Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Available Rewards</Typography>
                  <Grid container spacing={2}>
                    {redemptionItems.map((item) => (
                      <Grid item xs={12} md={6} lg={4} key={item.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" color="primary">
                                {item.pointCost.toLocaleString()} pts
                              </Typography>
                              <Button
                                variant="contained"
                                onClick={() => handleRedemption(item)}
                                disabled={!item.available || (selectedCampaign?.currentPoints || 0) < item.pointCost}
                                sx={{
                                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                                  }
                                }}
                              >
                                Redeem
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Redemption Dialog */}
      <Dialog 
        open={openRedemptionDialog} 
        onClose={() => setOpenRedemptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Redeem Reward</Typography>
            <IconButton onClick={() => setOpenRedemptionDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRedemption && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedRedemption.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedRedemption.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Point Cost: <strong>{selectedRedemption.pointCost.toLocaleString()} points</strong>
                </Typography>
                <Typography variant="body1">
                  Available Points: <strong>{selectedCampaign?.currentPoints.toLocaleString()} points</strong>
                </Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Quantity</InputLabel>
                <Select
                  value={redemptionQuantity}
                  onChange={(e) => setRedemptionQuantity(e.target.value as number)}
                  label="Quantity"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="h6" color="primary">
                Total Cost: {(selectedRedemption.pointCost * redemptionQuantity).toLocaleString()} points
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRedemptionDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmRedemption}
            variant="contained"
            disabled={!selectedRedemption || (selectedCampaign?.currentPoints || 0) < (selectedRedemption?.pointCost || 0) * redemptionQuantity}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            Confirm Redemption
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ParticipantDashboardPage
