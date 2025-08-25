import React, { useState, useEffect, useRef } from 'react'
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
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material'
import { ExpandMore, PlayArrow, CheckCircle, Error as ErrorIcon, Schedule, Code, DataObject, ListAlt } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { CampaignStatus, RuleType } from '@incentiva/shared'
import { authService } from '../services/authService'

interface Campaign {
  id: string
  name: string
  description?: string
  status: CampaignStatus
  totalPointsMinted?: number
  eligibilityCriteria?: string
  startDate?: string
  endDate?: string
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
  const [jsonRules, setJsonRules] = useState<any | null>(null)
  const [scheduling, setScheduling] = useState<{ approved: boolean; oneTimeDate: string; incremental: string } | null>(null)
  const [simTransactions, setSimTransactions] = useState<Array<{ id: string; amount: number; status: string; action?: string; response?: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState({
    oneTimeLoad: new Date().toISOString().slice(0, 10),
    incrementalLoad: 'daily',
    incrementalTime: '02:00'
  })
  const [activeTab, setActiveTab] = useState(0)
  const [stepStatus, setStepStatus] = useState<Record<number, 'PENDING'|'RUNNING'|'COMPLETED'|'FAILED'>>({})
  const [logs, setLogs] = useState<string[]>([])
  const stepsRef = useRef<HTMLDivElement | null>(null)

  // Define execution steps
  const executionSteps = [
    'Generate TLP Artifacts',
    'Analyze Transaction Schema', 
    'Generate SQL Artifacts',
    'Generate JSON Rules',
    'Approve & Schedule',
    'Load & Process Transactions'
  ]

  const appendLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

  const simulateStep = async (index: number, onDone?: () => void) => {
    setStepStatus(prev => ({ ...prev, [index]: 'RUNNING' }))
    appendLog(`Starting: ${executionSteps[index]}`)
    await new Promise(r => setTimeout(r, 1000))
    appendLog(`In progress: ${executionSteps[index]}...`)
    await new Promise(r => setTimeout(r, 1000))
    // Populate simulated results per step
    try {
      switch (index) {
        case 0:
          setTlpArtifacts([
            { id: `pt_${Date.now()}`, type: 'POINT_TYPE', name: `${campaign?.name} Points`, description: 'Campaign point type', apiCall: 'POST /point-types', response: 'Created', status: 'SUCCESS', createdAt: new Date().toISOString() },
            { id: `pi_${Date.now()}`, type: 'POINT_ISSUE', name: `${campaign?.name} Issue`, description: 'Mint initial points', apiCall: 'POST /point-issues', response: 'Created', status: 'SUCCESS', createdAt: new Date().toISOString() },
            { id: `acc_${Date.now()}`, type: 'ACCRUAL_OFFER', name: `${campaign?.name} Accrual 1`, description: 'Accrual offer', apiCall: 'POST /accrual-offers', response: 'Created', status: 'SUCCESS', createdAt: new Date().toISOString() },
            { id: `red_${Date.now()}`, type: 'REDEMPTION_OFFER', name: 'Gift Card 100', description: 'Redemption offer', apiCall: 'POST /redemption-offers', response: 'Created', status: 'SUCCESS', createdAt: new Date().toISOString() }
          ])
          break
        case 1:
          setTransactionSchema({
            tableName: 'sales_transactions',
            fields: [
              { name: 'id', type: 'string', required: true, description: 'Unique ID' },
              { name: 'participant_id', type: 'string', required: true, description: 'Participant' },
              { name: 'product_line', type: 'string', required: true, description: 'Product line' },
              { name: 'amount', type: 'decimal', required: true, description: 'Amount' },
              { name: 'transaction_date', type: 'date', required: true, description: 'Date' },
              { name: 'status', type: 'string', required: true, description: 'Status' }
            ]
          })
          break
        case 2:
          setSqlArtifacts({
            oneTimeLoad: `-- One-time load for ${campaign?.name}\nSELECT * FROM source WHERE date BETWEEN '${campaign?.startDate}' AND '${campaign?.endDate}';`,
            incrementalLoad: `-- Incremental load for ${campaign?.name}\nSELECT * FROM source WHERE date > (SELECT MAX(date) FROM campaign_transactions WHERE campaign_id='${campaign?.id}');`,
            schedule: 'Daily at 02:00 AM'
          })
          break
        case 3:
          setJsonRules({
            version: '1.0',
            eligibility: [{ id: 'elig_1', field: 'product_line', operator: 'equals', value: 'Premium' }],
            accrual: [{ id: 'acc_1', name: 'Points per MXN', formula: 'ceil(amount / 200)' }],
            bonus: [{ id: 'bonus_1', name: 'Individual Goal Bonus', threshold: 200000, points: 10000 }]
          })
          break
        case 4:
          setScheduling({ approved: true, oneTimeDate: new Date().toISOString().slice(0, 10), incremental: 'daily 02:00' })
          break
        case 5:
          setSimTransactions([
            { id: 'tx_1', amount: 1200, status: 'COMPLETED', action: 'Accrual', response: '200 pts' },
            { id: 'tx_2', amount: 150, status: 'SKIPPED', action: 'Eligibility', response: 'Below threshold' },
            { id: 'tx_3', amount: 980, status: 'COMPLETED', action: 'Accrual', response: '200 pts' }
          ])
          break
      }
    } catch (e) {
      setStepStatus(prev => ({ ...prev, [index]: 'FAILED' }))
      appendLog(`Failed: ${executionSteps[index]}`)
      return
    }
    setStepStatus(prev => ({ ...prev, [index]: 'COMPLETED' }))
    appendLog(`Completed: ${executionSteps[index]}`)
    if (onDone) onDone()
  }

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  const fetchCampaign = async () => {
    try {
      console.debug('[CampaignExecutionPage] Fetching campaign', { id })
      setLoading(true)
      const response = await authService.api.get(`/campaigns/${id}`)
      console.debug('[CampaignExecutionPage] Fetch response', response.status, response.data)
      setCampaign(response.data.campaign || response.data.data)
    } catch (err: any) {
      console.error('[CampaignExecutionPage] Error fetching campaign:', err?.response?.status, err?.response?.data || err)
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        window.location.href = '/login'
        return
      }
      setError(err.message || 'Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }

  const executeCampaign = async () => {
    try {
      console.debug('[CampaignExecutionPage] Execute campaign start', { id })
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
      console.error('[CampaignExecutionPage] Execute campaign failed', err)
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
      const response = await authService.api.patch(`/campaigns/${id}/status`, { status })
      // Refresh campaign data
      fetchCampaign()
    } catch (err: any) {
      console.error('Error updating campaign status:', err)
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        window.location.href = '/login'
        return
      }
      setError(err.message || 'Failed to update campaign status')
    }
  }

  const scheduleDataLoads = async () => {
    try {
      // Schedule one-time load
      await authService.api.post('/campaigns/schedule-load', {
        campaignId: id,
        type: 'one-time',
        scheduledDate: scheduleConfig.oneTimeLoad
      })

      // Schedule incremental load
      await authService.api.post('/campaigns/schedule-load', {
        campaignId: id,
        type: 'incremental',
        schedule: scheduleConfig.incrementalLoad,
        time: scheduleConfig.incrementalTime
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
                Campaign Execution
              </Typography>

              {/* Steps Table */}
              <div ref={stepsRef}>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Step</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {executionSteps.map((label, idx) => (
                      <TableRow key={label} selected={activeTab === idx}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <ListAlt fontSize="small" />
                            {label}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {stepStatus[idx] === 'COMPLETED' ? (
                            <Chip label="Completed" color="success" size="small" />
                          ) : stepStatus[idx] === 'RUNNING' ? (
                            <Chip label="Running" color="warning" size="small" />
                          ) : stepStatus[idx] === 'FAILED' ? (
                            <Chip label="Failed" color="error" size="small" />
                          ) : (
                            <Chip label="Pending" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => {
                            console.log('[CampaignExecutionPage] View clicked for step', idx, 'setting activeTab to', idx)
                            setActiveTab(idx)
                            // Scroll to tabs section
                            setTimeout(() => {
                              const tabsSection = document.querySelector('[data-tabs-section]')
                              if (tabsSection) {
                                tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }, 100)
                          }} sx={{ mr: 1 }}>
                            View
                          </Button>
                          <Button size="small" variant="contained" onClick={() => simulateStep(idx)}>
                            Run
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </div>

              {/* Simple log area */}
              {logs.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 160, overflow: 'auto' }}>
                  {logs.map((l, i) => (
                    <Typography key={i} variant="caption" display="block">{l}</Typography>
                  ))}
                </Paper>
              )}

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

      {/* Tabs for sections */}
      <Card sx={{ mt: 3 }} data-tabs-section>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Debug: Current activeTab = {activeTab} | Tab {activeTab + 1} of 6
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Active Tab: {['TLP Artifacts', 'Transaction Schema', 'SQL Artifacts', 'JSON Rules', 'Scheduling', 'Transactions & Processing'][activeTab]}
          </Alert>
          <Tabs 
            value={activeTab} 
            onChange={(_, v) => {
              console.log('[CampaignExecutionPage] Tab changed from', activeTab, 'to', v)
              setActiveTab(v)
            }}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 'medium'
              }
            }}
          >
            <Tab label="TLP Artifacts" />
            <Tab label="Transaction Schema" />
            <Tab label="SQL Artifacts" />
            <Tab label="JSON Rules" />
            <Tab label="Scheduling" />
            <Tab label="Transactions & Processing" />
          </Tabs>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button size="small" onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}>Back to Steps</Button>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>TLP Artifacts (Simulation)</Typography>
              {tlpArtifacts.length === 0 ? (
                <Alert severity="info">Run "Generate TLP Artifacts" step to simulate artifact creation.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tlpArtifacts.map(a => (
                        <TableRow key={a.id}>
                          <TableCell>{a.type}</TableCell>
                          <TableCell>{a.name}</TableCell>
                          <TableCell>{a.description}</TableCell>
                          <TableCell>
                            <Chip label={a.status} color={a.status === 'SUCCESS' ? 'success' : 'warning'} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Transaction Schema (Simulation)</Typography>
              {!transactionSchema ? (
                <Alert severity="info">Run "Analyze Transaction Schema" step to simulate schema creation.</Alert>
              ) : (
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
                      {transactionSchema.fields.map((f) => (
                        <TableRow key={f.name}>
                          <TableCell>{f.name}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell>{f.required ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{f.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>SQL Artifacts (Simulation)</Typography>
              {!sqlArtifacts ? (
                <Alert severity="info">Run "Generate SQL Artifacts" step to simulate SQL generation.</Alert>
              ) : (
                <>
                  <Typography variant="subtitle2">One-Time Load</Typography>
                  <TextField fullWidth multiline rows={6} value={sqlArtifacts.oneTimeLoad} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
                  <Typography variant="subtitle2">Incremental Load</Typography>
                  <TextField fullWidth multiline rows={6} value={sqlArtifacts.incrementalLoad} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
                  <Alert severity="success">Suggested Schedule: {sqlArtifacts.schedule}</Alert>
                </>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>JSON Rules (Simulation)</Typography>
              {!jsonRules ? (
                <Alert severity="info">Run "Generate JSON Rules" step to simulate rule creation.</Alert>
              ) : (
                <TextField fullWidth multiline rows={12} value={JSON.stringify(jsonRules, null, 2)} InputProps={{ readOnly: true }} />
              )}
            </Box>
          )}

          {activeTab === 4 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Approval & Scheduling (Simulation)</Typography>
              {!scheduling ? (
                <>
                  <Alert severity="info">After artifacts are generated, approve one-time run and set incremental schedule.</Alert>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setScheduling({ approved: true, oneTimeDate: new Date().toISOString().slice(0,10), incremental: 'daily 02:00' })}>Approve & Schedule</Button>
                </>
              ) : (
                <Alert severity="success">Approved for one-time run on {scheduling.oneTimeDate}. Incremental: {scheduling.incremental}.</Alert>
              )}
            </Box>
          )}

          {activeTab === 5 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Transactions & Processing (Simulation)</Typography>
              {simTransactions.length === 0 ? (
                <>
                  <Alert severity="info">Run steps to load transactions, then process unprocessed.</Alert>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setSimTransactions([
                    { id: 'tx_1', amount: 1200, status: 'PENDING' },
                    { id: 'tx_2', amount: 150, status: 'PENDING' }
                  ])}>Load Sample</Button>
                </>
              ) : (
                <>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Response</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {simTransactions.map((t, idx) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell>{t.amount}</TableCell>
                            <TableCell>{t.status}</TableCell>
                            <TableCell>{t.action || '-'}</TableCell>
                            <TableCell>{t.response || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
                    setSimTransactions(prev => prev.map(t => t.status === 'PENDING' ? ({ ...t, status: 'COMPLETED', action: 'Accrual', response: '200 pts' }) : t))
                  }}>Process Unprocessed</Button>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

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
