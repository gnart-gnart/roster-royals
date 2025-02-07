import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GroupPage from './pages/GroupPage';
import CreateGroupPage from './pages/CreateGroupPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Bright blue
    },
    secondary: {
      main: '#f472b6', // Pink accent
    },
    background: {
      default: '#0f172a', // Very dark blue
      paper: '#1e293b', // Slightly lighter dark blue
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
          borderRadius: 8,
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
          borderRadius: 6,
          textTransform: 'none',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          '&:hover': {
            border: '1px solid rgba(96, 165, 250, 0.6)',
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 