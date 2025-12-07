'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  TablePagination,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Print,
  Delete,
  ChevronRight,
  ChevronLeft
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { deleteInvoice, getInvoices, type InvoiceListItem } from '@/lib/api';
import { toast } from 'react-toastify';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [filtered, setFiltered] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'alltime'>('alltime');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await getInvoices();
      const sorted = data.sort((a, b) =>
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
      setInvoices(sorted);
      setFiltered(sorted);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  const filteredByDate = useMemo(() => {
    if (dateRange === 'alltime') return invoices;

    const now = new Date();
    const start = new Date();

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return invoices.filter(inv => new Date(inv.invoiceDate) >= start);
  }, [invoices, dateRange]);

  // Search filter
  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFiltered(filteredByDate);
      return;
    }
    setFiltered(
      filteredByDate.filter((i) => {
        const invoiceNo = String(i.invoiceNo ?? '').toLowerCase();
        const customerName = String(i.customerName ?? '').toLowerCase();
        return invoiceNo.includes(term) || customerName.includes(term);
      })
    );
  }, [search, filteredByDate]);

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalRevenue = filtered.reduce((sum, i) => sum + i.invoiceAmount, 0);

  const formatInvoiceNo = (no: string | number | null | undefined) =>
    `INV-${String(no ?? '0').padStart(4, '0')}`;

  const monthlyData = useMemo(() => {
    const months = Array(12).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return {
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
      };
    });

    filtered.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const monthIndex = 11 - (new Date().getMonth() - date.getMonth() + 12) % 12;
      if (monthIndex >= 0 && monthIndex < 12) {
        months[monthIndex].revenue += inv.invoiceAmount;
      }
    });

    return months.map(m => ({ ...m, revenue: Math.round(m.revenue) }));
  }, [filtered]);

  // Top 5 Items by Revenue (mocked — replace with real item data later)
  const topItemsData = [
    { name: 'Product A', value: 8450 },
    { name: 'Service X', value: 6200 },
    { name: 'Item B', value: 4800 },
    { name: 'Consulting', value: 3200 },
    { name: 'License', value: 2100 },
    { name: 'Others', value: 3150 },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#1e293b">
          Invoices
        </Typography>

        <ToggleButtonGroup
          size="small"
          value={dateRange}
          exclusive
          onChange={(_, v) => v && setDateRange(v)}
          sx={{
            bgcolor: '#f1f5f9',
            borderRadius: 2,
            flexWrap: 'wrap',
            gap: 0.5,
            '& .MuiToggleButton-root': {
              px: { xs: 2, sm: 3 },
              py: 0.5,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          {['Today', 'Week', 'Month', 'Year', 'All Time'].map((label) => (
            <ToggleButton
              key={label}
              value={label.toLowerCase().replace(' ', '')}
              sx={{
                textTransform: 'none',
                border: 'none',
                color: dateRange === label.toLowerCase().replace(' ', '') ? 'white' : '#64748b',
                bgcolor: dateRange === label.toLowerCase().replace(' ', '') ? '#1e293b' : 'transparent',
                '&:hover': { bgcolor: dateRange === label.toLowerCase().replace(' ', '') ? '#1e293b' : '#e2e8f0' },
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              Total Invoices
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#1e293b" mt={1}>
              {filtered.length}
            </Typography>
            <Typography variant="caption" color="#64748b">
              All time · {invoices.length} total
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              Total Revenue
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#10b981" mt={1.5}>
              {formatCurrency(totalRevenue)}
            </Typography>
            <Typography variant="caption" color="#64748b">
              {dateRange === 'alltime' ? 'All time' : `This ${dateRange}`}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, bgcolor: '#f8fafc', overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, height: 180 }}>
            <Typography color="text.secondary" variant="body2" fontWeight={500} mb={2}>
              Revenue Trend
            </Typography>

            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                {/* These two lines are REQUIRED for 12 bars to show */}
                <XAxis dataKey="name" hide />           {/* Hide labels but keep layout */}
                <YAxis hide />

                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    fontSize: '0.8rem',
                    borderRadius: 8,
                    border: 'none',
                    background: '#1e293b',
                    color: 'white',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />

                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="caption" color="#64748b" sx={{ display: 'block', mt: 1 }}>
              Last 12 months
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, bgcolor: '#f8fafc', overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, height: 180, display: 'flex', flexDirection: 'column' }}>
            <Typography color="text.secondary" variant="body2" fontWeight={500} mb={1}>
              Top Items
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topItemsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={50}
                    paddingAngle={3}
                  >
                    {topItemsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="#64748b" sx={{ mt: 'auto' }}>
              Item distribution
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Search Invoice No, Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', sm: 400 },
            '& .MuiInputBase-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/invoices/edit/new')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 3, sm: 4 },
            py: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          New Invoice
        </Button>
      </Box>

      <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer
          sx={{
            maxHeight: 600,
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#94a3b8',
              borderRadius: 4,
              '&:hover': {
                background: '#64748b',
              },
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {[
                  'Invoice No',
                  'Date',
                  'Customer',
                  'Items',
                  'Sub Total',
                  'Tax %',
                  'Tax Amt',
                  'Total',
                  'Actions',
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      color: '#475569',
                      fontSize: '0.875rem',
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="#64748b">
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((inv) => (
                    <TableRow key={inv.invoiceID} hover>
                      <TableCell>
                        <Typography fontWeight={600} color="#1e40af">
                          {formatInvoiceNo(inv.invoiceNo)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell>{inv.customerName}</TableCell>
                      <TableCell>{inv.totalItems}</TableCell>
                      <TableCell>{formatCurrency(inv.subTotal)}</TableCell>
                      <TableCell>{inv.taxPercentage.toFixed(2)}%</TableCell>
                      <TableCell>{formatCurrency(inv.taxAmount)}</TableCell>
                      <TableCell>
                        <Typography fontWeight={700} color="#10b981">
                          {formatCurrency(inv.invoiceAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => router.push(`/invoices/edit/${inv.invoiceID}`)}
                            title="Edit Invoice"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              window.open(`/invoices/print/${inv.invoiceID}`, '_blank')
                            }
                            title="Print Invoice"
                          >
                            <Print fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              try {
                                await deleteInvoice(inv.invoiceID);
                                loadInvoices();
                              } catch (err) {
                                toast.error('Failed to delete invoice');
                              }
                            }}
                            title="Delete Invoice"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          slots={{
            toolbar: (props) => (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  minHeight: '52px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontSize: '0.875rem' }}
                  >
                    Rows per page:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value as string, 10));
                      setPage(0);
                    }}
                    size="small"
                    sx={{ fontSize: '0.875rem', width: 60 }}
                  >
                    {[5, 10, 25].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontSize: '0.875rem' }}
                  >
                    {page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
                  </Typography>
                  <Stack direction="row">
                    <IconButton
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      size="small"
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1}
                      size="small"
                    >
                      <ChevronRight />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
            ),
          }}
        />
      </Paper>
    </Container>
  );
}