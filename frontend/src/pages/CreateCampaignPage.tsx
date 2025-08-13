import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  Divider
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { SUPPORTED_CURRENCIES, CampaignFormData } from '@incentiva/shared'

const CreateCampaignPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<CampaignFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0], // Use current date as default
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      individualGoal: undefined,
      campaignCurrency: 'MXN',
      overallGoal: undefined,
      eligibilityCriteria: '',
      tlpApiKey: '',
      tlpEndpointUrl: 'https://exata-customer.pravici.io', // Set default TLP endpoint
      amountPerPoint: 200, // Default: 200 MXN to get 1 point
      individualGoalBonus: 0, // Default for individual goal bonus
      overallGoalBonus: 0, // Default for overall goal bonus
      totalPointsMinted: 0, // Default for total points minted
      rewards: '', // Default for rewards description
      databaseType: 'postgres', // Default for database type
      databaseHost: 'localhost', // Default for database host
      databasePort: 5432, // Default for database port
      databaseName: 'incentiva', // Default for database name
      databaseUsername: 'postgres', // Default for database username
      databasePassword: 'postgres' // Default for database password
    },
    mode: 'onBlur'
  })

  // Load TLP configuration from environment on component mount
  useEffect(() => {
    // Set TLP endpoint from environment variable (this would be loaded from backend)
    setValue('tlpEndpointUrl', 'https://exata-customer.pravici.io')
  }, [setValue])

  const watchedValues = watch()

  // Custom validation function
  const validateForm = (data: CampaignFormData): boolean => {
    // Basic required fields
    if (!data.name || !data.startDate || !data.endDate) {
      return false
    }
    
    // If TLP endpoint is provided, API key must also be provided
    if (data.tlpEndpointUrl && !data.tlpApiKey) {
      return false
    }
    
    return true
  }

  const steps = [
    'Basic Information',
    'Goals & Rewards',
    'Eligibility & Rules',
    'TLP Configuration',
    'Database Connection',
    'Review & Create'
  ]

  const handleNext = () => {
    console.log('Moving to next step from:', activeStep)
    console.log('Form validation state:', { isValid, errors })
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    console.log('Moving to previous step from:', activeStep)
    setActiveStep((prevStep) => prevStep - 1)
  }

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Submitting campaign data:', data)
      
      // Validate required fields
      if (!data.name || !data.startDate || !data.endDate) {
        throw new Error('Missing required fields: name, startDate, endDate')
      }

      // Validate dates
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format')
      }
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date')
      }

      // Validate TLP configuration if provided
      if (data.tlpEndpointUrl && !data.tlpApiKey) {
        throw new Error('TLP API key is required when TLP endpoint is provided')
      }

      // Validate points configuration
      if (!data.amountPerPoint || data.amountPerPoint <= 0) {
        throw new Error('Amount per point must be greater than 0')
      }

      if (!data.rewards) {
        throw new Error('Rewards description is required')
      }

      // Prepare data for submission
      const submissionData = {
        ...data,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'DRAFT' // Save as draft first
      }

      console.log('Submitting formatted data:', submissionData)

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submissionData)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Campaign creation failed:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Campaign creation result:', result)
      
      if (result.success) {
        // Show success message and redirect to campaign management
        alert('Campaign created successfully as DRAFT! You can now execute it from the Campaign Management screen.')
        navigate('/admin') // Redirect to admin page with campaign management
      } else {
        throw new Error(result.error || 'Failed to create campaign')
      }
    } catch (err) {
      console.error('Campaign creation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
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
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Campaign name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Campaign Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., Premium Line Sales Campaign"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'Start date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0] // Cannot start in the past
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="endDate"
                control={control}
                rules={{ 
                  required: 'End date is required',
                  validate: (value) => {
                    const startDate = watch('startDate')
                    if (startDate && value && new Date(value) <= new Date(startDate)) {
                      return 'End date must be after start date'
                    }
                    return true
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                    inputProps={{
                      min: watch('startDate') || new Date().toISOString().split('T')[0]
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    placeholder="Describe your campaign objectives and target audience..."
                  />
                )}
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
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
              <Controller
                name="individualGoal"
                control={control}
                rules={{ min: { value: 0, message: 'Goal must be positive' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Individual Goal Amount"
                    type="number"
                    error={!!errors.individualGoal}
                    helperText={errors.individualGoal?.message}
                    placeholder="e.g., 200000"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="campaignCurrency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Campaign Currency</InputLabel>
                    <Select {...field} label="Campaign Currency">
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Overall Campaign Goals
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="overallGoal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Overall Campaign Goal"
                    type="number"
                    error={!!errors.overallGoal}
                    helperText={errors.overallGoal?.message}
                    placeholder="e.g., 2000000"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> Overall goal uses the same campaign currency: {watch('campaignCurrency') || 'MXN'}
              </Typography>
            </Grid>

            {/* Points Allocation Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Points Allocation Configuration
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="amountPerPoint"
                control={control}
                rules={{ required: 'Amount per point is required', min: { value: 0.01, message: 'Must be greater than 0' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Amount to sell to get one point"
                    type="number"
                    inputProps={{ step: 0.01, min: 0.01 }}
                    error={!!errors.amountPerPoint}
                    helperText={errors.amountPerPoint?.message || `Amount in ${watch('campaignCurrency') || 'MXN'} that participant must sell to earn 1 point (will be rounded up)`}
                    placeholder="e.g., 200"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Example:</strong> If set to 200 {watch('campaignCurrency') || 'MXN'}, participant gets 1 point for every 200 {watch('campaignCurrency') || 'MXN'} in sales (rounded up)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="individualGoalBonus"
                control={control}
                rules={{ min: { value: 0, message: 'Must be 0 or greater' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Individual Goal Bonus Points"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.individualGoalBonus}
                    helperText={errors.individualGoalBonus?.message || "Bonus points when individual goal is met"}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="overallGoalBonus"
                control={control}
                rules={{ min: { value: 0, message: 'Must be 0 or greater' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Overall Goal Bonus Points"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.overallGoalBonus}
                    helperText={errors.overallGoalBonus?.message || "Bonus points when overall goal is met"}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="totalPointsMinted"
                control={control}
                rules={{ min: { value: 0, message: 'Must be 0 or greater' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Total Points Minted for Campaign"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.totalPointsMinted}
                    helperText={errors.totalPointsMinted?.message || "Total points minted by the campaign"}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="rewards"
                control={control}
                rules={{ required: 'Rewards description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Rewards & Redemption Options"
                    multiline
                    rows={4}
                    error={!!errors.rewards}
                    helperText={errors.rewards?.message || "Describe what participants can redeem with their points"}
                    placeholder="e.g., Gift cards, merchandise, discounts, exclusive experiences..."
                  />
                )}
              />
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

      case 2:
        return (
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
              <Controller
                name="eligibilityCriteria"
                control={control}
                rules={{ required: 'Eligibility criteria is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Eligibility Criteria"
                    multiline
                    rows={6}
                    error={!!errors.eligibilityCriteria}
                    helperText={errors.eligibilityCriteria?.message}
                    placeholder="Describe eligibility criteria in natural language. For example: 'Salespeople must achieve individual sales goals of 200,000 MXN in Premium Line products. Only completed orders with status 'Completed' are eligible. Points are awarded based on Premium Line sales volume.'"
                  />
                )}
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

      case 3:
        return (
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
              <Controller
                name="tlpEndpointUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="TLP Endpoint URL"
                    error={!!errors.tlpEndpointUrl}
                    helperText={errors.tlpEndpointUrl?.message}
                    placeholder="https://exata-customer.pravici.io"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="tlpApiKey"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="TLP API Key"
                    type="password"
                    error={!!errors.tlpApiKey}
                    helperText={errors.tlpApiKey?.message}
                    placeholder="Enter your TLP API key"
                    inputProps={{
                      autocomplete: 'new-password'
                    }}
                  />
                )}
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

      case 4:
        return (
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
              <Controller
                name="databaseType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.databaseType}>
                    <InputLabel>Database Type</InputLabel>
                    <Select {...field} label="Database Type">
                      <MenuItem value="postgres">PostgreSQL</MenuItem>
                      <MenuItem value="mysql">MySQL</MenuItem>
                      <MenuItem value="mongodb">MongoDB</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="databaseHost"
                control={control}
                rules={{ required: 'Database host is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Database Host"
                    error={!!errors.databaseHost}
                    helperText={errors.databaseHost?.message}
                    placeholder="e.g., localhost"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="databasePort"
                control={control}
                rules={{ required: 'Database port is required', min: { value: 1, message: 'Must be a positive number' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Database Port"
                    type="number"
                    error={!!errors.databasePort}
                    helperText={errors.databasePort?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="databaseName"
                control={control}
                rules={{ required: 'Database name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Database Name"
                    error={!!errors.databaseName}
                    helperText={errors.databaseName?.message}
                    placeholder="e.g., incentiva"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="databaseUsername"
                control={control}
                rules={{ required: 'Database username is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Database Username"
                    error={!!errors.databaseUsername}
                    helperText={errors.databaseUsername?.message}
                    placeholder="e.g., postgres"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="databasePassword"
                control={control}
                rules={{ required: 'Database password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Database Password"
                    type="password"
                    error={!!errors.databasePassword}
                    helperText={errors.databasePassword?.message}
                    placeholder="Enter your database password"
                    inputProps={{
                      autocomplete: 'new-password'
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> The database connection details will be used to store campaign data, 
                  user points, and redemption history.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Campaign Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review all the information before creating your campaign.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Campaign Name:</strong> {watchedValues.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {watchedValues.description || 'No description provided'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Campaign Period:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watchedValues.startDate} to {watchedValues.endDate}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Goals:</strong>
                  </Typography>
                  {watchedValues.individualGoal && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Individual: {watchedValues.individualGoal.toLocaleString()} {watchedValues.campaignCurrency}
                    </Typography>
                  )}
                  {watchedValues.overallGoal && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Overall: {watchedValues.overallGoal.toLocaleString()} {watchedValues.campaignCurrency}
                    </Typography>
                  )}
                  {watchedValues.amountPerPoint && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Amount per Point: {watchedValues.amountPerPoint.toLocaleString()} {watchedValues.campaignCurrency}
                    </Typography>
                  )}
                  {watchedValues.totalPointsMinted && watchedValues.totalPointsMinted > 0 && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Total Points Minted: {watchedValues.totalPointsMinted.toLocaleString()}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Eligibility:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watchedValues.eligibilityCriteria || 'No eligibility criteria specified'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>TLP Configuration:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Endpoint: {watchedValues.tlpEndpointUrl}
                  </Typography>
                  <Typography variant="body2">
                    API Key: {watchedValues.tlpApiKey ? '••••••••' : 'Not provided'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Database Connection:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Type: {watchedValues.databaseType}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Host: {watchedValues.databaseHost}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Port: {watchedValues.databasePort}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Name: {watchedValues.databaseName}
                  </Typography>
                  <Typography variant="body2">
                    Username: {watchedValues.databaseUsername}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Important:</strong> After creating the campaign, you'll need to upload your database schema 
                  and generate campaign rules before the campaign can be executed.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header with Logo */}
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
            <Typography variant="h4" component="h1" gutterBottom>
              Create New Campaign
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up a comprehensive loyalty campaign with AI-powered rule generation and TLP integration.
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  size="large"
                >
                  Back
                </Button>

                <Box>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      size="large"
                      disabled={!isValid}
                      sx={{
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                        }
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={!isValid || isSubmitting}
                      sx={{
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                        }
                      }}
                    >
                      {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
  )
}

export default CreateCampaignPage 