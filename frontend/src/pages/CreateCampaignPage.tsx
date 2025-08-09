import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import { useForm } from 'react-hook-form'

const CreateCampaignPage: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const steps = ['Basic Information', 'Goals & Rules', 'TLP Configuration', 'Review & Create']

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Campaign
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('name', { required: 'Campaign name is required' })}
                  fullWidth
                  label="Campaign Name"
                  error={!!errors.name}
                  helperText={errors.name?.message as string}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('description')}
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('startDate', { required: 'Start date is required' })}
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message as string}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('endDate', { required: 'End date is required' })}
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message as string}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Campaign Goals
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('individualGoal')}
                  fullWidth
                  label="Individual Goal (BRL)"
                  type="number"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('regionalGoal')}
                  fullWidth
                  label="Regional Goal (BRL)"
                  type="number"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('eligibility')}
                  fullWidth
                  label="Eligibility Criteria"
                  multiline
                  rows={4}
                  placeholder="Describe eligibility criteria in natural language..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    size="large"
                  >
                    Create Campaign
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                  >
                    Save Draft
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CreateCampaignPage 