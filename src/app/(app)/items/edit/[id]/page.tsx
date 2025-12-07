'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { Close, UploadFile, Image as ImageIcon } from '@mui/icons-material';
import { getItem, createItem, updateItem } from '@/lib/api';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function ItemEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [open, setOpen] = useState(true);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [discount, setDiscount] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);


  useEffect(() => {
    if (!isNew) loadItem();
  }, [id]);

  async function loadItem() {
    setLoading(true);
    try {
      const item = await getItem(Number(id));
      setSelectedItem(item);
      setItemName(item.itemName || '');
      setDescription(item.description || '');
      setRate(item.salesRate?.toString() || '');
      setDiscount(item.discountPct?.toString() || '');
      setImagePreview(item.thumbnailUrl || null);
    } catch (err) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  const handleSubmit = async () => {
    if (!itemName.trim() || !rate) {
      toast.error('Item Name and Sale Rate are required');
      return;
    }

    const payload = {
        itemName: itemName.trim(),
        description: description.trim() || null,
        salesRate: Number(rate),
        discountPct: discount ? Number(discount) : null,
    };  

    try {
      if (isNew){ 
        await createItem(payload);
        } else{ 
            const updatePayload = {
                ...payload,
                itemID: selectedItem?.itemID,
                updatedOn: selectedItem?.updatedOn ?? null,
            };
            await updateItem(updatePayload);
            }
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 3,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {isNew ? 'New Item' : 'Edit Item'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 4, py: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Item Picture
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  border: '2px dashed #d1d5db',
                  bgcolor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon sx={{ fontSize: 32, color: '#9ca3af' }} />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<UploadFile />}
                  sx={{ textTransform: 'none' }}
                >
                  {imageFile ? imageFile.name : 'No file chosen'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  PNG or JPG, max 5MB
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <TextField
            label="Item Name"
            placeholder="Enter item name"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            variant="outlined"
          />

          <TextField
            label="Description"
            placeholder="Enter item description"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText={`${description.length}/500`}
            FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Sale Rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: rate ? null : <InputAdornment position="end">0.00</InputAdornment>,
              }}
            />
            <TextField
              label="Discount %"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid #e5e7eb', justifyContent: 'flex-end' }}>
        <Button onClick={handleClose} size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          disabled={!itemName || !rate || loading}
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}