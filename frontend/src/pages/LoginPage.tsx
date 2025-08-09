import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Divider
} from '@mui/material'
import { Google, Microsoft } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError('')
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleMicrosoftLogin = () => {
    window.location.href = '/api/auth/microsoft'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFEBDF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Bauhaus-style background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 100%)',
          borderRadius: '50%',
          opacity: 0.1,
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(45deg, #FFAB71 0%, #FFD93D 100%)',
          borderRadius: '50%',
          opacity: 0.1,
          transform: 'rotate(-30deg)',
        }}
      />

      <Card 
        sx={{ 
          maxWidth: 450, 
          width: '100%', 
          mx: 2,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Bauhaus accent line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #FF6B35 0%, #FF8E53 50%, #FFAB71 100%)',
          }}
        />

        <CardContent sx={{ p: 4, pt: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <img 
                src="/assets/images/incentiva.png" 
                alt="Incentiva Logo" 
                style={{ 
                  height: '80px',
                  maxWidth: '200px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              className="incentiva-logo"
              sx={{ 
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                mb: 1,
                color: '#FF6B35' // Orange theme color
              }}
            >
              Incentiva.me
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.01em'
              }}
            >
              Loyalty Campaign Management
            </Typography>
            <div className="incentiva-accent-line" style={{ 
              margin: '16px auto', 
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #FF6B35 0%, #FF8E53 50%, #FFAB71 100%)',
              borderRadius: '2px'
            }}></div>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: '1px solid rgba(191, 97, 106, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF6B35',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF6B35',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <TextField
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF6B35',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF6B35',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 4, 
                mb: 3,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.025em',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                  boxShadow: '0 6px 16px rgba(255, 107, 53, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#E5E9F0',
                  color: '#9CA3AF',
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                px: 2,
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}
            >
              OR
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderWidth: '2px',
                borderColor: '#E5E9F0',
                color: '#2E3440',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#FF6B35',
                  backgroundColor: 'rgba(208, 135, 112, 0.05)',
                  borderWidth: '2px',
                }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Microsoft />}
              onClick={handleMicrosoftLogin}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderWidth: '2px',
                borderColor: '#E5E9F0',
                color: '#2E3440',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#FF6B35',
                  backgroundColor: 'rgba(208, 135, 112, 0.05)',
                  borderWidth: '2px',
                }
              }}
            >
              Microsoft
            </Button>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              mt: 3,
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            Don't have an account? Contact your administrator.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage 