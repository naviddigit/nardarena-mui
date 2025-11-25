import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function Loading() {
  return (
    <LoadingScreen 
      portal={false}
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 9999,
        bgcolor: 'background.default',
      }} 
    />
  );
}
