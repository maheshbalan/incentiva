import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { ExpandMore, PlayArrow, CheckCircle, Error, Schedule, Code, DataObject } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { CampaignStatus, RuleType } from '@incentiva/shared'

interface Campaign {
  id: string
  name: string
  description?: string
  status: CampaignStatus
  totalPointsMinted?: number
  eligibilityCriteria?: string
  rules: CampaignRule[]
}

interface CampaignRule {
  id: string
  ruleType: RuleType
  ruleDefinition: any
}

interface TLPArtifact {
  id: string
  type: 'POINT_TYPE' | 'POINT_ISSUE' | 'ACCRUAL_OFFER' | 'REDEMPTION_OFFER' | 'MEMBER'
  name: string
  description: string
  apiCall: string
  response: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  createdAt: string
}

interface TransactionSchema {
  tableName: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
}

const CampaignExecutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tlpArtifacts, setTlpArtifacts] = useState<TLPArtifact[]>([])
  const [transactionSchema, setTransactionSchema] = useState<TransactionSchema | null>(null)
  const [sqlArtifacts, setSqlArtifacts] = useState<{
    oneTimeLoad: string
    incrementalLoad: string
    schedule: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState({
    oneTimeLoad: new Date().toISOString().split('T')[0],
    incrementalLoad: 'daily',
    incrementalTime: '02:00'
  })

  const executionSteps = [
    'TLP Point Type & Value Creation',
    'Point Minting & Accrual Offers',
    'Redemption Offers Generation',
    'Member Creation',
    'Transaction Schema Analysis',
    'SQL Artifacts Generation',
    'Execution Complete'
  ]

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }
      const data = await response.json()
      setCampaign(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }

  const executeCampaign = async () => {
    try {
      setExecuting(true)
      setError(null)
      setCurrentStep(0)

      // Step 1: Create TLP Point Type and Point Value
      await executeStep1()
      setCurrentStep(1)

      // Step 2: Mint Points and Create Accrual Offers
      await executeStep2()
      setCurrentStep(2)

      // Step 3: Generate Redemption Offers
      await executeStep3()
      setCurrentStep(3)

      // Step 4: Create TLP Members
      await executeStep4()
      setCurrentStep(4)

      // Step 5: Analyze Transaction Schema
      await executeStep5()
      setCurrentStep(5)

      // Step 6: Generate SQL Artifacts
      await executeStep6()
      setCurrentStep(6)

      // Update campaign status
      await updateCampaignStatus(CampaignStatus.ACTIVE)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaign execution failed')
    } finally {
      setExecuting(false)
    }
  }

  const executeStep1 = async () => {
    // Create TLP Point Type
    const pointTypeArtifact: TLPArtifact = {
      id: `pt_${Date.now()}`,
      type: 'POINT_TYPE',
      name: `${campaign?.name} Campaign Points`,
      description: `Points earned through ${campaign?.name} campaign`,
      apiCall: `POST /api/tlp/point-types\nBody: ${JSON.stringify({
        name: `${campaign?.name} Campaign Points`,
        description: `Points earned through ${campaign?.name} campaign`,
        rank: 1,
        enabled: true
      }, null, 2)}`,
      response: 'Success: Point type created with ID pt_12345',
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    }

    // Create Point Issue
    const pointIssueArtifact: TLPArtifact = {
      id: `pi_${Date.now()}`,
      type: 'POINT_ISSUE',
      name: `${campaign?.name} Point Issue`,
      description: `Issuing ${campaign?.totalPointsMinted} points for campaign`,
      apiCall: `POST /api/tlp/point-issues\nBody: ${JSON.stringify({
        pointTypeId: 'pt_12345',
        amount: campaign?.totalPointsMinted,
        description: `${campaign?.name} campaign points`
      }, null, 2)}`,
      response: 'Success: Point issue created with ID pi_67890',
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    }

    setTlpArtifacts(prev => [...prev, pointTypeArtifact, pointIssueArtifact])
  }

  const executeStep2 = async () => {
    // Create Accrual Offers based on campaign rules
    const accrualOffers = campaign?.rules
      .filter(rule => rule.ruleType === RuleType.ELIGIBILITY)
      .map((rule, index) => ({
        id: `acc_${Date.now()}_${index}`,
        type: 'ACCRUAL_OFFER' as const,
        name: `${campaign?.name} Accrual ${index + 1}`,
        description: `Accrual offer based on: ${rule.ruleDefinition}`,
        apiCall: `POST /api/tlp/accrual-offers\nBody: ${JSON.stringify({
          name: `${campaign?.name} Accrual ${index + 1}`,
          description: `Accrual offer based on: ${rule.ruleDefinition}`,
          pointTypeId: 'pt_12345',
          rules: rule.ruleDefinition
        }, null, 2)}`,
        response: 'Success: Accrual offer created',
        status: 'SUCCESS' as const,
        createdAt: new Date().toISOString()
      })) || []

    setTlpArtifacts(prev => [...prev, ...accrualOffers])
  }

  const executeStep3 = async () => {
    // Generate redemption offers using AI
    const redemptionOffers = campaign?.rules
      .filter(rule => rule.ruleType === RuleType.PRIZE)
      .map((rule, index) => ({
        id: `red_${Date.now()}_${index}`,
        type: 'REDEMPTION_OFFER' as const,
        name: rule.ruleDefinition.name || `Redemption ${index + 1}`,
        description: rule.ruleDefinition.description || 'Campaign redemption offer',
        apiCall: `POST /api/tlp/redemption-offers\nBody: ${JSON.stringify({
          name: rule.ruleDefinition.name || `Redemption ${index + 1}`,
          description: rule.ruleDefinition.description || 'Campaign redemption offer',
          pointTypeId: 'pt_12345',
          pointCost: rule.ruleDefinition.pointCost || 100
        }, null, 2)}`,
        response: 'Success: Redemption offer created',
        status: 'SUCCESS' as const,
        createdAt: new Date().toISOString()
      })) || []

    setTlpArtifacts(prev => [...prev, ...redemptionOffers])
  }

  const executeStep4 = async () => {
    // Create TLP Members for all participants
    const memberArtifacts = Array.from({ length: 10 }, (_, index) => ({
      id: `mem_${Date.now()}_${index}`,
      type: 'MEMBER' as const,
      name: `Participant ${index + 1}`,
      description: `TLP member for campaign participant`,
      apiCall: `POST /api/tlp/members\nBody: ${JSON.stringify({
        externalId: `participant_${index + 1}`,
        firstName: `Participant`,
        lastName: `${index + 1}`,
        email: `participant${index + 1}@company.com`
      }, null, 2)}`,
      response: 'Success: Member created',
      status: 'SUCCESS' as const,
      createdAt: new Date().toISOString()
    }))

    setTlpArtifacts(prev => [...prev, ...memberArtifacts])
  }

  const executeStep5 = async () => {
    // Analyze transaction schema using AI
    const schema: TransactionSchema = {
      tableName: 'sales_transactions',
      fields: [
        { name: 'id', type: 'string', required: true, description: 'Unique transaction identifier' },
        { name: 'participant_id', type: 'string', required: true, description: 'Participant identifier' },
        { name: 'product_line', type: 'string', required: true, description: 'Product line (Premium, Standard, etc.)' },
        { name: 'amount', type: 'decimal', required: true, description: 'Transaction amount in MXN' },
        { name: 'transaction_date', type: 'date', required: true, description: 'Date of transaction' },
        { name: 'status', type: 'string', required: true, description: 'Transaction status (completed, cancelled, returned)' }
      ]
    }
    setTransactionSchema(schema)
  }

  const executeStep6 = async () => {
    // Generate SQL artifacts
    const artifacts = {
      oneTimeLoad: `-- One-time load for ${campaign?.name}
INSERT INTO campaign_transactions (campaign_id, participant_id, product_line, amount, transaction_date, status)
SELECT 
  '${campaign?.id}' as campaign_id,
  p.id as participant_id,
  t.product_line,
  t.amount,
  t.transaction_date,
  t.status
FROM sales_transactions t
JOIN participants p ON t.participant_id = p.external_id
WHERE t.transaction_date BETWEEN '${campaign?.startDate}' AND '${campaign?.endDate}'
  AND t.status = 'completed'
  AND t.product_line = 'Premium';`,
      
      incrementalLoad: `-- Incremental load for ${campaign?.name}
INSERT INTO campaign_transactions (campaign_id, participant_id, product_line, amount, transaction_date, status)
SELECT 
  '${campaign?.id}' as campaign_id,
  p.id as participant_id,
  t.product_line,
  t.amount,
  t.transaction_date,
  t.status
FROM sales_transactions t
JOIN participants p ON t.participant_id = p.external_id
WHERE t.transaction_date > (SELECT MAX(transaction_date) FROM campaign_transactions WHERE campaign_id = '${campaign?.id}')
  AND t.status = 'completed'
  AND t.product_line = 'Premium';`,
      
      schedule: 'Daily at 02:00 AM'
    }
    setSqlArtifacts(artifacts)
  }

  const updateCampaignStatus = async (status: CampaignStatus) => {
    try {
      const response = await fetch(`/api/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        throw new Error('Failed to update campaign status')
      }
    } catch (err) {
      console.error('Failed to update campaign status:', err)
    }
  }

  const scheduleDataLoads = async () => {
    try {
      // Schedule one-time load
      await fetch('/api/campaigns/schedule-load', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          campaignId: id,
          type: 'one-time',
          scheduledDate: scheduleConfig.oneTimeLoad
        })
      })

      // Schedule incremental load
      await fetch('/api/campaigns/schedule-load', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          campaignId: id,
          type: 'incremental',
          schedule: scheduleConfig.incrementalLoad,
          time: scheduleConfig.incrementalTime
        })
      })

      setShowScheduleDialog(false)
    } catch (err) {
      setError('Failed to schedule data loads')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!campaign) {
    return (
      <Box>
        <Alert severity="error">Campaign not found</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Execute Campaign: {campaign.name}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Execution Progress
              </Typography>
              
              <Stepper activeStep={currentStep} orientation="vertical">
                {executionSteps.map((step, index) => (
                  <Step key={step}>
                    <StepLabel>
                      {step}
                      {index < currentStep && <CheckCircle color="success" sx={{ ml: 1 }} />}
                    </StepLabel>
                    <StepContent>
                      {index === currentStep && executing && (
                        <Box display="flex" alignItems="center" gap={2}>
                          <CircularProgress size={20} />
                          <Typography>Executing...</Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {!executing && currentStep === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={executeCampaign}
                    disabled={campaign.status !== CampaignStatus.APPROVED}
                  >
                    Execute Campaign
                  </Button>
                  {campaign.status !== CampaignStatus.APPROVED && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Campaign must be approved before execution
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {campaign.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Total Points:</strong> {campaign.totalPointsMinted?.toLocaleString() || 'Not set'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Rules:</strong> {campaign.rules.length}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => setShowScheduleDialog(true)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Schedule Data Loads
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TLP Artifacts Table */}
      {tlpArtifacts.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              TLP Artifacts Created
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tlpArtifacts.map((artifact) => (
                    <TableRow key={artifact.id}>
                      <TableCell>
                        <Chip 
                          label={artifact.type.replace('_', ' ')} 
                          size="small"
                          color={artifact.status === 'SUCCESS' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{artifact.name}</TableCell>
                      <TableCell>{artifact.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={artifact.status} 
                          size="small"
                          color={artifact.status === 'SUCCESS' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction Schema */}
      {transactionSchema && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Schema Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              AI-generated schema for transaction processing
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  <DataObject sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Schema Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>
                  Table: {transactionSchema.tableName}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionSchema.fields.map((field) => (
                        <TableRow key={field.name}>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.type}</TableCell>
                          <TableCell>
                            <Chip 
                              label={field.required ? 'Yes' : 'No'} 
                              size="small"
                              color={field.required ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{field.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* SQL Artifacts */}
      {sqlArtifacts && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SQL Artifacts Generated
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                  One-Time Load SQL
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={sqlArtifacts.oneTimeLoad}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Incremental Load SQL
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={sqlArtifacts.incrementalLoad}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Data Loads</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="One-Time Load Date"
                type="date"
                value={scheduleConfig.oneTimeLoad}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, oneTimeLoad: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Incremental Load Frequency</InputLabel>
                <Select
                  value={scheduleConfig.incrementalLoad}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, incrementalLoad: e.target.value }))}
                  label="Incremental Load Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={scheduleConfig.incrementalTime}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, incrementalTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button onClick={scheduleDataLoads} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CampaignExecutionPage
