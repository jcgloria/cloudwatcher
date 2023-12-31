import { useEffect, useState } from "react";
import { fetchLogEvents, resetEventNextToken, eventNextToken, hasFetchedAllLogs } from "../api/cloudwatch";
import { FilteredLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { TableContainer, Typography } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';


type LogListProps = {
    logGroupName: string;
    startTime: number;
    endTime: number;
    setError: (error: string) => void;
};

export default function LogList({ logGroupName, startTime, endTime, setError }: LogListProps) {
    const [logs, setLogs] = useState<FilteredLogEvent[]>([]);
    const [hasMoreLogs, setHasMoreLogs] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        resetEventNextToken();
        setLogs([]);
        setHasMoreLogs(false);
        setError("");
        fetchLogs();
    }, [logGroupName, startTime, endTime]);


    async function fetchLogs() {
        if (isLoading || (eventNextToken === undefined && hasFetchedAllLogs)) {
            return;
        }
        setIsLoading(true);
        try {
            let newLogs = await fetchLogEvents(logGroupName, startTime, endTime);
            setLogs(prevLogs => [...prevLogs, ...newLogs]);
            setHasMoreLogs(!hasFetchedAllLogs);
        } catch (e: any) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                console.error("Unknown error in fetchLogEvents call:", e);
            }
        }
        setIsLoading(false);
    }
    

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,

            paddingTop: theme.spacing(0.2),     // Adjusted vertical padding
            paddingBottom: theme.spacing(0.2),  // Adjusted vertical padding
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
            paddingTop: theme.spacing(0.2),     // Adjusted vertical padding
            paddingBottom: theme.spacing(0.2),  // Adjusted vertical padding
        },
        '&:first-child': {
            width: '20%',
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ margin: "12px" }}>
                {logGroupName}
            </Typography>
            {
                isLoading ? <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box> : null}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((row) => (
                            row && row.timestamp ? (
                                <StyledTableRow
                                    key={row.eventId}>
                                    <StyledTableCell component="th" scope="row">
                                        {new Date(row.timestamp).toLocaleString()}
                                    </StyledTableCell>
                                    <StyledTableCell>{row.message}</StyledTableCell>
                                </StyledTableRow>
                            ) : null
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {logs.length == 0 && !isLoading &&
                <Typography align="center" color="textSecondary" style={{ marginTop: 16 }}>
                    No Logs to Display
                </Typography>
            }
            {/* Load More Button */}
            {!isLoading && hasMoreLogs && (
                <Button
                    sx={{ marginTop: '12px', width: '100%' }}
                    onClick={fetchLogs} variant="text">Load More</Button>
            )}
            { isLoading && <CircularProgress sx={{ marginTop: '12px'}} />}
        </div>
    );
}
