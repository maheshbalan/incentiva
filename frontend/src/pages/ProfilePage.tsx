import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role: {user?.role}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue={user?.firstName}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue={user?.lastName}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={user?.email}
                    margin="normal"
                    disabled
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" size="large">
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>

              <Button
                variant="outlined"
                fullWidth
                color="secondary"
              >
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage 