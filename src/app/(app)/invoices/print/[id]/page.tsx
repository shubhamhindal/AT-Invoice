"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
} from "@mui/material";
import { Print } from "@mui/icons-material";
import Image from "next/image";
import { getInvoice, Invoice } from "@/lib/api";
import companyLogoUrl from '../../../../../../public/images/invoice.jpeg'

interface InvoiceLine {
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}

// interface InvoiceData {
//   invoiceID: number;
//   invoiceNo: number;
//   invoiceDate: string;
//   customerName: string;
//   address: string;
//   city: string;
//   taxPercentage: number;
//   notes?: string;
//   totalItems: number;
//   lines: InvoiceLine[];
//   subTotal: number;
//   taxAmount: number;
//   invoiceAmount: number;
//   companyName?: string;
//   companyLogoUrl?: string;
//   currencySymbol?: string;
// }

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
    const timer = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(timer);
  }, []);

  const loadInvoice = async () => {
    try {
      const data = await getInvoice(Number(id));
      setInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "₹0.00";
    return `₹${Number(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading invoice...</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 8, textAlign: "center" }}>
        <Typography color="error" variant="h6">Invoice not found</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* SINGLE PAGE A4 PRINT STYLES - NO SCROLL */}
      <style jsx global>{`
        @media screen {
          .print-container {
            max-width: 210mm;
            min-height: 247mm;
            margin: auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
        }
        @media print {
          html, body {
            height: auto;
            width: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .no-print { display: none !important; }
          .print-container {
            width: 210mm;
            height: 267mm;
            padding: 25mm;
            margin: 0;
            box-sizing: border-box;
            page-break-after: avoid;
            font-size: 10pt;
            line-height: 1.4;
          }
          table { font-size: 9pt; }
          h1 { font-size: 20pt; }
          h2 { font-size: 16pt; }
          h3 { font-size: 12pt; }
          h4 { font-size: 10pt; }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>

      <Box className="print-container">
        <Box className="no-print" sx={{ mb: 2, textAlign: "right" }}>
          <Button startIcon={<Print />} onClick={() => window.print()} size="medium" sx={{ mr: 2 }}>
            Print Invoice
          </Button>
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, p: { xs: 3, print: 0 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                  <Image
                    src={companyLogoUrl}
                    alt="Company Logo"
                    width={120}
                    height={120}
                    style={{ objectFit: "contain" }}
                  />
                <Box sx={{ mt: 2, color: "#666", fontSize: "11pt" }}>
                  <Typography>Indore</Typography>
                  <Typography>Madhya Pradesh, India</Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                  INVOICE
                </Typography>
                <Typography variant="h5" color="#64748b" sx={{ mt: 1 }}>
                  #{invoice.invoiceNo.toString().padStart(4, "0")}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography color="#64748b" fontSize="11pt">Issue Date:</Typography>
                  <Typography fontWeight={600} fontSize="13pt">
                    {formatDate(invoice.invoiceDate)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography color="#64748b" fontSize="11pt">Due Date:</Typography>
                  <Typography fontWeight={600} fontSize="13pt">
                    {formatDate(invoice.invoiceDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={600} color="#1e293b">
                Bill To
              </Typography>
              <Box sx={{ fontSize: "12pt" }}>
                <Typography fontWeight={600}>{invoice.customerName}</Typography>
                <Typography color="#64748b">{invoice.address}</Typography>
                <Typography color="#64748b">{invoice.city}</Typography>
              </Box>
            </Box>

            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Rate</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Discount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.lines.map((line, i) => {
                    const discountPct = line.discountPct ?? 0;
                    const lineTotal = line.quantity * line.rate * (1 - discountPct / 100);
                    return (
                      <TableRow key={i}>
                        <TableCell sx={{ py: 1.5 }}>{i + 1}</TableCell>
                        <TableCell sx={{ py: 1.5, color: "#64748b" }}>
                          {line.description}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          {line.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          {formatCurrency(line.rate)}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          {discountPct > 0 ? `${line.discountPct}%` : "-"}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, fontWeight: 600 }}>
                          {formatCurrency(lineTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ maxWidth: 380, ml: "auto", mt: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontSize="12pt">Subtotal</Typography>
                <Typography fontWeight={600} fontSize="12pt">
                  {formatCurrency(invoice.subTotal)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography fontSize="12pt">Tax ({invoice.taxPercentage}%)</Typography>
                <Typography fontWeight={600} fontSize="12pt">
                  {formatCurrency(invoice.taxAmount)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, bgcolor: "#ecfdf5", px: 3, borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  Total Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#059669">
                  {formatCurrency(invoice.invoiceAmount)}
                </Typography>
              </Box>
            </Box>

            {invoice.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={1.5}>
                  Notes
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "11pt" }}>
                  {invoice.notes}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: "auto", pt: 2, textAlign: "center", color: "#64748b" }}>
              <Typography variant="h5" fontWeight={600}>
                Thank you for your business!
              </Typography>
              <Typography sx={{ mt: 1, fontSize: "11pt" }}>
                Payment is due within 30 days.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, textAlign: "center", color: "#94a3b8", fontSize: "10pt" }}>
          <Typography>
            InvoiceApp India Private Limited.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            © 2025 InvoiceApp. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
}