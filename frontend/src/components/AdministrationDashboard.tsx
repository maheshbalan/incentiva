import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Button,
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
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material'
import {
  Refresh,
  PlayArrow,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  Code,
  DataObject,
  Rule,
  Api,
  History
} from '@mui/icons-material'
import { authService } from '../services/authService'

interface TLPArtifact {
  id: string
  artifactType: string
  artifactName: string
  apiCall: string
  response: string
  status: string
  errorDetails?: string
  createdAt: string
}

interface CampaignExecutionStatus {
  campaignId: string
  campaignName: string
  status: string
  lastExecutedAt?: string
  tlpArtifacts: {
    total: number
    successful: number
    failed: number
    recent: TLPArtifact[]
  }
  hasTransactionSchema: boolean
  hasJsonRules: boolean
  hasDataQueries: boolean
}

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const AdministrationDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [tlpArtifacts, setTlpArtifacts] = useState<TLPArtifact[]>([])
  const [executionStatus, setExecutionStatus] = useState<CampaignExecutionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showArtifactDialog, setShowArtifactDialog] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<TLPArtifact | null>(null)
  const [showRulesEditor, setShowRulesEditor] = useState(false)
  const [showSchemaViewer, setShowSchemaViewer] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await authService.api.get('/campaigns')
      setCampaigns(response.data.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutionStatus = async (campaignId: string) => {
    try {
      setLoading(true)
      const response = await authService.api.get(`/campaign-execution/status/${campaignId}`)
      setExecutionStatus(response.data.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch execution status')
    } finally {
      setLoading(false)
    }
  }

  const fetchTLPArtifacts = async (campaignId: string) => {
    try {
      setLoading(true)
      const response = await authService.api.get(`/campaign-execution/artifacts/${campaignId}`)
      setTlpArtifacts(response.data.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch TLP artifacts')
    } finally {
      setLoading(false)
    }
  }

  const executeCampaign = async (campaignId: string) => {
    try {
      setLoading(true)
      const response = await authService.api.post('/campaign-execution/execute', {
        campaignId,
        executeTLPSetup: true,
        generateRules: true,
        extractData: true
      })
      
      if (response.data.success) {
        // Refresh status and artifacts
        await fetchExecutionStatus(campaignId)
        await fetchTLPArtifacts(campaignId)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute campaign')
    } finally {
      setLoading(false)
    }
  }

  const retryArtifact = async (artifactId: string) => {
    try {
      setLoading(true)
      const response = await authService.api.post(`/campaign-execution/retry-artifact/${artifactId}`)
      
      if (response.data.success) {
        // Refresh artifacts
        if (selectedCampaign) {
          await fetchTLPArtifacts(selectedCampaign.id)
        }
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retry artifact')
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignSelect = async (campaign: any) => {
    setSelectedCampaign(campaign)
    await fetchExecutionStatus(campaign.id)
    await fetchTLPArtifacts(campaign.id)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success'
      case 'FAILED':
        return 'error'
      case 'PENDING':
        return 'warning'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
      <Typography variant="h4" component="h1" gutterBottom>
        Administration Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Campaign Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Campaign
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={selectedCampaign?.id || ''}
                  onChange={(e) => {
                    const campaign = campaigns.find(c => c.id === e.target.value)
                    if (campaign) handleCampaignSelect(campaign)
                  }}
                  label="Campaign"
                >
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedCampaign && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status: {selectedCampaign.status}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Currency: {selectedCampaign.campaignCurrency}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount per Point: {selectedCampaign.amountPerPoint}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => executeCampaign(selectedCampaign.id)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Execute Campaign
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Status */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Execution Status
              </Typography>
              
              {executionStatus ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Campaign: {executionStatus.campaignName}
                    </Typography>
                    <Typography variant="subtitle2">
                      Status: {executionStatus.status}
                    </Typography>
                    <Typography variant="subtitle2">
                      Last Executed: {executionStatus.lastExecutedAt ? formatDate(executionStatus.lastExecutedAt) : 'Never'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      TLP Artifacts: {executionStatus.tlpArtifacts.total}
                    </Typography>
                    <Typography variant="subtitle2" color="success.main">
                      Successful: {executionStatus.tlpArtifacts.successful}
                    </Typography>
                    <Typography variant="subtitle2" color="error.main">
                      Failed: {executionStatus.tlpArtifacts.failed}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      Generated Artifacts:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip 
                        icon={<DataObject />} 
                        label="Transaction Schema" 
                        color={executionStatus.hasTransactionSchema ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip 
                        icon={<Rule />} 
                        label="JSON Rules" 
                        color={executionStatus.hasJsonRules ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip 
                        icon={<Code />} 
                        label="Data Queries" 
                        color={executionStatus.hasDataQueries ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="textSecondary">
                  Select a campaign to view execution status
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard Tabs */}
      {selectedCampaign && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="TLP Artifacts" icon={<Api />} />
              <Tab label="Rules Editor" icon={<Rule />} />
              <Tab label="Transaction Schema" icon={<DataObject />} />
              <Tab label="SQL Artifacts" icon={<Code />} />
              <Tab label="Execution History" icon={<History />} />
            </Tabs>
          </Box>

          {/* TLP Artifacts Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">TLP Artifacts</Typography>
              <Button
                startIcon={<Refresh />}
                onClick={() => fetchTLPArtifacts(selectedCampaign.id)}
              >
                Refresh
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tlpArtifacts.map((artifact) => (
                    <TableRow key={artifact.id}>
                      <TableCell>
                        <Chip 
                          label={artifact.artifactType} 
                          size="small" 
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{artifact.artifactName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={artifact.status} 
                          size="small" 
                          color={getStatusColor(artifact.status) as any}
                        />
                      </TableCell>
                      <TableCell>{formatDate(artifact.createdAt)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedArtifact(artifact)
                              setShowArtifactDialog(true)
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {artifact.status === 'FAILED' && (
                          <Tooltip title="Retry">
                            <IconButton
                              size="small"
                              onClick={() => retryArtifact(artifact.id)}
                              color="warning"
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Rules Editor Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Rules Editor</Typography>
            <Typography color="textSecondary" gutterBottom>
              Review and edit AI-generated rules for the campaign
            </Typography>
            
            {executionStatus?.hasJsonRules ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setShowRulesEditor(true)}
              >
                Edit Rules
              </Button>
            ) : (
              <Alert severity="info">
                No rules generated yet. Execute the campaign to generate rules.
              </Alert>
            )}
          </TabPanel>

          {/* Transaction Schema Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Transaction Schema</Typography>
            <Typography color="textSecondary" gutterBottom>
              View the AI-generated JSON schema for transaction processing
            </Typography>
            
            {executionStatus?.hasTransactionSchema ? (
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => setShowSchemaViewer(true)}
              >
                View Schema
              </Button>
            ) : (
              <Alert severity="info">
                No transaction schema generated yet. Execute the campaign to generate schema.
              </Alert>
            )}
          </TabPanel>

          {/* SQL Artifacts Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>SQL Artifacts</Typography>
            <Typography color="textSecondary" gutterBottom>
              Manage SQL queries for data extraction and transformation
            </Typography>
            
            {executionStatus?.hasDataQueries ? (
              <Alert severity="success">
                Data extraction queries have been generated. View them in the campaign details.
              </Alert>
            ) : (
              <Alert severity="info">
                No SQL artifacts generated yet. Execute the campaign to generate queries.
              </Alert>
            )}
          </TabPanel>

          {/* Execution History Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>Execution History</Typography>
            <Typography color="textSecondary" gutterBottom>
              View detailed execution logs and performance metrics
            </Typography>
            
            <Alert severity="info">
              Execution history will be displayed here once campaigns are executed.
            </Alert>
          </TabPanel>
        </Box>
      )}

      {/* Artifact Details Dialog */}
      <Dialog
        open={showArtifactDialog}
        onClose={() => setShowArtifactDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          TLP Artifact Details
          {selectedArtifact && (
            <Chip 
              label={selectedArtifact.artifactType} 
              color={getStatusColor(selectedArtifact.status) as any}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedArtifact && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedArtifact.artifactName}
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>API Call</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={selectedArtifact.apiCall}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Response</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={selectedArtifact.response || 'No response'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </AccordionDetails>
              </Accordion>
              
              {selectedArtifact.errorDetails && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="error">Error Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={selectedArtifact.errorDetails}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      color="error"
                    />
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowArtifactDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdministrationDashboard
