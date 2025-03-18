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
import { COLORS } from './styles/constants';

// Custom theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: COLORS.primary,
      light: COLORS.primaryLight,
      dark: COLORS.primaryDark,
    },
    secondary: {
      main: COLORS.secondary,
      light: COLORS.secondaryLight,
      dark: COLORS.secondaryDark,
    },
    background: {
      default: '#171717',
      paper: COLORS.bgCard,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    error: {
      main: COLORS.error,
    },
    warning: {
      main: COLORS.warning,
    },
    info: {
      main: COLORS.info,
    },
    success: {
      main: COLORS.success,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: COLORS.bgCard,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${COLORS.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: COLORS.bgInput,
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(25, 25, 35, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${COLORS.border}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.border}`,
        },
        head: {
          fontWeight: 600,
        },
      },
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:id"
            element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-group"
            element={
              <ProtectedRoute>
                <CreateGroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-friend"
            element={
              <ProtectedRoute>
                <AddFriendPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId/choose-bets"
            element={
              <ProtectedRoute>
                <ChooseBetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId/sport/:sportKey"
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