import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const sportIcons = {
  nfl: SportsFootballIcon,
  nba: SportsBasketballIcon,
  mlb: SportsBaseballIcon,
  soccer: SportsSoccerIcon,
};

function GroupCard({ group, onClick }) {
  // Handle both old and new data structure
  const displaySports = () => {
    if (!group) return [];
    if (group.sports && Array.isArray(group.sports)) {
      return group.sports;
    }
    // Fallback for old data structure
    return group.sport ? [group.sport] : [];
  };

  // Get a color based on sport for visual variety
  const getGroupColor = () => {
    const sports = displaySports();
    if (sports.includes('nba')) return '#8b5cf6'; // Purple for NBA
    if (sports.includes('nfl')) return '#2563eb'; // Blue for NFL
    if (sports.includes('mlb')) return '#ef4444'; // Red for MLB
    if (sports.includes('soccer')) return '#10b981'; // Green for soccer
    return '#f59e0b'; // Default - amber
  };
  
  const groupColor = getGroupColor();

  return (
    <Card 
      sx={{
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 10px 15px -3px rgba(${groupColor === '#8b5cf6' ? '139, 92, 246' : groupColor === '#10b981' ? '16, 185, 129' : '96, 165, 250'}, 0.2)`,
          borderColor: `${groupColor}50`,
        },
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: -15,
          right: 20,
          backgroundColor: groupColor,
          borderRadius: '50%',
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {displaySports()[0] && sportIcons[displaySports()[0]] ? 
          React.createElement(sportIcons[displaySports()[0]], { sx: { fontSize: 18, color: 'white' } }) : 
          <GroupIcon sx={{ fontSize: 18, color: 'white' }} />
        }
      </Box>
      
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              mb: 1, 
              color: '#f8fafc',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {group.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleAltIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20, mr: 0.5 }} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
              {group.members?.length || 1} {group.members?.length === 1 ? 'member' : 'members'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {displaySports().map((sport) => (
              <Chip
                key={sport}
                label={sport.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: `${groupColor}20`,
                  color: groupColor,
                  borderRadius: 1,
                  fontWeight: 'medium',
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Box>
          
          {group.members && group.members.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.75rem' } }}>
                {group.members.map((member, index) => (
                  <Avatar 
                    key={index} 
                    alt={member.username || `Member ${index + 1}`}
                    src={member.avatar || undefined}
                    sx={{ 
                      bgcolor: groupColor,
                      color: 'white'
                    }}
                  >
                    {member.username ? member.username[0].toUpperCase() : `M${index + 1}`}
                  </Avatar>
                ))}
              </AvatarGroup>
              
              <Typography variant="body2" sx={{ 
                py: 0.5, 
                px: 1.5, 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500'
              }}>
                {group.active_bets ? `${group.active_bets} active` : 'No active bets'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default GroupCard; 