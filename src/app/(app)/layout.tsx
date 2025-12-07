import Navbar from '@/components/Navbar';
import { Box } from '@mui/material';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ px: { xs: 2, sm: 3, md: 2 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </>
  );
}