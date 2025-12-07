'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  Grow,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search,
  Add,
  Download,
  ViewList,
  ViewModule,
  Edit,
  Delete,
} from '@mui/icons-material';
import { getItems, deleteItem } from '@/lib/api';
import { toast } from 'react-toastify';

interface Item {
  itemID: number;
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number | null;
  thumbnailUrl?: string | null;
  createdByUserName?: string;
  createdOn?: string;
}

type ViewMode = 'table' | 'grid';

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
      toast.error( err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch (err: unknown) {
      toast.error( err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', background: '#fff' }}>
        <Box sx={{ px: 5, py: 4, borderBottom: '1px solid #f1f5f9' }}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700} color="#1e293b">Items</Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your product and service catalog.
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}>
            <TextField
              size="small"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/items/edit/new')}
                sx={{ px: 3 }}
              >
                Add New Item
              </Button>

              <Button variant="outlined" startIcon={<Download fontSize="small" />}>
                Export
              </Button>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="table"><ViewList fontSize="small" /></ToggleButton>
                <ToggleButton value="grid"><ViewModule fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ minHeight: 500 }}>
          {loading ? (
            <Box sx={{ p: 8, textAlign: 'center', color: '#94a3b8' }}>Loading items...</Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ p: 10, textAlign: 'center', color: '#64748b' }}>
              <Typography variant="h6">No items found</Typography>
              <Typography variant="body2" mt={1}>Try adjusting your search or add a new item.</Typography>
            </Box>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Picture</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Item Name</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Description</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Sale Rate</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Discount</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <Grow in key={item.itemID} timeout={index * 100}>
                      <tr
                        style={{ borderTop: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '10px 18px' }}>
                          <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#f1f5f9' }}>
                            <Box component="img" src="/images/placeholder.svg" />
                          </Avatar>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <Typography fontWeight={600} color="#1e293b">{item.itemName}</Typography>
                        </td>
                        <td style={{ padding: '20px 24px', maxWidth: 400 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.description || '—'}
                          </Typography>
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <Typography fontWeight={600} color="#1e293b">
                            ${item.salesRate.toFixed(2)}
                          </Typography>
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <Chip
                            label={`${item.discountPct ?? 0}%`}
                            size="small"
                            color={item.discountPct ? 'success' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => router.push(`/items/edit/${item.itemID}`)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.itemID)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    </Grow>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            /* GRID VIEW */
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
                {filteredItems.map((item, index) => (
                  <Grow in key={item.itemID} timeout={index * 100}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 10px 10px rgba(0,0,0,0.1)' } }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                          <Avatar variant="rounded" sx={{ width: 80, height: 80, flexShrink: 0, bgcolor: '#f1f5f9' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>{item.itemName}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {item.description || 'No description'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" fontWeight={700} color="#1e293b">
                                ${item.salesRate.toFixed(2)}
                              </Typography>
                              {item.discountPct ? (
                                <Chip label={`${item.discountPct}%`} color="success" size="small" />
                              ) : null}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
                        <IconButton size="small" onClick={() => router.push(`/items/edit/${item.itemID}`)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.itemID)}>
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grow>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}