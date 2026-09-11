import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './hooks/use-theme';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}
