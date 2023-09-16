import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { listLogGroups } from './api/cloudwatch';
import ActionPanel from './components/ActionPanel';
import { LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import TextField from '@mui/material/TextField';
import LogList from './components/LogList';
import dayjs from 'dayjs';
import { Settings } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { indigo } from '@mui/material/colors';
import CredentialsDialog from './components/CredentialsDialog';

//add "#fedc97" as a secondary color
const appTheme = createTheme({
  palette: {
    primary: indigo, // This will set the primary color to indigo/purple
    secondary: {
      main: '#fedc97', // This will set the secondary color to orange
    }
  },
});


const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, 'day')); // Default to 1 day ago
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs()); // Default to today

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [logGroups, setLogGroups] = useState<LogGroup[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLogGroupName, setSelectedLogGroupName] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    setSelectedLogGroupName(null);
  }, [logGroups]);

  useEffect(() => {
    async function fetchLogGroups() {
      try {
        const response = await listLogGroups(searchValue, 10);
        if (response && response.logGroups) {
          // Check if the previously selected log group name is still in the new list
          const isLogGroupNameStillPresent = response.logGroups.some(group => group.logGroupName && group.logGroupName === selectedLogGroupName);

          if (!isLogGroupNameStillPresent) {
            setSelectedLogGroupName(null);
          }

          setLogGroups(response.logGroups);
        }
      } catch (error) {
        console.error("Error fetching log groups:", error);
      }
    }
    fetchLogGroups();
  }, [searchValue]);

  return (
    <ThemeProvider theme={appTheme}>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cloudwatcher
          </Typography>
          <IconButton size="large"
            aria-controls="menu-appbar"
            color='inherit'
            onClick={() => setSettings(true)}
            >
            <Settings />
          </IconButton>
        </Toolbar>
        <CredentialsDialog open={settings} onClose={() => setSettings(false) }/>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value)}
            style={{ marginRight: theme.spacing(1) }}
          />
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {logGroups.length === 0 ? (
            <Typography align="center" color="textSecondary" style={{ marginTop: 16 }}>
              No Log Groups Found
            </Typography>
          ) : (
            logGroups.map((logGroup) => (
              <ListItem key={logGroup.logGroupName} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (logGroup.logGroupName) {
                      setSelectedLogGroupName(logGroup.logGroupName);
                    }
                  }}
                  style={{
                    backgroundColor: selectedLogGroupName === logGroup.logGroupName ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                  }}
                >
                  <ListItemText
                    primary={logGroup.logGroupName}
                    primaryTypographyProps={{
                      fontSize: '0.8rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))

          )}
        </List>
        <Divider />
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <ActionPanel
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        {selectedLogGroupName && startDate && endDate ? (
          <LogList logGroupName={selectedLogGroupName} startTime={startDate.valueOf()} endTime={endDate.valueOf()} />
        ) : (
          <Typography align="center" color="textSecondary" style={{ marginTop: 16 }}>
            No Log Group Selected
          </Typography>
        )}

      </Main>
    </Box>
    </ThemeProvider>
  );
}