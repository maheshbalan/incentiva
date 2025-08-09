import React, { useState } from 'react'
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
  Alert
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Person,
  AdminPanelSettings
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

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

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'PARTICIPANT' as 'ADMIN' | 'PARTICIPANT',
    password: ''
  })

  // Mock users data - in real app this would come from API
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'incentiva-admin@incentiva.me',
      firstName: 'Incentiva',
      lastName: 'Admin',
      role: 'ADMIN',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'PARTICIPANT',
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '3',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'PARTICIPANT',
      createdAt: '2024-01-20T00:00:00Z'
    }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

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

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <AdminPanelSettings /> : <Person />
  }

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : 'primary'
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
      <Typography variant="h4" component="h1" gutterBottom>
        Administration
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage users, campaigns, and system settings.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" />
          <Tab label="Campaign Management" />
          <Tab label="System Settings" />
        </Tabs>
      </Box>

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
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteUser(user.id)}
                          color="error"
                          disabled={user.id === '1'} // Don't allow deleting main admin
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

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Campaign Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced campaign management features will be implemented here.
              This will include assigning users to campaigns, setting up campaign rules, 
              and managing campaign lifecycle.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System-wide configuration options will be available here.
              This includes TLP integration settings, notification preferences,
              and system maintenance options.
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
    </Box>
  )
}

export default AdminPage