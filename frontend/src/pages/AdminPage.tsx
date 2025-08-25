import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
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
  List,
  Switch,
  Divider,
  Autocomplete,
  Badge
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Person,
  AdminPanelSettings,
  Refresh,
  Settings,
  Campaign,
  Group,
  SmartToy,
  Key,
  PlayArrow
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { AIProvider } from '@incentiva/shared'
import { authService } from '../services/authService'

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'ADMIN' | 'PARTICIPANT'
  createdAt: string
}

interface Campaign {
  id: string
  name: string
  status: string
  participantCount: number
  startDate: string
  endDate: string
}

interface AIModelConfig {
  id: string
  provider: AIProvider
  modelName: string
  apiKey: string
  isActive: boolean
}

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openAIDialog, setOpenAIDialog] = useState(false)
  const [openParticipantDialog, setOpenParticipantDialog] = useState(false)
  const [selectedParticipantUsers, setSelectedParticipantUsers] = useState<User[]>([])
  const [currentParticipants, setCurrentParticipants] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingAI, setEditingAI] = useState<AIModelConfig | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'PARTICIPANT' as 'ADMIN' | 'PARTICIPANT',
    password: ''
  })

  const [aiForm, setAIForm] = useState({
    provider: AIProvider.ANTHROPIC,
    modelName: '',
    apiKey: '',
    isActive: false
  })

  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [campaignError, setCampaignError] = useState<string | null>(null)

  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    setLoadingCampaigns(true)
    setCampaignError(null)
    
    try {
      const { data } = await authService.api.get('/campaigns')
      if (data.success && data.data) setCampaigns(data.data)
      else throw new Error(data.error || 'Failed to fetch campaigns')
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setCampaignError(error instanceof Error ? error.message : 'Failed to fetch campaigns')
    } finally {
      setLoadingCampaigns(false)
    }
  }

  // Fetch users from API
  const fetchUsers = async () => {
    setLoadingUsers(true)
    setUserError(null)
    
    try {
      const { data } = await authService.api.get('/auth/users')
      if (data.success && data.data) setUsers(data.data)
      else throw new Error(data.error || 'Failed to fetch users')
    } catch (error) {
      console.error('Error fetching users:', error)
      setUserError(error instanceof Error ? error.message : 'Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchCampaigns()
    fetchUsers()
  }, [])

  // Campaign execution
  const handleExecuteCampaign = async (campaign: Campaign) => {
    try {
      if (campaign.status !== 'APPROVED') {
        const confirmApprove = confirm('Campaign must be APPROVED before execution. Approve now?')
        if (!confirmApprove) return
        await authService.api.patch(`/campaigns/${campaign.id}/status`, { status: 'APPROVED' })
      }
      const { data } = await authService.api.post(`/campaigns/${campaign.id}/execute`)
      if (data.success) {
        alert(`Campaign "${campaign.name}" execution started successfully!`)
        fetchCampaigns()
      } else {
        throw new Error(data.error || 'Failed to execute campaign')
      }
    } catch (error) {
      console.error('Error executing campaign:', error)
      alert(`Failed to execute campaign: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const [aiModels, setAIModels] = useState<AIModelConfig[]>([
    {
      id: '1',
      provider: AIProvider.ANTHROPIC,
      modelName: 'claude-3-5-sonnet-20241022',
      apiKey: '••••••••••••••••',
      isActive: true
    },
    {
      id: '2',
      provider: AIProvider.OPENAI,
      modelName: 'gpt-4-turbo-preview',
      apiKey: '••••••••••••••••',
      isActive: false
    }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // User Management
  const handleCreateUser = () => {
    setEditingUser(null)
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      role: 'PARTICIPANT',
      password: ''
    })
    setOpenUserDialog(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      password: ''
    })
    setOpenUserDialog(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userForm, password: undefined }
          : u
      ))
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userForm.email,
        firstName: userForm.firstName || undefined,
        lastName: userForm.lastName || undefined,
        role: userForm.role,
        createdAt: new Date().toISOString()
      }
      setUsers([...users, newUser])
    }
    setOpenUserDialog(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
  }

  const handleResetPassword = (userId: string) => {
    // In real app, this would send a password reset email
    alert(`Password reset email sent to user ${userId}`)
  }

  // AI Model Management
  const handleCreateAIModel = () => {
    setEditingAI(null)
    setAIForm({
      provider: AIProvider.ANTHROPIC,
      modelName: '',
      apiKey: '',
      isActive: false
    })
    setOpenAIDialog(true)
  }

  const handleEditAIModel = (aiModel: AIModelConfig) => {
    setEditingAI(aiModel)
    setAIForm({
      provider: aiModel.provider,
      modelName: aiModel.modelName,
      apiKey: aiModel.apiKey,
      isActive: aiModel.isActive
    })
    setOpenAIDialog(true)
  }

  const handleSaveAIModel = () => {
    if (editingAI) {
      // Update existing AI model
      setAIModels(aiModels.map(a => 
        a.id === editingAI.id 
          ? { ...a, ...aiForm }
          : a
      ))
    } else {
      // Create new AI model
      const newAIModel: AIModelConfig = {
        id: Date.now().toString(),
        ...aiForm
      }
      setAIModels([...aiModels, newAIModel])
    }
    setOpenAIDialog(false)
  }

  const handleDeleteAIModel = (aiModelId: string) => {
    setAIModels(aiModels.filter(a => a.id !== aiModelId))
  }

  const handleToggleAIModel = (aiModelId: string) => {
    setAIModels(aiModels.map(a => 
      a.id === aiModelId 
        ? { ...a, isActive: !a.isActive }
        : a
    ))
  }

  // Participant Management
  const handleManageParticipants = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setSelectedParticipantUsers([])
    // Load existing participants for this campaign
    authService.api
      .get(`/campaigns/${campaign.id}/participants`)
      .then(({ data }) => {
        const users = (data?.data || []).map((uc: any) => uc.user)
        setCurrentParticipants(users)
      })
      .catch((err) => {
        console.error('Failed to load campaign participants', err)
        setCurrentParticipants([])
      })
      .finally(() => setOpenParticipantDialog(true))
  }

  const handleAddParticipants = async (campaignId: string) => {
    try {
      for (const u of selectedParticipantUsers) {
        await authService.api.post(`/campaigns/${campaignId}/participants`, { userId: u.id })
      }
      // Refresh participants list and campaign counters
      const { data } = await authService.api.get(`/campaigns/${campaignId}/participants`)
      const users = (data?.data || []).map((uc: any) => uc.user)
      setCurrentParticipants(users)
      setSelectedParticipantUsers([])
      alert('Participants added successfully')
      fetchCampaigns()
    } catch (err) {
      console.error('Failed to add participants', err)
      alert('Failed to add participants')
    }
  }

  const handleRemoveParticipant = async (campaignId: string, userId: string) => {
    try {
      await authService.api.delete(`/campaigns/${campaignId}/participants/${userId}`)
      const { data } = await authService.api.get(`/campaigns/${campaignId}/participants`)
      const users = (data?.data || []).map((uc: any) => uc.user)
      setCurrentParticipants(users)
      fetchCampaigns()
    } catch (err) {
      console.error('Failed to remove participant', err)
      alert('Failed to remove participant')
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <AdminPanelSettings /> : <Person />
  }

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : 'primary'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'DRAFT': return 'warning'
      case 'COMPLETED': return 'info'
      default: return 'default'
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied. You must be an administrator to view this page.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
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
            Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, campaigns, AI models, and system settings.
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" />
          <Tab label="Campaign Management" />
          <Tab label="AI Models" />
          <Tab label="System Settings" />
        </Tabs>
      </Box>

      {/* User Management Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateUser}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                  }
                }}
              >
                Create User
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleEditUser(user)}
                          color="primary"
                          title="Edit User"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleResetPassword(user.id)}
                          color="secondary"
                          title="Reset Password"
                        >
                          <Key />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteUser(user.id)}
                          color="error"
                          disabled={user.id === '1'} // Don't allow deleting main admin
                          title="Delete User"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Campaign Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Campaign Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchCampaigns}
                disabled={loadingCampaigns}
              >
                Refresh Campaigns
              </Button>
            </Box>
            
            {campaignError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {campaignError}
              </Alert>
            )}
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingCampaigns ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Loading campaigns...</TableCell>
                    </TableRow>
                  ) : campaignError ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" color="error">
                        {campaignError}
                      </TableCell>
                    </TableRow>
                  ) : campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No campaigns found.</TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.status}
                            color={getStatusColor(campaign.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={campaign.participantCount} color="primary">
                            <Group />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.startDate} - {campaign.endDate}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Group />}
                            onClick={() => handleManageParticipants(campaign)}
                          >
                            Manage Participants
                          </Button>
                          {campaign.status === 'DRAFT' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PlayArrow />}
                              onClick={() => handleExecuteCampaign(campaign)}
                              color="success"
                              title="Execute Campaign"
                              sx={{ ml: 1 }}
                            >
                              Execute Campaign
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* AI Models Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                AI Model Configuration
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateAIModel}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
                  }
                }}
              >
                Add AI Model
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aiModels.map((aiModel) => (
                    <TableRow key={aiModel.id}>
                      <TableCell>
                        <Chip
                          icon={<SmartToy />}
                          label={aiModel.provider}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{aiModel.modelName}</TableCell>
                      <TableCell>
                        <Switch
                          checked={aiModel.isActive}
                          onChange={() => handleToggleAIModel(aiModel.id)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleEditAIModel(aiModel)}
                          color="primary"
                          title="Edit AI Model"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteAIModel(aiModel.id)}
                          color="error"
                          title="Delete AI Model"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* System Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Global system configuration options will be available here.
              This includes notification preferences, system maintenance options,
              and other administrative settings.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* User Create/Edit Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              required
            />
            <TextField
              fullWidth
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userForm.role}
                label="Role"
                onChange={(e) => setUserForm({...userForm, role: e.target.value as 'ADMIN' | 'PARTICIPANT'})}
              >
                <MenuItem value="PARTICIPANT">User (Participant)</MenuItem>
                <MenuItem value="ADMIN">Administrator</MenuItem>
              </Select>
            </FormControl>
            {!editingUser && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Model Create/Edit Dialog */}
      <Dialog open={openAIDialog} onClose={() => setOpenAIDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAI ? 'Edit AI Model' : 'Add AI Model'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>AI Provider</InputLabel>
              <Select
                value={aiForm.provider}
                label="AI Provider"
                onChange={(e) => setAIForm({...aiForm, provider: e.target.value as AIProvider})}
              >
                <MenuItem value={AIProvider.ANTHROPIC}>Anthropic (Claude)</MenuItem>
                <MenuItem value={AIProvider.OPENAI}>OpenAI (GPT)</MenuItem>
                <MenuItem value={AIProvider.GOOGLE}>Google (Gemini)</MenuItem>
                <MenuItem value={AIProvider.AZURE}>Azure OpenAI</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Model Name"
              value={aiForm.modelName}
              onChange={(e) => setAIForm({...aiForm, modelName: e.target.value})}
              placeholder="e.g., claude-3-5-sonnet-20241022"
              required
            />
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={aiForm.apiKey}
              onChange={(e) => setAIForm({...aiForm, apiKey: e.target.value})}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={aiForm.isActive ? 'active' : 'inactive'}
                label="Status"
                onChange={(e) => setAIForm({...aiForm, isActive: e.target.value === 'active'})}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAIDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAIModel}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            {editingAI ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Participant Management Dialog */}
      <Dialog open={openParticipantDialog} onClose={() => setOpenParticipantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Participants - {selectedCampaign?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select users to add as participants to this campaign.
            </Typography>
            
            <Autocomplete
              multiple
              options={users.filter(u => u.role === 'PARTICIPANT')}
              getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''} (${option.email})`.trim()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Participants"
                  placeholder="Choose users..."
                />
              )}
              value={selectedParticipantUsers}
              onChange={(_, value) => setSelectedParticipantUsers(value)}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.firstName && option.lastName 
                        ? `${option.firstName} ${option.lastName}`
                        : option.email
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
            />

            {/* Current Participants */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" gutterBottom>
              Current Participants
            </Typography>
            {currentParticipants.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No participants yet.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentParticipants.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : '-'}
                        </TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => selectedCampaign && handleRemoveParticipant(selectedCampaign.id, p.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipantDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => selectedCampaign && handleAddParticipants(selectedCampaign.id)}
            sx={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B35 100%)',
              }
            }}
          >
            Add Participants
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminPage