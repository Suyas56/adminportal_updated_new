'use client'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format, parseISO } from 'date-fns'

export default function DatePickerField({ 
  label, 
  value, 
  onChange, 
  views = ['year', 'month', 'day'],
  ...props 
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value ? parseISO(value) : null}
        onChange={(newValue) => {
          onChange(newValue ? format(newValue, 'yyyy-MM-dd') : null)
        }}
        views={views}
        slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
        {...props}
      />
    </LocalizationProvider>
  )
} 