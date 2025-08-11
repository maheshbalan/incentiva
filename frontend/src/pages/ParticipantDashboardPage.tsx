import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Campaign,
  Redeem,
  TrendingUp,
  AccountBalance,
  History,
  CheckCircle,
  Cancel,
  Schedule,
  Star
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { 
  Campaign as CampaignType, 
  UserCampaign, 
  TLPOffer, 
  TLPTransaction,
  TLPPointBalance 
} from '@incentiva/shared'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`participant-tabpanel-${index}`}
      aria-labelledby={`participant-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [openRedemptionDialog, setOpenRedemptionDialog] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<TLPOffer | null>(null)
  const [redemptionQuantity, setRedemptionQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data - in real app this would come from API
  const [userCampaigns, setUserCampaigns] = useState<UserCampaign[]>([
    {
      id: '1',
      userId: user?.id || '',
      campaignId: '1',
      currentPoints: 1250,
      goalProgress: 62.5,
      isEnrolled: true,
      enrolledAt: '2025-01-01T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      campaign: {
        id: '1',
        name: 'Premium Line Sales Campaign',
        description: 'Earn points by selling Premium Line products',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-06-30T00:00:00Z',
        status: 'ACTIVE',
        individualGoal: 200000,
        individualGoalCurrency: 'MXN',
        overallGoal: 2000000,
        overallGoalCurrency: 'MXN',
        createdById: '1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    }
  ])

  const [pointBalances, setPointBalances] = useState<TLPPointBalance[]>([
    {
      userId: user?.id || '',
      campaignId: '1',
      currentPoints: 1250,
      totalEarned: 1800,
      totalRedeemed: 550,
      lastUpdated: '2025-01-15T00:00:00Z'
    }
  ])

  const [transactions, setTransactions] = useState<TLPTransaction[]>([
    {
      id: '1',
      userId: user?.id || '',
      campaignId: '1',
      transactionType: 'ACCRUAL',
      points: 500,
      description: 'Premium Line sales achievement - January',
      transactionDate: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      userId: user?.id || '',
      campaignId: '1',
      transactionType: 'ACCRUAL',
      points: 300,
      description: 'Premium Line sales achievement - February',
      transactionDate: '2025-02-15T00:00:00Z'
    },
    {
      id: '3',
      userId: user?.id || '',
      campaignId: '1',
      transactionType: 'REDEMPTION',
      points: -200,
      description: 'Gift card redemption',
      transactionDate: '2025-01-20T00:00:00Z'
    },
    {
      id: '4',
      userId: user?.id || '',
      campaignId: '1',
      transactionType: 'ACCRUAL',
      points: 450,
      description: 'Premium Line sales achievement - March',
      transactionDate: '2025-03-15T00:00:00Z'
    },
    {
      id: '5',
      userId: user?.id || '',
      campaignId: '1',
      transactionType: 'REDEMPTION',
      points: -350,
      description: 'Product voucher redemption',
      transactionDate: '2025-02-25T00:00:00Z'
    }
  ])

  const [redemptionOffers, setRedemptionOffers] = useState<TLPOffer[]>([
    {
      id: '1',
      name: 'Amazon Gift Card',
      description: 'Redeem points for Amazon gift cards',
      pointCost: 200,
      imageUrl: '/gift-card-icon.png',
      isActive: true,
      redemptionLimit: 100,
      currentRedemptions: 45
    },
    {
      id: '2',
      name: 'Product Discount Voucher',
      description: 'Get 20% off on Premium Line products',
      pointCost: 500,
      imageUrl: '/discount-icon.png',
      isActive: true,
      redemptionLimit: 50,
      currentRedemptions: 12
    },
    {
      id: '3',
      name: 'Extra Vacation Days',
      description: 'Convert points to additional vacation days',
      pointCost: 1000,
      imageUrl: '/vacation-icon.png',
      isActive: true,
      redemptionLimit: 20,
      currentRedemptions: 8
    },
    {
      id: '4',
      name: 'Training Program Access',
      description: 'Access to premium training programs',
      pointCost: 750,
      imageUrl: '/training-icon.png',
      isActive: true,
      redemptionLimit: 30,
      currentRedemptions: 15
    }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRedemption = (offer: TLPOffer) => {
    setSelectedOffer(offer)
    setRedemptionQuantity(1)
    setOpenRedemptionDialog(true)
  }

  const processRedemption = async () => {
    if (!selectedOffer) return

    setIsProcessing(true)
    
    try {
      // In real app, this would call the TLP API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Update local state
      const newTransaction: TLPTransaction = {
        id: Date.now().toString(),
        userId: user?.id || '',
        campaignId: selectedOffer.id,
        transactionType: 'REDEMPTION',
        points: -(selectedOffer.pointCost * redemptionQuantity),
        description: `Redeemed ${redemptionQuantity}x ${selectedOffer.name}`,
        transactionDate: new Date().toISOString()
      }
      
      setTransactions([newTransaction, ...transactions])
      
      // Update point balance
      setPointBalances(prev => prev.map(balance => 
        balance.campaignId === selectedOffer.id
          ? { ...balance, currentPoints: balance.currentPoints - (selectedOffer.pointCost * redemptionQuantity) }
          : balance
      ))
      
      setOpenRedemptionDialog(false)
      setSelectedOffer(null)
    } catch (error) {
      console.error('Redemption failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === 'ACCRUAL' ? <TrendingUp color="success" /> : <Redeem color="error" />
  }

  const getTransactionColor = (type: string) => {
    return type === 'ACCRUAL' ? 'success' : 'error'
  }

  const totalPoints = pointBalances.reduce((sum, balance) => sum + balance.currentPoints, 0)
  const totalEarned = pointBalances.reduce((sum, balance) => sum + balance.totalEarned, 0)
  const totalRedeemed = pointBalances.reduce((sum, balance) => sum + balance.totalRedeemed, 0)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Participant Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back, {user?.firstName || user?.email}! Track your campaign progress and redeem your points.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalPoints.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Points
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalEarned.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Earned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Redeem color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalRedeemed.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Redeemed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Campaign color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {userCampaigns.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Campaigns
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="participant tabs">
          <Tab label="My Campaigns" />
          <Tab label="Redemption Options" />
          <Tab label="Transaction History" />
        </Tabs>
      </Box>

      {/* My Campaigns Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {userCampaigns.map((userCampaign) => (
            <Grid item xs={12} key={userCampaign.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {userCampaign.campaign?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {userCampaign.campaign?.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={userCampaign.campaign?.status}
                      color={userCampaign.campaign?.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Campaign Period
                      </Typography>
                      <Typography variant="body2">
                        {new Date(userCampaign.campaign?.startDate || '').toLocaleDateString()} - {new Date(userCampaign.campaign?.endDate || '').toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Individual Goal
                      </Typography>
                      <Typography variant="body2">
                        {userCampaign.campaign?.individualGoal?.toLocaleString()} {userCampaign.campaign?.individualGoalCurrency}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        Progress: {userCampaign.currentPoints.toLocaleString()} points
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userCampaign.goalProgress.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={userCampaign.goalProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      size="small"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Redeem />}
                      size="small"
                    >
                      Redeem Points
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Redemption Options Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {redemptionOffers.map((offer) => (
            <Grid item xs={12} md={6} key={offer.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                    >
                      {offer.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {offer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {offer.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          {offer.pointCost.toLocaleString()} points
                        </Typography>
                        <Chip
                          label={`${offer.currentRedemptions}/${offer.redemptionLimit}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Redeem />}
                        onClick={() => handleRedemption(offer)}
                        disabled={!offer.isActive || offer.currentRedemptions >= offer.redemptionLimit}
                        sx={{
                          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                          }
                        }}
                      >
                        Redeem Now
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Transaction History Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTransactionIcon(transaction.transactionType)}
                          <Chip
                            label={transaction.transactionType}
                            color={getTransactionColor(transaction.transactionType) as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={transaction.transactionType === 'ACCRUAL' ? 'success.main' : 'error.main'}
                        >
                          {transaction.transactionType === 'ACCRUAL' ? '+' : ''}{transaction.points.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircle />}
                          label="Completed"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Redemption Dialog */}
      <Dialog open={openRedemptionDialog} onClose={() => setOpenRedemptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Redeem {selectedOffer?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedOffer?.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Point Cost
              </Typography>
              <Typography variant="h5" color="primary">
                {selectedOffer ? (selectedOffer.pointCost * redemptionQuantity).toLocaleString() : 0} points
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={redemptionQuantity}
              onChange={(e) => setRedemptionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 10 }}
              sx={{ mb: 2 }}
            />

            <Alert severity="info">
              <Typography variant="body2">
                You have {totalPoints.toLocaleString()} points available. 
                This redemption will cost {(selectedOffer?.pointCost || 0) * redemptionQuantity} points.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRedemptionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={processRedemption}
            variant="contained"
            disabled={isProcessing || !selectedOffer || (selectedOffer.pointCost * redemptionQuantity) > totalPoints}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            {isProcessing ? 'Processing...' : 'Confirm Redemption'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ParticipantDashboardPage
