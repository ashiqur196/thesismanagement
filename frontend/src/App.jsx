import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import { Toaster } from 'sonner';
import Router from './Router';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="mx-auto">
          <Toaster position='top-right' />
          <Router />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;