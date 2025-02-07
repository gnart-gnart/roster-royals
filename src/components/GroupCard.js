import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';

const sportIcons = {
  nfl: SportsFootballIcon,
  nba: SportsBasketballIcon,
  mlb: SportsBaseballIcon,
  soccer: SportsSoccerIcon,
};

function GroupCard({ name, sport, memberCount, onClick }) {
  const SportIcon = sportIcons[sport] || SportsSoccerIcon;

  return (
    <Card sx={{
      backgroundColor: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(96, 165, 250, 0.2)',
      '&:hover': {
        border: '1px solid rgba(96, 165, 250, 0.4)',
      },
      transition: 'all 0.2s ease-in-out',
    }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SportIcon sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {sport.toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {memberCount} members
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default GroupCard; 