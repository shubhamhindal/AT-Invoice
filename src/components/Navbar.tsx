'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Image from 'next/image';
import Logo from '../../public/images/invoice.jpeg';
import { toast } from 'react-toastify';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const navItems = [
    { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Items', href: '/items', icon: <Inventory2OutlinedIcon /> },
  ];
  if (pathname?.includes('/print/')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const drawer = (
    <Box sx={{ pt: 4, px: 2, textAlign: 'center' }}>
      <Image
        src={Logo}
        width={80}
        height={60}
        alt="Invoice App"
        style={{ borderRadius: 8, marginBottom: 16 }}
      />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.href)}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  '& .MuiListItemIcon-root': { color: '#2563eb' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mt: 4,
              color: 'error.main',
              bgcolor: '#fef2f2',
              '&:hover': { bgcolor: '#fee2e2' },
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: 'white',
          color: '#1e293b',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, sm: 70 } }}>
          <Box
            onClick={() => router.push('/dashboard')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Image
              src={Logo}
              width={80}
              height={60}
              alt="Invoice App"
              style={{ borderRadius: 8 }}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => router.push(item.href)}
                  startIcon={item.icon}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: isActive(item.href) ? '#2563eb' : '#475569',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '100%',
                      height: 3,
                      backgroundColor: '#2563eb',
                      borderRadius: 2,
                      opacity: isActive(item.href) ? 1 : 0,
                      transition: 'opacity 0.2s',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  ml: 3,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuIcon sx={{ fontSize: 30 }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { width: 280, backgroundColor: '#ffffff' },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}