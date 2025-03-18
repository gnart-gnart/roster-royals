import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GroupPage from './pages/GroupPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateGroupPage from './pages/CreateGroupPage';
import AddFriendPage from './pages/AddFriendPage';
import ChooseBetsPage from './pages/ChooseBetsPage';
import SportEventsPage from './pages/SportEventsPage';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Purple primary (matching login button)
    },
    secondary: {
      main: '#10b981', // Green accent
    },
    background: {
      default: '#0f0f13', // Very dark blue-black (matching login)
      paper: '#1e293b', // Slightly lighter dark blue
    },
    text: {
      primary: '#f8fafc', // Brighter white
      secondary: '#cbd5e1', // Lighter gray
    },
    error: {
      main: '#ef4444', // Red
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    info: {
      main: '#60a5fa', // Blue
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#f8fafc', // Ensure table text is white
        },
        head: {
          color: '#cbd5e1', // Slightly dimmer white for table headers
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderRadius: 12,
          border: '1px solid rgba(96, 165, 250, 0.2)', // Subtle blue border
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            border: '1px solid rgba(96, 165, 250, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h4: {
          color: '#f8fafc', // Ensure headers are bright
          fontWeight: '600',
          letterSpacing: '-0.02em',
        },
        h6: {
          color: '#f8fafc', // Ensure headers are bright
          fontWeight: '500',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/create-group" element={
            <ProtectedRoute>
              <CreateGroupPage />
            </ProtectedRoute>
          } />
          <Route path="/add-friend" element={
            <ProtectedRoute>
              <AddFriendPage />
            </ProtectedRoute>
          } />
          <Route 
            path="/group/:groupId/choose-bets" 
            element={
              <ProtectedRoute>
                <ChooseBetsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/group/:groupId/choose-bets/:sportKey" 
            element={
              <ProtectedRoute>
                <SportEventsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 