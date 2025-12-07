'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Divider,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Close,
  CalendarToday,
  ContentCopy,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getItems, getInvoice, createUpdateInvoice, getNextInvoiceNo } from '@/lib/api';
import { toast } from 'react-toastify';

interface LineItem {
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number | null;
  amount?: number;
}

export default function InvoiceEditorPage() {
  const router = useRouter();
  const { id } = useParams();
  const invoiceId = id === 'new' ? null : Number(id);
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [invoiceNo, setInvoiceNo] = useState<string>('Auto-generated');
  const [invoiceDate, setInvoiceDate] = useState(dayjs());
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [taxPercent, setTaxPercent] = useState(10);
  const [lines, setLines] = useState<LineItem[]>([
    { itemID: 0, description: '', quantity: 1, rate: 0, discountPct: 0 },
  ]);


  useEffect(() => {
    loadItems();
    if (isNew) {
      generateInvoiceNo();
    } else if (invoiceId) {
      loadInvoice();
    }
  }, [isNew, invoiceId]);

  async function loadItems() {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items', err);
    }
  }

  async function loadInvoice() {
    if (!invoiceId) return;
    try {
      const inv = await getInvoice(invoiceId);

      setInvoiceNo(inv.invoiceNo ? `INV-${String(inv.invoiceNo).padStart(4, '0')}` : 'Auto-generated');
      setInvoiceDate(dayjs(inv.invoiceDate));
      setCustomerName(inv.customerName || '');
      setAddress(inv.address || '');
      setCity(inv.city || '');
      setNotes(inv.notes || '');
      setTaxPercent(inv.taxPercentage || 10);

      if (inv.lines && inv.lines.length > 0) {
        setLines(
          inv.lines.map((line: any) => ({
            itemID: line.itemID,
            description: line.description,
            quantity: line.quantity,
            rate: line.rate,
            discountPct: line.discountPct || 0,
          }))
        );
      }
    } catch (err) {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }

  const handleItemChange = (index: number, itemID: number) => {
    const selected = items.find(i => i.itemID === itemID);
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      itemID,
      description: selected?.itemName || '',
      rate: selected?.salesRate || 0,
    };
    recalculateLine(newLines[index]);
    setLines(newLines);
  };

  const generateInvoiceNo = async () => {
    try {
      const nextNo = await getNextInvoiceNo();
      setInvoiceNo(`INV-${String(nextNo).padStart(4, '0')}`);
    } catch (err) {
      console.error('Failed to generate invoice number', err);
      setInvoiceNo('INV-0001');
    }
  };

  const recalculateLine = (line: LineItem) => {
    const amount = line.quantity * line.rate * (1 - (line.discountPct || 0) / 100);
    line.amount = Number(amount.toFixed(2));
  };

  const handleLineChange = (index: number, field: keyof LineItem, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    if (field === 'quantity' || field === 'rate' || field === 'discountPct') {
      recalculateLine(newLines[index]);
    }
    setLines(newLines);
  };

  const addRow = () => {
    setLines([...lines, { itemID: 0, description: '', quantity: 1, rate: 0, discountPct: 0 }]);
  };

  const deleteRow = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.rate * (1 - (line.discountPct || 0) / 100)), 0);
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        invoiceDate: invoiceDate.format('YYYY-MM-DD'),
        customerName,
        address: address || null,
        city: city || null,
        taxPercentage: taxPercent,
        notes: notes || null,
        lines: lines
        .filter(l => l.itemID)
          .map((l, i) => ({
            rowNo: i + 1,
            itemID: l.itemID,
            description: l.description,
            quantity: l.quantity,
            rate: l.rate,
            discountPct: l.discountPct || null,
          })),
        };
        payload.invoiceNo = invoiceNo.replace('INV-', '');

      if (!isNew && invoiceId) {
        payload.invoiceID = invoiceId;
      }

      await createUpdateInvoice(payload);
      toast.success('Invoice saved successfully!');
      router.push('/dashboard');
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isNew) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading invoice...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600}>
                {isNew ? 'New Invoice' : 'Edit Invoice'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<Close />} onClick={() => router.push('/dashboard')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Cancel
                </Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Box>
            
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
              Invoice Details
              </Typography>
              <Grid container spacing={3}>
              <Grid size={{ xs: 12, md:6}}>
              <TextField
                  fullWidth
                  label="Invoice No"
                  value={invoiceNo}
                  disabled
                  helperText={isNew ? "Auto-generated" : "From existing invoice"}
                  sx={{ bgcolor: '#f1f5f9' }}
                />
              </Grid>
              <Grid size={{ xs: 12, md:6}}>
                  <DatePicker
                  label="Invoice Date *"
                  value={invoiceDate}
                  onChange={(newValue) => newValue && setInvoiceDate(newValue)}
                  slots={{ openPickerIcon: CalendarToday }}
                  slotProps={{ textField: { fullWidth: true } }}
                  />
              </Grid>

              <Grid size={{ xs: 12, md:6}}>
                  <TextField
                  fullWidth
                  label="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  />
              </Grid>
              <Grid size={{ xs: 12, md:6}}>
                  <TextField
                  fullWidth
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  />
              </Grid>

              <Grid size={{ xs: 12, md:6}}>
                  <TextField
                  fullWidth
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  multiline
                  rows={2}
                  />
              </Grid>
              <Grid size={{ xs: 12, md:6}}>
                  <TextField
                  fullWidth
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  multiline
                  rows={2}
                  />
              </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Line Items</Typography>
              <Stack direction="row" spacing={1}>
                  <Button startIcon={<Add />} onClick={addRow} size="small">Add Row</Button>
                  <Button startIcon={<ContentCopy />} size="small" disabled>Copy</Button>
                  <Button startIcon={<Delete />} size="small" disabled>Delete</Button>
              </Stack>
              </Box>

              <TableContainer>
              <Table>
                  <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell width={80}>S.No</TableCell>
                      <TableCell>Item *</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell width={100}>Qty *</TableCell>
                      <TableCell width={120}>Rate *</TableCell>
                      <TableCell width={100}>Disc %</TableCell>
                      <TableCell width={120} align="right">Amount</TableCell>
                      <TableCell width={80}></TableCell>
                  </TableRow>
                  </TableHead>
                  <TableBody>
                  {lines.map((line, index) => (
                      <TableRow key={index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                          <FormControl fullWidth size="small">
                          <Select
                              value={line.itemID}
                              onChange={(e) => handleItemChange(index, e.target.value as number )}
                              displayEmpty
                          >
                              <MenuItem value="" disabled>Select Item...</MenuItem>
                              {items.map((item) => (
                              <MenuItem key={item.itemID} value={item.itemID}>
                                  {item.itemName}
                              </MenuItem>
                              ))}
                          </Select>
                          </FormControl>
                      </TableCell>
                      <TableCell>
                          <TextField
                          size="small"
                          fullWidth
                          value={line.description}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                          />
                      </TableCell>
                      <TableCell>
                          <TextField
                          size="small"
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))}
                          sx={{ width: 80 }}
                          />
                      </TableCell>
                      <TableCell>
                          <TextField
                          size="small"
                          type="number"
                          value={line.rate}
                          onChange={(e) => handleLineChange(index, 'rate', Number(e.target.value))}
                          sx={{ width: 100 }}
                          />
                      </TableCell>
                      <TableCell>
                          <TextField
                          size="small"
                          type="number"
                          value={line.discountPct}
                          onChange={(e) => handleLineChange(index, 'discountPct', Number(e.target.value))}
                          sx={{ width: 80 }}
                          />
                      </TableCell>
                      <TableCell>
                          <IconButton size="small" onClick={() => deleteRow(index)}>
                          <Delete fontSize="small" />
                          </IconButton>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
                  Subtotal:
              </Typography>
              <Typography variant="h6" sx={{ ml: 4, minWidth: 120, textAlign: 'right' }}>
                  ${subtotal.toFixed(2)}
              </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} gutterBottom>
              Invoice Totals
              </Typography>
              <Box sx={{ maxWidth: 400, ml: 'auto' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography>Sub Total</Typography>
                  <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography>Tax</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                      size="small"
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      sx={{ width: 80 }}
                  />
                  <Typography>% → ${taxAmount.toFixed(2)}</Typography>
                  </Box>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, py: 2, bgcolor: '#f1f5f9', borderRadius: 2, px: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                  Invoice Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#1e293b">
                  ${total.toFixed(2)}
                  </Typography>
              </Stack>
              </Box>
          </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}