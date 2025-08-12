import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { ExpandMore, Refresh, PlayArrow, CheckCircle, Error, Schedule, Code, DataObject } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  campaignId: string
  participantId: string
  participantName: string
  productLine: string
  amount: number
  transactionDate: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRY'
  pointsEarned?: number
  actions: string[]
  actionResponse?: string
  metadata: Record<string, any>
}

const TransactionTablePage: React.FC = () => {
  const { id: campaignId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [actionResponse, setActionResponse] = useState('')

  useEffect(() => {
    if (campaignId) {
      fetchTransactions()
    }
  }, [campaignId])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: 'tx_001',
          campaignId: campaignId || '',
          participantId: 'p_001',
          participantName: 'John Sales',
          productLine: 'Premium',
          amount: 150000,
          transactionDate: '2024-01-15',
          status: 'COMPLETED',
          pointsEarned: 150,
          actions: ['Points Accrued', 'Goal Progress Updated'],
          actionResponse: 'Success: 150 points accrued to TLP account',
          metadata: {
            region: 'North',
            salesChannel: 'Direct',
            productCategory: 'Tires'
          }
        },
        {
          id: 'tx_002',
          campaignId: campaignId || '',
          participantId: 'p_002',
          participantName: 'Maria Rodriguez',
          productLine: 'Premium',
          amount: 200000,
          transactionDate: '2024-01-16',
          status: 'PROCESSING',
          pointsEarned: 200,
          actions: ['Points Accrued'],
          metadata: {
            region: 'South',
            salesChannel: 'Partner',
            productCategory: 'Tires'
          }
        },
        {
          id: 'tx_003',
          campaignId: campaignId || '',
          participantId: 'p_003',
          participantName: 'Carlos Silva',
          productLine: 'Standard',
          amount: 75000,
          transactionDate: '2024-01-17',
          status: 'FAILED',
          actions: ['Points Accrued'],
          actionResponse: 'Error: Product line Standard not eligible for Premium Line campaign',
          metadata: {
            region: 'East',
            salesChannel: 'Direct',
            productCategory: 'Tires'
          }
        }
      ]
      
      setTransactions(mockTransactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const processTransaction = async (transaction: Transaction) => {
    try {
      setProcessing(true)
      setSelectedTransaction(transaction)
      setShowActionDialog(true)
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update transaction status
      setTransactions(prev => prev.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, status: 'COMPLETED' as const, actions: [...tx.actions, 'Rules Engine Processing Complete'] }
          : tx
      ))
      
      setActionResponse('Success: Transaction processed by rules engine. Points accrued and goal progress updated.')
      
    } catch (err) {
      setActionResponse('Error: Failed to process transaction')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'PROCESSING':
        return 'warning'
      case 'COMPLETED':
        return 'success'
      case 'FAILED':
        return 'error'
      case 'RETRY':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Transaction Table
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTransactions}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/campaigns')}
          >
            Back to Campaigns
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Campaign Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and manage all transactions for this campaign. Process transactions through the rules engine to apply campaign rules and update participant progress.
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Participant</TableCell>
                  <TableCell>Product Line</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Points Earned</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Manage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {transaction.participantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {transaction.participantId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.productLine} 
                        size="small"
                        color={transaction.productLine === 'Premium' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.transactionDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        size="small"
                        color={getStatusColor(transaction.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.pointsEarned ? `${transaction.pointsEarned} pts` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        {transaction.actions.map((action, index) => (
                          <Chip 
                            key={index}
                            label={action} 
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {transaction.status === 'PENDING' && (
                          <Tooltip title="Process Transaction">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => processTransaction(transaction)}
                              disabled={processing}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowActionDialog(true)
                            }}
                          >
                            <DataObject />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={showActionDialog} 
        onClose={() => setShowActionDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Transaction Details: {selectedTransaction?.participantName}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Transaction Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>ID:</strong> {selectedTransaction.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Status:</strong> 
                      <Chip 
                        label={selectedTransaction.status} 
                        size="small"
                        color={getStatusColor(selectedTransaction.status) as any}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Product Line:</strong> {selectedTransaction.productLine}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {formatDate(selectedTransaction.transactionDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Points Earned:</strong> {selectedTransaction.pointsEarned || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Actions Taken
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedTransaction.actions.map((action, index) => (
                    <Chip 
                      key={index}
                      label={action} 
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              {selectedTransaction.actionResponse && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Action Response
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={selectedTransaction.actionResponse}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Metadata
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">
                      <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                      JSON Data
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={JSON.stringify(selectedTransaction.metadata, null, 2)}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {actionResponse && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Latest Action Response
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={actionResponse}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    color={actionResponse.includes('Error') ? 'error' : 'success'}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TransactionTablePage
