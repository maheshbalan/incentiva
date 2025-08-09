import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Divider
} from '@mui/material'
import { useParams } from 'react-router-dom'

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Campaign Details
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Premium Line Sales Campaign
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Increase sales of Premium Line products through targeted incentives
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip label="Active" color="success" />
                <Chip label="2 months" variant="outlined" />
                <Chip label="156 participants" variant="outlined" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Progress Overview
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Individual Goal Progress</Typography>
                  <Typography variant="body2">75%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Regional Goal Progress</Typography>
                  <Typography variant="body2">60%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Stats
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Points Awarded
                </Typography>
                <Typography variant="h4">
                  1,250,000
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Average Points per Participant
                </Typography>
                <Typography variant="h6">
                  8,012
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Days Remaining
                </Typography>
                <Typography variant="h6">
                  23
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CampaignDetailPage 