import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Primary button with purple background
export function PrimaryButton({ children, ...props }) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        backgroundColor: '#8b5cf6',
        '&:hover': {
          backgroundColor: '#7c3aed',
        },
        borderRadius: 2,
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
        py: 1,
        px: 2,
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

// Secondary button (outlined)
export function SecondaryButton({ children, ...props }) {
  return (
    <Button
      variant="outlined"
      {...props}
      sx={{
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        color: '#f8fafc',
        '&:hover': {
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.6)',
        },
        borderRadius: 2,
        fontWeight: '500',
        py: 1,
        px: 2,
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

// Success button (green)
export function SuccessButton({ children, ...props }) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        backgroundColor: '#10b981',
        '&:hover': {
          backgroundColor: '#059669',
        },
        borderRadius: 2,
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
        py: 1,
        px: 2,
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

// Danger button (red)
export function DangerButton({ children, ...props }) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        backgroundColor: '#ef4444',
        '&:hover': {
          backgroundColor: '#dc2626',
        },
        borderRadius: 2,
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        py: 1,
        px: 2,
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

// Ghost button (transparent)
export function GhostButton({ children, ...props }) {
  return (
    <Button
      variant="text"
      {...props}
      sx={{
        color: 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#f8fafc',
        },
        borderRadius: 2,
        fontWeight: '500',
        py: 1,
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

const BackButton = ({ onClick }) => (
  <SecondaryButton
    startIcon={<ArrowBackIcon />}
    onClick={onClick}
    sx={{ mr: 2 }}
  >
    Back
  </SecondaryButton>
);

export { BackButton }; 