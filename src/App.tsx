import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cyan, indigo } from '@mui/material/colors';
import AppBarComponent from './components/AppBar';
import { Alert } from '@mui/material';

// Set the theme colors
const lightTheme = createTheme({
  palette: {
    mode: 'light',  // explicitly set light mode
    primary: indigo,
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // explicitly set dark mode
    primary: cyan,
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

  const [open, setOpen] = useState(true); // Drawer open by default
  const savedTheme = localStorage.getItem('darkMode');
  const initialDarkMode = savedTheme ? JSON.parse(savedTheme) : true;
  const [darkMode, setDarkMode] = useState(initialDarkMode);


  // Date pickers
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, 'day')); // Default to 1 day ago
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs()); // Default to today

  // Log groups
  const [logGroups, setLogGroups] = useState<LogGroup[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLogGroupName, setSelectedLogGroupName] = useState<string | null>(null);

  // Settings dialog
  const [settings, setSettings] = useState(false);

  // Error dialog
  const [error, setError] = useState('');

  // Reset the selected log group name when the list of log groups changes
  useEffect(() => {
    setSelectedLogGroupName(null);
  }, [logGroups]);

  // Get the dark mode setting from local storage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Fetch the log groups when the search value changes
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    async function fetchLogGroups() {
      setError('');
      try {
        const response = await listLogGroups(searchValue, 10);
        if (response && response.logGroups) {
          // Check if the previously selected log group name is still in the new list
          const isLogGroupNameStillPresent = response.logGroups.some(group => group.logGroupName && group.logGroupName === selectedLogGroupName);
          // If it's not, reset the selected log group name
          if (!isLogGroupNameStillPresent) {
            setSelectedLogGroupName(null);
          }
          // Set the log groups
          setLogGroups(response.logGroups);
        }
      } catch (error: any) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          console.error("Unknown error in listLogGroups call:", error);
        }
      }
    }
    // Wait for 2 seconds after the last change to searchValue before fetching
    timerId = setTimeout(() => {
      fetchLogGroups();
    }, 1000);
    // Cleanup function: If the user types again within the 2 seconds, clear the previous timeout
    return () => {
      clearTimeout(timerId);
    };
  }, [searchValue]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarComponent open={open} handleDrawerOpen={() => setOpen(true)} settings={settings} setSettings={setSettings} onToggleDarkMode={setDarkMode} />
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
            <IconButton onClick={() => setOpen(false)}>
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
          {error &&
            <Alert sx={{ marginBottom: "5px" }} severity='error'>{error}</Alert>}
          <ActionPanel
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          {selectedLogGroupName && startDate && endDate ? (
            <LogList logGroupName={selectedLogGroupName} startTime={startDate.valueOf()} endTime={endDate.valueOf()} setError={(e) => setError(e)} />
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