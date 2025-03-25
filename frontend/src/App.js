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
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AddBetPage from './pages/AddBetPage';
import PlaceUserBetPage from './pages/PlaceUserBetPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Purple
    },
    secondary: {
      main: '#f472b6', // Pink accent
    },
    background: {
      default: '#0C0D14', // Match the exact dark background from HomePage
      paper: '#161E2E', // Slightly lighter dark blue
    },
    text: {
      primary: '#f8fafc', // Brighter white
      secondary: '#cbd5e1', // Lighter gray
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0C0D14', // Update to match HomePage background
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
          borderRadius: 8,
          border: '1px solid rgba(139, 92, 246, 0.2)', // Updated to purple border
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            border: '1px solid rgba(139, 92, 246, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // More rounded buttons to match home page
          textTransform: 'none',
          border: '1px solid rgba(139, 92, 246, 0.3)', // Updated to purple border
          '&:hover': {
            border: '1px solid rgba(139, 92, 246, 0.6)',
          },
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
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
          <Route 
            path="/group/:groupId/event/:eventKey/add-bet" 
            element={
              <ProtectedRoute>
                <AddBetPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/group/:groupId/event/:eventKey/place-user-bet" 
            element={
              <ProtectedRoute>
                <PlaceUserBetPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 