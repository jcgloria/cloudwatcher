import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Switch, Typography, FormControlLabel } from '@mui/material';
import { resetClient } from '../api/cloudwatch';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    onToggleDarkMode: (bool: boolean) => void;
}

export default function CredentialsDialog({ open, onClose, onToggleDarkMode }: DialogProps) {
    const [access_key, setAccessKey] = useState('');
    const [secret_key, setSecretKey] = useState('');
    const [region, setRegion] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const accessKey = localStorage.getItem('accessKey');
        const secretKey = localStorage.getItem('secretKey');
        const region = localStorage.getItem('region');
        if (accessKey && secretKey && region) {
            setAccessKey(accessKey);
            setSecretKey(secretKey);
            setRegion(region);
        }
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setDarkMode(JSON.parse(savedTheme));
        }
    }, []);

    useEffect(() => {
        onToggleDarkMode(darkMode);

    }, [darkMode]);

    const handleSave = () => {
        localStorage.setItem('accessKey', access_key);
        localStorage.setItem('secretKey', secret_key);
        localStorage.setItem('region', region);
        resetClient();
        onClose();
    };

    return (
        <div>
            <Dialog open={open} onClose={onClose} PaperProps={{ style: { width: '70%' } }}>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">AWS Credentials</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={() => setDarkMode(!darkMode)}
                                    color="primary"
                                />
                            }
                            label="Dark Mode"
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box marginBottom={2}>
                        <TextField
                            fullWidth
                            value={access_key}
                            onChange={(e) => setAccessKey(e.target.value)}
                            id="access_key"
                            label="Access Key"
                            variant="filled"
                        />
                    </Box>
                    <Box marginBottom={2}>
                        <TextField
                            fullWidth
                            value={secret_key}
                            onChange={(e) => setSecretKey(e.target.value)}
                            id="secret_key"
                            label="Secret Key"
                            variant="filled"
                        />
                    </Box>
                    <Box marginBottom={2}>
                        <TextField
                            fullWidth
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            id="region"
                            label="Region"
                            variant="filled"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
