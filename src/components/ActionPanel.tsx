import { Box, Button, ButtonGroup, MenuItem, Select, FormControl } from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SelectChangeEvent } from "@mui/material/Select";
import { useState, useEffect, Dispatch } from "react";
import dayjs from 'dayjs';

type PeriodType = 'day' | 'week' | 'month';

type ActionPanelProps = {
  startDate: dayjs.Dayjs | null;
  setStartDate: Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
  endDate: dayjs.Dayjs | null;
  setEndDate: Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
};

export default function ActionPanel({ startDate, setStartDate, endDate, setEndDate }: ActionPanelProps) {
  const [periodValue, setPeriodValue] = useState<PeriodType>('day');
  const [selectedButton, setSelectedButton] = useState<number | null>(null);


  useEffect(() => {
    if (selectedButton) {
      setStartDate(dayjs().subtract(selectedButton, periodValue));
      setEndDate(dayjs());
    }
  }, [selectedButton, periodValue]);

  const unselectButton = () => {
    setSelectedButton(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: ['column', 'row'],
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '0 12px',
        marginBottom: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px'
      }}
    >
      <Box sx={{ flex: 1, width: ['100%', '40%'], marginBottom: ['12px', 0], display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <RelativePanel periodValue={periodValue} setPeriodValue={setPeriodValue} selectedButton={selectedButton} setSelectedButton={setSelectedButton} />
      </Box>
      <Box sx={{ flex: 0.2 }} />  {/* This is the spacer */}
      <Box sx={{ flex: 1, width: ['100%', '40%'], display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AbsolutePanel
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          unselectButton={unselectButton}
        />
      </Box>
    </Box>
  );
}

const RelativePanel = ({ periodValue, setPeriodValue, selectedButton, setSelectedButton }: any) => {

  const handleChange = (event: SelectChangeEvent<string>) => {
    setPeriodValue(event.target.value);
  }

  return (
    <Box sx={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
        sx={{ flex: 0.8 }}
      >
        {[1, 2, 5, 10].map((num) => (
          <Button
            key={num}
            onClick={() => setSelectedButton(num)}
            sx={{
              flexGrow: 1,
              height: "60px",
              backgroundColor: num === selectedButton ? 'primary.dark' : 'primary.main'
            }}
          >
            {num}
          </Button>
        ))}
      </ButtonGroup>
      <FormControl sx={{ flex: 0.2 }}>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={periodValue}
          onChange={handleChange}
        >
          <MenuItem value={"day"}>days</MenuItem>
          <MenuItem value={"week"}>weeks</MenuItem>
          <MenuItem value={"month"}>months</MenuItem>

        </Select>
      </FormControl>
    </Box>
  );
};

const AbsolutePanel = ({ startDate, endDate, setStartDate, setEndDate, unselectButton }: any) => (
  <Box sx={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label="Start Date"
        value={startDate}
        onChange={(date) => {
          setStartDate(date);
          unselectButton();
        }}
        sx={{ flex: 0.5, margin: '8px' }}
      />
      <DateTimePicker
        label="End Date"
        value={endDate}
        onChange={(date) => {
          setEndDate(date);
          unselectButton();
        }}
        sx={{ flex: 0.5, margin: '8px' }}
      />
    </LocalizationProvider>
  </Box>
);
