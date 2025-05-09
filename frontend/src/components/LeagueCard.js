import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  AvatarGroup,
  Button,
  CardMedia,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function LeagueCard({ league }) {
  const navigate = useNavigate();

  const openLeague = () => {
    navigate(`/league/${league.id}`);
  };

  // Log league and member data for debugging
  console.log(`LeagueCard - League: ${league.name}, members:`, league.members);
  if (league.members && league.members.length > 0) {
    console.log(`LeagueCard - First member sample:`, league.members[0]);
  }

  // Check if the current user is the captain
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isCaptain = league.captain?.id === currentUser.id;

  // Function to get the proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return `/images/default_image_updated.png`;
    
    // Check if this is the default image path
    if (imageUrl.includes('default_image_updated.png')) {
      return `/images/default_image_updated.png`;
    }
    
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

  // Function to get member profile image source
  const getMemberImageSource = (member) => {
    // If this is the current user, check for embedded image data
    if (member.id === currentUser.id) {
      // Try embedded image from user object first
      if (currentUser.embeddedImageData) {
        return currentUser.embeddedImageData;
      }
      
      // Then try session storage with user-specific key
      const userSpecificKey = `profileImageDataUrl_${member.id}`;
      const profileImageDataUrl = sessionStorage.getItem(userSpecificKey);
      if (profileImageDataUrl) {
        return profileImageDataUrl;
      }
    }
    
    // Add fallback to use API-based avatar for other users
    if (member.profile_image_url) {
      return getImageUrl(member.profile_image_url);
    }
    
    // Return avatar API URL as fallback - this ensures all users have an image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=random`;
  };

  return (
    <Card 
      className="league-card" 
      onClick={openLeague}
      sx={{
        cursor: 'pointer',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(226, 232, 240, 0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
        },
        position: 'relative',
      }}
    >
      {/* League Image */}
      <CardMedia
        component="img"
        height="140"
        image={getImageUrl(league.image)}
        alt={league.name}
        onError={(e) => {
          // If image fails to load, replace with local fallback
          e.target.onerror = null; // Prevent infinite error loop
          e.target.src = "/images/default_image_updated.png";
        }}
        sx={{
          objectFit: 'cover',
          borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
        }}
      />
      
      {/* Gradient overlay at the top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '5px',
          background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
          zIndex: 1,
        }}
      />

      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {league.name}
          </Typography>
          {isCaptain && (
            <Chip
              label="Captain"
              size="small"
              sx={{
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                color: '#818CF8',
                fontSize: '0.7rem',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>

        {league.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {league.description.length > 100 ? `${league.description.substring(0, 100)}...` : league.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 20, mr: 1, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {league.members?.length || 1} member{(league.members?.length || 1) !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {league.sports && league.sports.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {league.sports.map((sport) => (
              <Chip
                key={sport}
                label={sport}
                size="small"
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60A5FA',
                  borderRadius: '4px',
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <AvatarGroup max={3}>
            {league.members?.map((member) => (
              <Avatar
                key={member.id}
                alt={member.username}
                src={getMemberImageSource(member)}
                sx={{ width: 28, height: 28 }}
              />
            ))}
          </AvatarGroup>
          
          <Button
            endIcon={<ArrowForwardIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: '#94A3B8',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              openLeague();
            }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default LeagueCard; 