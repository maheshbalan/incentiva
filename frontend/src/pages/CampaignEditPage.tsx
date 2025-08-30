import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import { ArrowBack, Save, Cancel } from '@mui/icons-material'
import { CampaignFormData, CampaignStatus, SUPPORTED_CURRENCIES } from '@incentiva/shared'
import { authService } from '../services/authService'

const CampaignEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<CampaignFormData | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    'Basic Information',
    'Goals & Rewards',
    'Eligibility & Rules',
    'TLP Configuration',
    'Database Connection',
    'Review & Update'
  ]

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  const fetchCampaign = async () => {
    try {
      console.debug('[CampaignEditPage] Fetching campaign', { id })
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Use the authenticated axios instance from authService
      const response = await authService.api.get(`/campaigns/${id}`)
      console.debug('[CampaignEditPage] Fetch response', response.status, response.data)
      
      if (response.data.success) {
        setCampaign(response.data.campaign)
      } else {
        throw new Error(response.data.error || 'Failed to fetch campaign')
      }
    } catch (err: any) {
      console.error('[CampaignEditPage] Error fetching campaign:', err?.response?.status, err?.response?.data || err)
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        navigate('/login')
        return
      }
      setError(err.message || 'An error occurred while fetching the campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!campaign) return

    setSaving(true)
    try {
      console.debug('[CampaignEditPage] Saving campaign', { id, payload: campaign })
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Use the authenticated axios instance from authService
      const response = await authService.api.put(`/campaigns/${id}`, campaign)
      console.debug('[CampaignEditPage] Save response', response.status, response.data)
      
      if (response.data.success) {
        navigate('/campaigns')
      } else {
        throw new Error(response.data.error || 'Failed to update campaign')
      }
    } catch (err: any) {
      console.error('[CampaignEditPage] Error updating campaign:', err?.response?.status, err?.response?.data || err)
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        navigate('/login')
        return
      }
      setError(err.message || 'An error occurred while updating the campaign')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    if (campaign) {
      setCampaign({ ...campaign, [field]: value })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // Convert ISO date to yyyy-MM-dd format for HTML date inputs
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </Button>
      </Box>
    )
  }

  if (!campaign) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Campaign not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </Button>
      </Box>
    )
  }

  const renderBasicInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Campaign Basic Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Provide the fundamental details about your loyalty campaign.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Campaign Name"
          value={campaign.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Premium Line Sales Campaign"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={formatDate(campaign.startDate)}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: new Date().toISOString().split('T')[0]
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="End Date"
          type="date"
          value={formatDate(campaign.endDate)}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: campaign.startDate ? formatDate(campaign.startDate) : new Date().toISOString().split('T')[0]
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={campaign.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          multiline
          rows={3}
          placeholder="Describe your campaign objectives and target audience..."
        />
      </Grid>
    </Grid>
  )

  const renderGoalsAndRewards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Campaign Goals
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set individual and overall campaign goals with your preferred currency.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Individual Goals
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Individual Goal Amount"
          type="number"
          value={campaign.individualGoal || ''}
          onChange={(e) => handleInputChange('individualGoal', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 200000"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Campaign Currency</InputLabel>
          <Select
            value={campaign.campaignCurrency || 'MXN'}
            onChange={(e) => handleInputChange('campaignCurrency', e.target.value)}
            label="Campaign Currency"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <MenuItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Overall Campaign Goals
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Overall Campaign Goal"
          type="number"
          value={campaign.overallGoal || ''}
          onChange={(e) => handleInputChange('overallGoal', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 2000000"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Overall goal uses the same campaign currency: {campaign.campaignCurrency || 'MXN'}
        </Typography>
      </Grid>

      {/* Points Allocation Section */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
          Points Allocation Configuration
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Amount to sell to get one point"
          type="number"
          value={campaign.amountPerPoint || ''}
          onChange={(e) => handleInputChange('amountPerPoint', parseFloat(e.target.value) || 0)}
          inputProps={{ step: 0.01, min: 0.01 }}
          helperText={`Amount in ${campaign.campaignCurrency || 'MXN'} that participant must sell to earn 1 point (will be rounded up)`}
          placeholder="e.g., 200"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="text.secondary">
          <strong>Example:</strong> If set to 200 {campaign.campaignCurrency || 'MXN'}, participant gets 1 point for every 200 {campaign.campaignCurrency || 'MXN'} in sales (rounded up)
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Individual Goal Bonus Points"
          type="number"
          value={campaign.individualGoalBonus || ''}
          onChange={(e) => handleInputChange('individualGoalBonus', parseFloat(e.target.value) || 0)}
          inputProps={{ min: 0 }}
          helperText="Bonus points when individual goal is met"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Overall Goal Bonus Points"
          type="number"
          value={campaign.overallGoalBonus || ''}
          onChange={(e) => handleInputChange('overallGoalBonus', parseFloat(e.target.value) || 0)}
          inputProps={{ min: 0 }}
          helperText="Bonus points when overall goal is met"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Total Points Minted for Campaign"
          type="number"
          value={campaign.totalPointsMinted || ''}
          onChange={(e) => handleInputChange('totalPointsMinted', parseFloat(e.target.value) || 0)}
          inputProps={{ min: 0 }}
          helperText="Total points minted by the campaign"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Rewards & Redemption Options"
          value={campaign.rewards || ''}
          onChange={(e) => handleInputChange('rewards', e.target.value)}
          multiline
          rows={4}
          helperText="Describe what participants can redeem with their points"
          placeholder="e.g., Gift cards, merchandise, discounts, exclusive experiences..."
        />
      </Grid>

      {/* TLP Point Type Configuration */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
          TLP Point Type Configuration
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Campaign Point Type Name"
          value={campaign.campaignPointTypeName || ''}
          onChange={(e) => handleInputChange('campaignPointTypeName', e.target.value)}
          error={!campaign.campaignPointTypeName}
          helperText={!campaign.campaignPointTypeName ? 'Campaign point type name is required' : "Name for the loyalty point type in TLP system"}
          placeholder="e.g., Goodyear Coins, Premium Line Points"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Value of Each Point"
          type="number"
          value={campaign.pointValue || ''}
          onChange={(e) => handleInputChange('pointValue', parseFloat(e.target.value) || 0)}
          inputProps={{ step: 0.01, min: 0.01 }}
          error={!campaign.pointValue}
          helperText={!campaign.pointValue ? 'Point value is required' : `Value of each point in ${campaign.campaignCurrency || 'MXN'}`}
          placeholder="e.g., 1.00"
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>TLP Point Type:</strong> This will create a new point type in the TLP system with the specified name and value. 
            The point type will be used for all point allocations and redemptions in this campaign.
          </Typography>
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Example:</strong> For a Premium Line sales campaign, you might set an individual goal of 200,000 MXN 
            per salesperson and an overall campaign goal of 2,000,000 MXN.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  )

  const renderEligibilityAndRules = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Eligibility & Rules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define who can participate and what rules govern the campaign.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Eligibility Criteria"
          value={campaign.eligibilityCriteria || ''}
          onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
          multiline
          rows={6}
          helperText="Describe eligibility criteria in natural language"
          placeholder="Describe eligibility criteria in natural language. For example: 'Salespeople must achieve individual sales goals of 200,000 MXN in Premium Line products. Only completed orders with status 'Completed' are eligible. Points are awarded based on Premium Line sales volume.'"
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Tip:</strong> Be specific about what qualifies for the campaign. The AI will use this description 
            to generate campaign rules and understand your database schema.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  )

  const renderTLPConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          TLP Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the Pravici TLP integration for your campaign.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="TLP Endpoint URL"
          value={campaign.tlpEndpointUrl || ''}
          onChange={(e) => handleInputChange('tlpEndpointUrl', e.target.value)}
          helperText="TLP endpoint URL"
          placeholder="https://exata-customer.pravici.io"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="TLP API Key"
          value={campaign.tlpApiKey || ''}
          onChange={(e) => handleInputChange('tlpApiKey', e.target.value)}
          type="password"
          helperText="TLP API key"
          placeholder="Enter your TLP API key"
          inputProps={{
            autocomplete: 'new-password'
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> These credentials will be used to integrate with Pravici TLP for point allocation, 
            redemption offers, and campaign execution.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  )

  const renderDatabaseConnection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Database Connection Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the database connection for your campaign's data storage.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Database Type</InputLabel>
          <Select
            value={campaign.databaseType || 'postgres'}
            onChange={(e) => handleInputChange('databaseType', e.target.value)}
            label="Database Type"
          >
            <MenuItem value="postgres">PostgreSQL</MenuItem>
            <MenuItem value="mysql">MySQL</MenuItem>
            <MenuItem value="mongodb">MongoDB</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database Host"
          value={campaign.databaseHost || ''}
          onChange={(e) => handleInputChange('databaseHost', e.target.value)}
          helperText="Database host"
          placeholder="e.g., localhost"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database Port"
          type="number"
          value={campaign.databasePort || ''}
          onChange={(e) => handleInputChange('databasePort', parseInt(e.target.value) || 0)}
          helperText="Database port"
          inputProps={{ min: 1 }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database Name"
          value={campaign.databaseName || ''}
          onChange={(e) => handleInputChange('databaseName', e.target.value)}
          helperText="Database name"
          placeholder="e.g., incentiva"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database Username"
          value={campaign.databaseUsername || ''}
          onChange={(e) => handleInputChange('databaseUsername', e.target.value)}
          helperText="Database username"
          placeholder="e.g., postgres"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database Password"
          value={campaign.databasePassword || ''}
          onChange={(e) => handleInputChange('databasePassword', e.target.value)}
          type="password"
          helperText="Database password"
          placeholder="e.g., postgres"
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> The database connection details will be used to store campaign data,
            track participant progress, and execute campaign rules.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  )

  const renderReviewAndUpdate = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review & Update Campaign
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Review all the campaign details before saving changes.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Campaign Basic Information:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Name:</strong> {campaign.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Description:</strong> {campaign.description || 'No description provided'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Period:</strong> {formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Campaign Goals:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Individual Goal:</strong> {campaign.campaignCurrency || 'MXN'} {campaign.individualGoal || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Overall Goal:</strong> {campaign.campaignCurrency || 'MXN'} {campaign.overallGoal || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Amount to sell to get one point:</strong> {campaign.campaignCurrency || 'MXN'} {campaign.amountPerPoint || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Individual Goal Bonus:</strong> {campaign.individualGoalBonus || 0} points
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Overall Goal Bonus:</strong> {campaign.overallGoalBonus || 0} points
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Total Points Minted:</strong> {campaign.totalPointsMinted || 0}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Eligibility & Rules:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Eligibility Criteria:</strong> {campaign.eligibilityCriteria || 'Not specified'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>TLP Configuration:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>TLP Endpoint:</strong> {campaign.tlpEndpointUrl || 'Not configured'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>TLP API Key:</strong> {campaign.tlpApiKey ? '***configured***' : 'Not configured'}
        </Typography>
        {campaign.campaignPointTypeName && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Point Type Name:</strong> {campaign.campaignPointTypeName}
          </Typography>
        )}
        {campaign.pointValue && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Point Value:</strong> {campaign.pointValue} {campaign.campaignCurrency || 'MXN'}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Database Connection:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Database:</strong> {campaign.databaseType || 'Not specified'} at {campaign.databaseHost || 'Not specified'}:{campaign.databasePort || 'Not specified'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Database Name:</strong> {campaign.databaseName || 'Not specified'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Username:</strong> {campaign.databaseUsername || 'Not specified'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Rewards & Redemption:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Rewards Description:</strong> {campaign.rewards || 'Not specified'}
        </Typography>
      </Grid>
    </Grid>
  )

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation()
      case 1:
        return renderGoalsAndRewards()
      case 2:
        return renderEligibilityAndRules()
      case 3:
        return renderTLPConfiguration()
      case 4:
        return renderDatabaseConnection()
      case 5:
        return renderReviewAndUpdate()
      default:
        return null
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/campaigns')}
          sx={{ mr: 2 }}
        >
          Back to Campaigns
        </Button>
        <Typography variant="h4" component="h1">
          Edit Campaign: {campaign.name}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default CampaignEditPage
