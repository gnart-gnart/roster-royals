import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Avatar, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import NavBar from '../components/NavBar';
import CircularImageCropper from '../components/CircularImageCropper';
import { getUserProfile, updateUserProfile, getUserBettingStats, getUserBetHistory } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [bettingStats, setBettingStats] = useState({
    total_bets: 0,
    win_rate: 0,
    current_streak: 0,
    lifetime_winnings: 0,
    user_level: 1,
    date_joined: ''
  });
  const [betHistory, setBetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [betDetailsOpen, setBetDetailsOpen] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    bio: ''
  });
  const [image, setImage] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to get profile image URL from various sources
  const getProfileImageUrl = (user) => {
    if (!user) return null;
    
    // Debug: Log the user object to see all available image-related properties
    console.log("User profile data:", user);
    if (user.profile_image_url) console.log("Profile image URL:", user.profile_image_url);
    
    // Function to get the proper image URL
    const getImageUrl = (imageUrl) => {
      if (!imageUrl) return null;
      
      // If the URL is already absolute (starts with http or https), return it as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // If the URL starts with /media/, prepend the API URL
      if (imageUrl.startsWith('/media/')) {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      }
      // Otherwise, assume it's a relative media path and construct the full URL
      return `${process.env.REACT_APP_API_URL}/media/${imageUrl.replace('media/', '')}`;
    };
    
    // Try embedded image from user object first
    if (user.embeddedImageData) {
      console.log("Using embedded image data from user object");
      return user.embeddedImageData;
    }
    
    // Then try session storage with user-specific key
    if (user.id) {
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        console.log("Using image from session storage");
        return profileImageDataUrl;
      }
    }
    
    // Check for profile_image_url (serialized property)
    if (user.profile_image_url) {
      return getImageUrl(user.profile_image_url);
    }
    
    // Check for profile_image (direct field from the view)
    if (user.profile_image) {
      return getImageUrl(user.profile_image);
    }
    
    // Return avatar API URL as fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=random`;
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Function to debug the profile image URL
  const validateProfileImageUrl = (url) => {
    if (!url) {
      console.warn("Profile image URL is empty");
      return false;
    }
    
    console.log(`Validating profile image URL: ${url}`);
    
    // Check if URL starts with /media/
    if (!url.includes('/media/')) {
      console.warn("Profile image URL doesn't include '/media/'");
    }
    
    // Log full URL for debugging
    console.log(`Full URL that would be used: ${url}?nocache=${Math.random()}`);
    
    return true;
  };

  // Add a function to fetch betting stats
  const fetchBettingStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const stats = await getUserBettingStats();
      setBettingStats(stats);
    } catch (error) {
      console.error('Failed to fetch betting stats:', error);
      setError('Failed to load betting statistics. Please try again later.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Add a function to fetch bet history
  const fetchBetHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const history = await getUserBetHistory();
      // Log the first bet object to see its structure
      if (history && history.length > 0) {
        console.log("Sample bet object structure:", history[0]);
      }
      setBetHistory(history);
    } catch (error) {
      console.error('Failed to fetch bet history:', error);
      setError('Failed to load betting history. Please try again later.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Make an explicit call to log the user's profile image
  useEffect(() => {
    if (user && user.profile_image_url) {
      console.log("User has profile_image_url:", user.profile_image_url);
      console.log("Resolved image URL:", getProfileImageUrl(user));
    } else {
      console.log("User doesn't have profile_image_url", user);
    }
  }, [user]);

  useEffect(() => {
    // Always fetch user data when the profile page loads
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching user profile data...");
        const userData = await getUserProfile();
        console.log("Fetched user data:", userData);
        
        // Check if there's a profile image URL
        if (userData.profile_image_url) {
          console.log("User has profile_image_url:", userData.profile_image_url);
          
          // Try to preload the image
          const img = new Image();
          img.onload = () => console.log("Profile image preloaded successfully");
          img.onerror = (e) => console.error("Error preloading profile image:", e);
          img.src = userData.profile_image_url;
        } else {
          console.log("User profile data doesn't include profile_image_url");
        }
        
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set form data with current values
        setEditFormData({
          username: userData.username || '',
          bio: userData.bio || ''
        });
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Execute fetch - always fetch profile data when viewing the profile page
    fetchUserData();
    fetchBettingStats();
    fetchBetHistory();
  }, [fetchBettingStats, fetchBetHistory]);

  // Function to toggle showing all bet history
  const handleToggleHistory = () => {
    setShowAllHistory(!showAllHistory);
  };

  // Calculate achievements based on bet history and user stats
  const calculateAchievements = useCallback(() => {
    // Helper function to safely format dates within this function
    const safeFormatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    };

    // Default achievements with unlocked state
    const achievementsList = [
      { 
        id: 1, 
        name: 'First Win', 
        description: 'Win your first bet', 
        icon: '🏆', 
        unlocked: false,
        unlockedDate: null
      },
      { 
        id: 2, 
        name: 'Hot Streak', 
        description: 'Win 5 bets in a row', 
        icon: '🔥', 
        unlocked: false,
        unlockedDate: null
      },
      { 
        id: 3, 
        name: 'Big Spender', 
        description: 'Place a bet of 500 points or more', 
        icon: '💰', 
        unlocked: false,
        unlockedDate: null
      },
      {
        id: 4,
        name: 'Big Winner',
        description: 'Accumulate $1000 in lifetime winnings',
        icon: '💵',
        unlocked: false,
        unlockedDate: null
      },
      {
        id: 5,
        name: 'High Roller',
        description: 'Win a bet with payout over 1000',
        icon: '💎',
        unlocked: false,
        unlockedDate: null
      }
    ];

    if (!betHistory || betHistory.length === 0) {
      return achievementsList;
    }

    // 1. First Win achievement
    const hasWin = betHistory.some(bet => bet.result.toLowerCase() === 'won');
    if (hasWin) {
      const firstWin = betHistory
        .filter(bet => bet.result.toLowerCase() === 'won')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[0].unlocked = true;
      achievementsList[0].unlockedDate = safeFormatDate(firstWin.date);
    }

    // 2. Hot Streak achievement
    // Find consecutive wins
    let maxStreak = 0;
    let currentStreak = 0;
    let streakEndDate = null;

    // Sort bets by date
    const sortedBets = [...betHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedBets.forEach(bet => {
      if (bet.result.toLowerCase() === 'won') {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          streakEndDate = bet.date;
        }
      } else {
        currentStreak = 0;
      }
    });

    if (maxStreak >= 5) {
      achievementsList[1].unlocked = true;
      achievementsList[1].unlockedDate = safeFormatDate(streakEndDate);
    }

    // 3. Big Spender achievement
    const bigBet = betHistory.some(bet => {
      const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
      return amount >= 500;
    });

    if (bigBet) {
      const firstBigBet = betHistory
        .filter(bet => {
          const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
          return amount >= 500;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[2].unlocked = true;
      achievementsList[2].unlockedDate = safeFormatDate(firstBigBet.date);
    }

    // 4. Big Winner achievement
    if (bettingStats.lifetime_winnings >= 1000) {
      // For unlocked date, use the date of the most recent bet as an approximation
      const latestBet = betHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      achievementsList[3].unlocked = true;
      achievementsList[3].unlockedDate = safeFormatDate(latestBet?.date);
    }

    // 5. High Roller achievement
    const highPayoutBet = betHistory.some(bet => {
      if (bet.result.toLowerCase() !== 'won') return false;
      const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
      return payout >= 1000;
    });

    if (highPayoutBet) {
      const firstHighPayout = betHistory
        .filter(bet => {
          if (bet.result.toLowerCase() !== 'won') return false;
          const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
          return payout >= 1000;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      achievementsList[4].unlocked = true;
      achievementsList[4].unlockedDate = safeFormatDate(firstHighPayout.date);
    }

    return achievementsList;
  }, [betHistory, bettingStats]);

  // State for achievements
  const [achievements, setAchievements] = useState([]);

  // Update achievements when bet history changes
  useEffect(() => {
    setAchievements(calculateAchievements());
  }, [betHistory, calculateAchievements]);

  // Get the bets to display based on showAllHistory state
  const getDisplayedBets = () => {
    if (showAllHistory) {
      return betHistory;
    } else {
      return betHistory.slice(0, 4); // Show only the first 4 bets
    }
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setCropDialogOpen(true);
    }
  };

  const handleCropComplete = (croppedImage) => {
    // Create FormData for image upload
    const formData = new FormData();
    formData.append('profile_image', croppedImage);
    
    // Read the file as a data URL to store directly
    const reader = new FileReader();
    reader.onloadend = () => {
      // Store the data URL
      const imageDataUrl = reader.result;
      console.log("Image converted to data URL");
      
      // Update the user object with the embedded image
      const updatedUser = {...user};
      updatedUser.embeddedImageData = imageDataUrl;
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Store in session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${user.id}`;
      sessionStorage.setItem(userSpecificKey, imageDataUrl);
      console.log(`Stored image in session storage with key: ${userSpecificKey}`);
      
      // Close the cropper
      setCropDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Profile image updated successfully',
        severity: 'success'
      });
      
      // Notify other components
      window.dispatchEvent(new Event('userUpdated'));
      
      // Still proceed with the backend update
      updateUserProfile(formData)
        .then(response => {
          console.log("Profile updated on backend, response:", response);
        })
        .catch(err => {
          console.error("Backend profile update failed, but image is still displayed", err);
        });
    };
    reader.onerror = () => {
      setError('Failed to process image');
      console.error('Error reading file');
    };
    reader.readAsDataURL(croppedImage);
  };

  const handleCropCancel = () => {
    setImage(null);
    setCropDialogOpen(false);
  };

  const handleSubmitProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!editFormData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    try {
      const response = await updateUserProfile(editFormData);
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      // Dispatch an event to notify that user data has been updated
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      setError('Failed to update profile');
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Function to handle clicking on a bet
  const handleBetClick = (bet) => {
    setSelectedBet(bet);
    setBetDetailsOpen(true);
  };
  
  // Function to close bet details dialog
  const handleCloseBetDetails = () => {
    setBetDetailsOpen(false);
  };

  // Function to navigate to event details
  const handleViewEvent = () => {
    if (selectedBet && selectedBet.event_id && selectedBet.league_id) {
      navigate(`/league/${selectedBet.league_id}/event/${selectedBet.event_id}`);
      setBetDetailsOpen(false);
    }
  };

  // Generate historical performance data - Make this more stable
  const generatePerformanceData = useCallback(() => {
    // Don't generate mock data, just return empty array if no history
    if (!betHistory || betHistory.length === 0) {
      return [];
    }

    // For real data, only sort and calculate once
    // Sort history by date (oldest first)
    const sortedHistory = [...betHistory].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate cumulative win rate and profit over time
    let wins = 0;
    let totalBets = 0;
    let cumulativeProfit = 0;

    return sortedHistory.map((bet) => {
      // Update counters
      totalBets++;
      if (bet.result.toLowerCase() === 'won') {
        wins++;
        // Add profit (payout minus amount wagered)
        // Safely parse payout value, handling different data types
        const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
        const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
        cumulativeProfit += (payout - amount);
      } else if (bet.result.toLowerCase() === 'lost') {
        // Subtract amount wagered
        const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
        cumulativeProfit -= amount;
      }

      return {
        date: formatDate(bet.date),
        winRate: totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0,
        profit: Math.round(cumulativeProfit)
      };
    });
  }, [betHistory, formatDate]);

  // Get performance data - only update when necessary
  const [performanceData, setPerformanceData] = useState([]);

  // Only update performance data when betting history changes - with strict checks
  useEffect(() => {
    // Only update if there's a meaningful change in bet history
    if (betHistory.length > 0 || performanceData.length === 0) {
      const newData = generatePerformanceData();
      
      // Only update state if data actually changed
      const dataChanged = 
        performanceData.length !== newData.length || 
        JSON.stringify(performanceData) !== JSON.stringify(newData);
      
      if (dataChanged) {
        setPerformanceData(newData);
      }
    }
  }, [betHistory, generatePerformanceData, performanceData]);

  // Now, replace the PerformanceChart component with a more stable version
  const PerformanceChart = memo(({ data, loading }) => {
    // Remove console.log to reduce noise and prevent unnecessary work
    
    // Memoize chart data and options to prevent unnecessary recalculations
    // Move useMemo calls outside of conditional statements
    const chartData = useMemo(() => {
      if (!data || data.length === 0) return null;
      
      return {
        labels: data.map(item => item.date),
        datasets: [
          {
            label: 'Win Rate (%)',
            data: data.map(item => item.winRate),
            borderColor: '#8B5CF6',
            borderWidth: 3,
            backgroundColor: 'rgba(139, 92, 246, 0.1)', // Reduced opacity
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 4,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#121a29',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#8B5CF6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
          {
            label: 'Profit',
            data: data.map(item => item.profit),
            borderColor: '#10B981',
            borderWidth: 3,
            backgroundColor: 'rgba(16, 185, 129, 0.1)', // Reduced opacity
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 4,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#121a29',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#10B981',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
        ],
      };
    }, [data]);

    const options = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false, // Set back to false to let the chart fill its container
      animation: {
        duration: 0 // Disable animations to prevent flickering
      },
      devicePixelRatio: 2, // Increase resolution for sharper charts
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            usePointStyle: true, // Use rounded points instead of rectangles for legend
            padding: 15,
            color: '#f8fafc',
            font: {
              family: 'Arial',
              size: 12,
              weight: 'bold'
            },
            boxWidth: 8,
            boxHeight: 8,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          usePointStyle: true,
          titleFont: {
            family: 'Arial',
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Arial',
            size: 12
          },
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return context.datasetIndex === 0 
                ? `${label}: ${value}%` 
                : `${label}: $${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Win Rate (%)',
            color: '#a78bfa',
            font: {
              family: 'Arial',
              size: 12,
              weight: 'bold'
            },
            padding: {top: 0, bottom: 10}
          },
          min: 0, // Start from 0 to avoid confusion
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawTicks: false,
            drawBorder: false,
          },
          ticks: {
            color: '#9CA3AF',
            padding: 10,
            font: {
              size: 11
            },
            stepSize: 25 // More readable step size
          },
          border: {
            display: false
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Profit ($)',
            color: '#10B981',
            font: {
              family: 'Arial',
              size: 12,
              weight: 'bold'
            },
            padding: {top: 0, bottom: 10}
          },
          grid: {
            drawOnChartArea: false,
            drawTicks: false,
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            padding: 10,
            font: {
              size: 11
            },
            callback: function(value) {
              return '$' + value;
            }
          },
          border: {
            display: false
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawTicks: false,
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: {
            color: '#9CA3AF',
            padding: 10,
            font: {
              size: 11
            },
            maxRotation: 0 // Horizontal labels
          },
          border: {
            display: false
          }
        }
      },
      layout: {
        padding: 10
      },
      elements: {
        line: {
          borderWidth: 3,
          tension: 0.4 // Smooth curve
        },
        point: {
          hitRadius: 10, // Easier to hover
        }
      }
    }), []); // Empty dependency array since nothing inside options needs to change

    // Now handle the conditional rendering after the hooks are defined
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress size={30} sx={{ color: '#8B5CF6' }} />
        </Box>
      );
    }
    
    if (!data || data.length === 0) {
      return (
        <Typography variant="body1" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          No performance data available
        </Typography>
      );
    }

    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          p: 2, // Increase padding
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.1) 0%, rgba(15, 23, 42, 0.2) 100%)',
          borderRadius: '12px',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden' // Prevent overflow
        }}
      >
        <Line options={options} data={chartData} height={null} width={null} /> {/* Set height and width to null */}
      </Box>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison for memo to only re-render when necessary
    if (prevProps.loading !== nextProps.loading) return false;
    if (!prevProps.data && !nextProps.data) return true;
    if (!prevProps.data || !nextProps.data) return false;
    if (prevProps.data.length !== nextProps.data.length) return false;
    
    // Deep compare data arrays to prevent unnecessary re-renders
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
  });

  // Create a memoized PerformanceMetrics component
  const PerformanceMetrics = memo(({ betHistory, performanceData }) => {
    // Add sport key mapping function
    const mapSportKeyToName = (sportKey) => {
      if (!sportKey) return 'Unknown';
      const key = sportKey.toLowerCase();
      if (key.startsWith('americanfootball')) return 'Football';
      if (key.startsWith('basketball')) return 'Basketball';
      if (key.startsWith('soccer')) return 'Soccer';
      if (key.startsWith('boxing')) return 'Boxing';
      if (key.startsWith('tennis')) return 'Tennis';
      if (key.startsWith('golf')) return 'Golf';
      if (key.startsWith('baseball')) return 'Baseball';
      if (key.startsWith('hockey')) return 'Hockey';
      return 'Other';
    };

    // Calculate metrics once
    const { avgWinAmount, bestWin, favoriteSport } = useMemo(() => {
      // Debug: Log the full betHistory
      console.log('Full betHistory:', betHistory);

      // Calculate average win amount
      const wonBets = betHistory.filter(bet => bet.result.toLowerCase() === 'won');
      let avgWinAmount = '$0';
      if (wonBets.length > 0) {
        const totalPayout = wonBets.reduce((sum, bet) => {
          const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
          const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
          return sum + (payout - amount);
        }, 0);
        
        avgWinAmount = `$${Math.round(totalPayout / wonBets.length)}`;
      }
      
      // Calculate best win
      let bestWin = '$0';
      if (wonBets.length > 0) {
        const bestBet = wonBets.reduce((best, bet) => {
          const payout = parseFloat(typeof bet.payout === 'string' ? bet.payout.replace(/[^0-9.-]+/g, '') : bet.payout || 0);
          const amount = parseFloat(typeof bet.amount === 'string' ? bet.amount.replace(/[^0-9.-]+/g, '') : bet.amount || 0);
          const profit = payout - amount;
          return profit > best.profit ? { profit, bet } : best;
        }, { profit: 0, bet: null });
        bestWin = `$${Math.round(bestBet.profit)}`;
      }
      
      // Calculate favorite sport with improved sport mapping
      let favoriteSport = 'N/A';
      const sportCounts = betHistory.reduce((counts, bet) => {
        // Get standardized sport name using the mapping function
        const sport = bet.sport ? mapSportKeyToName(bet.sport) : 'Unknown';
        counts[sport] = (counts[sport] || 0) + 1;
        return counts;
      }, {});

      console.log("Sport counts:", sportCounts);

      const entries = Object.entries(sportCounts);
      if (entries.length > 0) {
        // Sort entries by count (highest first)
        entries.sort((a, b) => b[1] - a[1]);
        const [topSport, topCount] = entries[0];
        const totalBets = Object.values(sportCounts).reduce((a, b) => a + b, 0);

        // If top sport is Unknown, show Mixed
        if (topSport === 'Unknown') {
          favoriteSport = 'Mixed';
        } else {
          // If top sport has more than half of all bets, show it as favorite
          if (topCount > totalBets / 2) {
            favoriteSport = topSport;
          } else {
            // Otherwise, show Mixed
            favoriteSport = 'Mixed';
          }
        }
      }
      
      return { avgWinAmount, bestWin, favoriteSport };
    }, [betHistory]);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Average Win */}
          <Grid item xs={6} sm={6}>
            <Box sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: '#10B981', fontSize: '1rem', mr: 1 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 'medium' }}>
                  Avg Win Amount
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                {avgWinAmount}
              </Typography>
            </Box>
          </Grid>
          
          {/* Most Profitable Bet */}
          <Grid item xs={6} sm={6}>
            <Box sx={{ bgcolor: 'rgba(22, 28, 36, 0.7)', p: 2, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmojiEventsIcon sx={{ color: '#F59E0B', fontSize: '1rem', mr: 1 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 'medium' }}>
                  Best Win
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                {bestWin}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  });

  return (
    <Box sx={{ bgcolor: '#0C0D14', minHeight: '100vh' }}>
      <NavBar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 4, 
          alignItems: 'center',
          px: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              sx={{ 
                color: '#f8fafc',
                mr: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: '#f8fafc',
              textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)'
            }}>
              My Profile
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
            sx={{
              borderColor: 'rgba(139, 92, 246, 0.3)',
              color: '#f8fafc',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: 'rgba(139, 92, 246, 0.5)',
              }
            }}
          >
            Settings
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.8)', 
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(30, 41, 59, 0) 70%)',
                filter: 'blur(30px)',
              }} />
              
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  color: '#f8fafc',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  }
                }}
                onClick={handleEditProfile}
              >
                <EditIcon />
              </IconButton>
              
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Box sx={{
                  position: 'relative',
                  width: 140,
                  height: 140,
                  mb: 3
                }}>
                  <Avatar 
                    src={getProfileImageUrl(user)}
                    alt={user.username || "User"}
                    sx={{ 
                      bgcolor: '#8B5CF6', 
                      width: 140, 
                      height: 140, 
                      fontSize: '56px',
                      border: '4px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                    }}
                    imgProps={{
                      style: { objectFit: 'cover' },
                      onLoad: (e) => {
                        console.log("Profile image loaded successfully:", e.target.src);
                      },
                      onError: (e) => {
                        console.error('Error loading profile image:', e);
                        console.log('Image src was:', e.target.src);
                        e.target.src = ''; // Clear src to show fallback
                      }
                    }}
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    right: -6,
                    bottom: -6,
                    borderRadius: '50%',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    animation: 'pulse 3s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        opacity: 0.6,
                        transform: 'scale(1)'
                      },
                      '50%': {
                        opacity: 0.3,
                        transform: 'scale(1.05)'
                      },
                      '100%': {
                        opacity: 0.6,
                        transform: 'scale(1)'
                      }
                    }
                  }} />
                </Box>
                
                <IconButton 
                  component="label"
                  sx={{ 
                    position: 'absolute',
                    bottom: 20,
                    right: -10,
                    bgcolor: 'rgba(139, 92, 246, 0.9)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 10px rgba(139, 92, 246, 0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 1)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <EditIcon sx={{ fontSize: 20 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </IconButton>
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#f8fafc', 
                mb: 1,
                background: 'linear-gradient(45deg, #f8fafc, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {user.username}
              </Typography>
              
              {user.bio && (
                <Typography variant="body2" sx={{ 
                  color: '#9CA3AF', 
                  mb: 2,
                  maxWidth: '90%',
                  mx: 'auto',
                  lineHeight: 1.5
                }}>
                  {user.bio}
                </Typography>
              )}
              
              <Chip 
                label={`Level ${loadingStats ? '...' : bettingStats.user_level}`}
                sx={{ 
                  bgcolor: 'rgba(139, 92, 246, 0.15)', 
                  color: '#8B5CF6',
                  mb: 2,
                  fontWeight: 'bold',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(8px)',
                  '& .MuiChip-label': {
                    px: 2
                  }
                }} 
              />
              
              <Typography variant="body2" sx={{ 
                color: '#9CA3AF', 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::before, &::after': {
                  content: '""',
                  height: '1px',
                  width: '20px',
                  backgroundColor: 'rgba(156, 163, 175, 0.3)',
                  display: 'inline-block',
                  mx: 1
                }
              }}>
                Member since {loadingStats ? '...' : bettingStats.date_joined}
              </Typography>
              
              <Paper 
                sx={{ 
                  bgcolor: 'rgba(22, 28, 36, 0.8)', 
                  p: 3, 
                  width: '100%',
                  borderRadius: 2,
                  mb: 2,
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.2), transparent 70%)',
                  opacity: 0.7
                }} />
                
                <AttachMoneyIcon sx={{ 
                  fontSize: 36, 
                  color: '#10B981', 
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }} />
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: '#10B981', 
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {loadingStats ? (
                    <CircularProgress size={30} sx={{ color: '#10B981' }} />
                  ) : (
                    `$${bettingStats.lifetime_winnings?.toFixed(2) || '0.00'}`
                  )}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: '#9CA3AF',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Lifetime Winnings
                </Typography>
              </Paper>

              <Paper 
                sx={{ 
                  bgcolor: 'rgba(22, 28, 36, 0.8)', 
                  p: 3, 
                  width: '100%',
                  borderRadius: 2,
                  mb: 3,
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at bottom right, rgba(255, 215, 0, 0.2), transparent 70%)',
                  opacity: 0.7
                }} />
                
                <AttachMoneyIcon sx={{ 
                  fontSize: 36, 
                  color: '#FFD700', 
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }} />
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: '#FFD700', 
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {typeof user.money === 'number' ? user.money.toFixed(2) : (user.money || '0.00')}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: '#9CA3AF',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Betting Balance
                </Typography>
              </Paper>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ 
                    bgcolor: 'rgba(22, 28, 36, 0.8)', 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                      bgcolor: 'rgba(25, 32, 45, 0.8)',
                    },
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <ScoreboardIcon sx={{ color: '#8B5CF6', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                        {loadingStats ? (
                          <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                        ) : (
                          bettingStats.total_bets
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Bets
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ 
                    bgcolor: 'rgba(22, 28, 36, 0.8)', 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                      bgcolor: 'rgba(25, 32, 45, 0.8)',
                    },
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <TrendingUpIcon sx={{ color: '#10B981', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                        {loadingStats ? (
                          <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                        ) : (
                          `${bettingStats.win_rate}%`
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Win Rate
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ 
                    bgcolor: 'rgba(22, 28, 36, 0.8)', 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid rgba(245, 158, 11, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                      bgcolor: 'rgba(25, 32, 45, 0.8)',
                    },
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <WhatshotIcon sx={{ 
                        color: loadingStats 
                          ? '#F59E0B' 
                          : bettingStats.current_streak > 0 
                            ? '#10B981' // green for positive streak
                            : bettingStats.current_streak < 0 
                              ? '#EF4444' // red for negative streak
                              : '#F59E0B', // default orange
                        mb: 1
                      }} />
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        color: loadingStats 
                          ? '#f8fafc' 
                          : bettingStats.current_streak > 0 
                            ? '#10B981' // green for positive streak
                            : bettingStats.current_streak < 0 
                              ? '#EF4444' // red for negative streak
                              : '#f8fafc' // default color for zero
                      }}>
                        {loadingStats ? (
                          <CircularProgress size={20} sx={{ color: '#f8fafc' }} />
                        ) : (
                          bettingStats.current_streak > 0 
                            ? `+${bettingStats.current_streak}` // add plus sign for positive streak
                            : bettingStats.current_streak
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        Streak
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper 
              sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiEventsIcon sx={{ color: '#FFD700', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  Achievements
                </Typography>
              </Box>
              
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {achievements.map(achievement => (
                    <Paper 
                      key={achievement.id} 
                      elevation={0}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(22, 28, 36, 0.7)',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: achievement.unlocked ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: achievement.unlocked ? '0 8px 16px rgba(255, 215, 0, 0.15)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                          bgcolor: achievement.unlocked ? 'rgba(25, 32, 45, 0.9)' : 'rgba(22, 28, 36, 0.8)',
                        }
                      }}
                    >
                      {achievement.unlocked && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.1), transparent 70%)',
                            opacity: 0.6,
                            zIndex: 0
                          }}
                        />
                      )}
                      
                      <Box 
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          mr: 2,
                          position: 'relative',
                          background: achievement.unlocked 
                            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                            : 'rgba(100, 100, 100, 0.2)',
                          boxShadow: achievement.unlocked 
                            ? '0 0 15px rgba(255, 215, 0, 0.5)' 
                            : 'none',
                          zIndex: 1
                        }}
                      >
                        {achievement.unlocked && (
                          <Box 
                            sx={{
                              position: 'absolute',
                              inset: '-4px',
                              borderRadius: '50%',
                              background: 'conic-gradient(#FFD700, transparent, #FFD700, transparent, #FFD700)',
                              animation: 'spin 4s linear infinite',
                              opacity: 0.7,
                              '@keyframes spin': {
                                '0%': {
                                  transform: 'rotate(0deg)',
                                },
                                '100%': {
                                  transform: 'rotate(360deg)',
                                },
                              },
                              zIndex: -1
                            }}
                          />
                        )}
                        {achievement.icon}
                      </Box>
                      
                      <Box sx={{ zIndex: 1, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: achievement.unlocked ? '#FFD700' : '#f8fafc',
                              textShadow: achievement.unlocked ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                            }}
                          >
                            {achievement.name}
                          </Typography>
                          
                          {achievement.unlocked && (
                            <Chip
                              label="Unlocked"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: 'rgba(255, 215, 0, 0.15)',
                                color: '#FFD700',
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                height: 20
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 0.5 }}>
                          {achievement.description}
                        </Typography>
                        
                        {achievement.unlocked ? (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 215, 0, 0.7)', 
                              display: 'block',
                              fontSize: '0.7rem'
                            }}
                          >
                            Unlocked: {achievement.unlockedDate}
                          </Typography>
                        ) : (
                          <Box 
                            sx={{
                              mt: 1,
                              width: '100%',
                              height: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: 5,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: '30%', // This could be dynamic based on progress toward achievement
                                height: '100%',
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: 5
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.8)', 
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: -80,
                left: -80,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(30, 41, 59, 0) 70%)',
                filter: 'blur(30px)',
              }} />
              
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChartIcon sx={{ color: '#10B981', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Performance
                    </Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{ 
                    width: '100%', 
                    height: 400, // Increase height from 300 to 400 to give more vertical space
                    position: 'relative',
                    mb: 3 // Add margin bottom for spacing
                  }}
                >
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative' 
                  }} key="chart-container">
                    <PerformanceChart 
                      data={performanceData} 
                      loading={loadingStats || loadingHistory} 
                    />
                  </Box>
                </Box>
                
                {/* Performance Metrics */}
                {!loadingStats && !loadingHistory && betHistory.length > 0 && (
                  <PerformanceMetrics betHistory={betHistory} performanceData={performanceData} />
                )}
              </Box>
            </Paper>
            
            <Paper 
              sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: 'rgba(30, 41, 59, 0.8)', 
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.1)', 
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                position: 'absolute',
                bottom: -80,
                right: -80,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
                filter: 'blur(30px)',
              }} />
              
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ color: '#8B5CF6', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      Recent Bets
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="text"
                    sx={{ 
                      color: '#8B5CF6',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                      }
                    }}
                    onClick={handleToggleHistory}
                  >
                    {showAllHistory ? 'Show Less' : 'View All'}
                  </Button>
                </Box>
                
                {loadingHistory ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#8B5CF6' }} />
                  </Box>
                ) : betHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                      No betting history found. Place your first bet to see it here!
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ bgcolor: 'transparent' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</TableCell>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Event</TableCell>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Pick</TableCell>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Amount</TableCell>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Result</TableCell>
                          <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Payout</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getDisplayedBets().map((bet) => (
                          <TableRow key={bet.id} 
                            onClick={() => handleBetClick(bet)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.03)'
                              }
                            }}
                          >
                            <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {formatDate(bet.date)}
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {bet.event}
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {bet.pick}
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {bet.amount}
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Chip
                                label={bet.result}
                                size="small"
                                sx={{
                                  bgcolor: bet.result.toLowerCase() === 'won' ? 'rgba(16, 185, 129, 0.1)' : 
                                          bet.result.toLowerCase() === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 
                                          'rgba(107, 114, 128, 0.1)',
                                  color: bet.result.toLowerCase() === 'won' ? '#10B981' : 
                                        bet.result.toLowerCase() === 'lost' ? '#EF4444' : 
                                        '#6B7280',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {bet.payout}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            color: '#f8fafc',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        {/* Decorative gradient elements */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(30, 41, 59, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
          filter: 'blur(30px)',
          zIndex: 0
        }} />

        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          pb: 2
        }}>
          <EditIcon sx={{ color: '#8B5CF6', mr: 1.5 }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #f8fafc, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Edit Profile
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          <form onSubmit={handleSubmitProfileUpdate}>
            <TextField
              margin="dense"
              label="Username"
              name="username"
              value={editFormData.username}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              error={error.includes('Username')}
              helperText={error.includes('Username') ? error : ''}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                }
              }}
              InputProps={{
                sx: { 
                  color: '#f8fafc',
                  backgroundColor: 'rgba(15, 23, 42, 0.3)'
                }
              }}
              InputLabelProps={{
                sx: { color: '#9CA3AF' }
              }}
            />
            
            <TextField
              margin="dense"
              label="Bio"
              name="bio"
              value={editFormData.bio}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              placeholder="Tell us about yourself..."
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                }
              }}
              InputProps={{
                sx: { 
                  color: '#f8fafc',
                  backgroundColor: 'rgba(15, 23, 42, 0.3)'
                }
              }}
              InputLabelProps={{
                sx: { color: '#9CA3AF' }
              }}
            />
          </form>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 1
        }}>
          <Button 
            onClick={handleCloseEditDialog}
            variant="text"
            sx={{ 
              color: '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc'
              },
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitProfileUpdate}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.8)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 1)',
              },
              textTransform: 'none',
              fontWeight: 'medium',
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {cropDialogOpen && image && (
        <CircularImageCropper
          image={image}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      
      <Dialog 
        open={betDetailsOpen} 
        onClose={handleCloseBetDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(30, 41, 59, 0.95)',
            color: '#f8fafc',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        {/* Decorative gradient elements */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(30, 41, 59, 0) 70%)',
          filter: 'blur(30px)',
          zIndex: 0
        }} />

        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          pb: 2
        }}>
          <SportsSoccerIcon sx={{ color: '#8B5CF6', mr: 1.5 }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #f8fafc, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Bet Details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          {selectedBet && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 2.5, 
                  bgcolor: 'rgba(15, 23, 42, 0.3)', 
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: '#f8fafc',
                    textAlign: 'center',
                    fontWeight: 'bold' 
                  }}>
                    {selectedBet.event}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={selectedBet.result}
                      sx={{
                        bgcolor: selectedBet.result.toLowerCase() === 'won' ? 'rgba(16, 185, 129, 0.15)' : 
                                selectedBet.result.toLowerCase() === 'lost' ? 'rgba(239, 68, 68, 0.15)' : 
                                'rgba(107, 114, 128, 0.15)',
                        color: selectedBet.result.toLowerCase() === 'won' ? '#10B981' : 
                              selectedBet.result.toLowerCase() === 'lost' ? '#EF4444' : 
                              '#6B7280',
                        fontWeight: 'bold',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    <Paper sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: '140px',
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      borderRadius: 2,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                        Your Pick
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                        {selectedBet.pick}
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: '140px',
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      borderRadius: 2,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                        Stake Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                        {selectedBet.amount}
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: '140px',
                      bgcolor: 'rgba(22, 28, 36, 0.7)',
                      borderRadius: 2,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                        Payout
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        color: selectedBet.result.toLowerCase() === 'won' ? '#10B981' : '#f8fafc'
                      }}>
                        {selectedBet.payout}
                      </Typography>
                    </Paper>
                  </Box>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                      Date Placed
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#f8fafc' }}>
                      {formatDate(selectedBet.date)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 1,
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={handleCloseBetDetails}
            variant="text"
            sx={{ 
              color: '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc'
              },
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Close
          </Button>
          
          <Button 
            onClick={handleViewEvent}
            variant="contained"
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.8)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 1)',
              },
              textTransform: 'none',
              fontWeight: 'medium',
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}
          >
            View Event
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePage; 