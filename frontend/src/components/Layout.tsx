import React, { useState } from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Campaign,
  Person,
  Logout,
  Settings,
  AccountBalance
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import incentivaLogo from '../assets/images/incentiva.png'

const drawerWidth = 240

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Campaigns', icon: <Campaign />, path: '/campaigns' },
    ...(user?.role === 'ADMIN' ? [
      { text: 'Administration', icon: <Settings />, path: '/admin' },
    ] : [
      { text: 'My Dashboard', icon: <AccountBalance />, path: '/participant' },
    ]),
  ]

  const drawer = (
    <div>
      <Toolbar sx={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
        color: '#2E3440',
        borderBottom: '1px solid rgba(255, 107, 53, 0.2)',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2
      }}>
        <Box sx={{ mb: 1 }}>
          <img 
            src={incentivaLogo}
            alt="Incentiva Logo" 
            style={{ 
              height: '60px',
              maxWidth: '160px',
              objectFit: 'contain'
            }}
          />
        </Box>
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#FF6B35'
          }}
        >
          Incentiva.me
        </Typography>
      </Toolbar>
      <div className="incentiva-accent-line"></div>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(208, 135, 112, 0.1)',
                  borderLeft: '4px solid #FF6B35',
                  '&:hover': {
                    backgroundColor: 'rgba(208, 135, 112, 0.15)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(46, 52, 64, 0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? '#FF6B35' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #2E3440 0%, #4C566A 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '-0.01em'
            }}
          >
            Loyalty Campaign Management
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{
              border: '2px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                border: '2px solid rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Avatar sx={{ 
              width: 32, 
              height: 32,
              backgroundColor: '#FF6B35',
              fontWeight: 600
            }}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#ECEFF4',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Layout 