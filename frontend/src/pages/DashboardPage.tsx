import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { 
  Add, 
  Campaign, 
  TrendingUp, 
  People, 
  AccountBalance,
  Redeem,
  History,
  Star
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Mock data for admin view
  const adminStats = {
    totalCampaigns: 12,
    activeCampaigns: 8,
    totalParticipants: 156,
    totalPoints: 1250000
  }

  const recentCampaigns = [
    { id: '1', name: 'Premium Line Sales', progress: 75, participants: 45 },
    { id: '2', name: 'Q4 Regional Goals', progress: 60, participants: 32 },
    { id: '3', name: 'Holiday Special', progress: 90, participants: 28 }
  ]

  // Mock data for user view
  const userCampaigns = [
    { 
      id: '1', 
      name: 'Premium Line Sales', 
      progress: 65, 
      pointsEarned: 850, 
      pointsGoal: 1200,
      status: 'Active'
    },
    { 
      id: '2', 
      name: 'Q4 Regional Goals', 
      progress: 40, 
      pointsEarned: 320, 
      pointsGoal: 800,
      status: 'Active'
    }
  ]

  const userPointBalances = [
    { type: 'Premium Points', balance: 850, currency: 'PP' },
    { type: 'Regional Points', balance: 320, currency: 'RP' },
    { type: 'Bonus Points', balance: 150, currency: 'BP' }
  ]

  const recentTransactions = [
    { 
      id: '1', 
      type: 'Accrual', 
      points: 50, 
      campaign: 'Premium Line Sales', 
      date: '2024-01-08',
      description: 'Sales target achievement'
    },
    { 
      id: '2', 
      type: 'Redemption', 
      points: -100, 
      campaign: 'Premium Line Sales', 
      date: '2024-01-07',
      description: 'Gift card redemption'
    },
    { 
      id: '3', 
      type: 'Accrual', 
      points: 25, 
      campaign: 'Q4 Regional Goals', 
      date: '2024-01-06',
      description: 'Weekly goal bonus'
    }
  ]

  const redemptionOffers = [
    { id: '1', title: 'Amazon Gift Card', points: 500, available: true },
    { id: '2', title: 'Apple Store Credit', points: 750, available: true },
    { id: '3', title: 'Premium Membership', points: 1000, available: false }
  ]

  const isAdmin = user?.role === 'ADMIN'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.firstName || user?.email}!
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/campaigns/create')}
            sx={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            Create Campaign
          </Button>
        )}
      </Box>

      {isAdmin ? (
        // Admin Dashboard
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Campaign sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {adminStats.totalCampaigns}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Campaigns
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {adminStats.activeCampaigns}
                      </Typography>
                      <Typography color="text.secondary">
                        Active Campaigns
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {adminStats.totalParticipants}
                      </Typography>
                      <Typography color="text.secondary">
                        Participants
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {adminStats.totalPoints.toLocaleString()}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Points
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Campaigns
              </Typography>
              <Grid container spacing={2}>
                {recentCampaigns.map((campaign) => (
                  <Grid item xs={12} md={4} key={campaign.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {campaign.name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={campaign.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {campaign.participants} participants
                        </Typography>
                        <Button 
                          size="small" 
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        // User Dashboard
        <>
          {/* Point Balances */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userPointBalances.map((balance, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="h4" component="div">
                          {balance.balance}
                        </Typography>
                        <Typography color="text.secondary">
                          {balance.type}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* My Campaigns */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Campaigns
                  </Typography>
                  {userCampaigns.map((campaign) => (
                    <Card key={campaign.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {campaign.name}
                          </Typography>
                          <Chip 
                            label={campaign.status} 
                            color="success" 
                            size="small"
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress: {campaign.pointsEarned} / {campaign.pointsGoal} points
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={campaign.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Redemption Offers */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Redeem sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Available Rewards
                  </Typography>
                  {redemptionOffers.map((offer) => (
                    <Card key={offer.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {offer.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {offer.points} points
                        </Typography>
                        <Button 
                          size="small" 
                          variant={offer.available ? "contained" : "outlined"}
                          disabled={!offer.available}
                          fullWidth
                          sx={offer.available ? { 
                            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                            }
                          } : {}}
                        >
                          {offer.available ? 'Redeem' : 'Not Available'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Transactions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Transactions
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Campaign</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.type}
                            color={transaction.type === 'Accrual' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.campaign}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={transaction.points > 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default DashboardPage