import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Settings } from '@mui/icons-material';
import CredentialsDialog from './CredentialsDialog';

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

const drawerWidth = 240;

interface AppBarComponentProps {
    open: boolean;
    handleDrawerOpen: () => void;
    settings: boolean;
    setSettings: (value: boolean) => void;
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({ open, handleDrawerOpen, settings, setSettings }) => {
    return (
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
            <CredentialsDialog open={settings} onClose={() => setSettings(false)} />
        </AppBar>
    );
}

export default AppBarComponent;
