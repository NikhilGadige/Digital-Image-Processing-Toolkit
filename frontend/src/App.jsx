import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import Layout from './components/Layout';
import LearnHomePage from './pages/LearnHomePage';
import ModulePage from './pages/ModulePage';
import Chapter2Page from './pages/modules/Chapter2Page';
import Chapter3Page from './pages/modules/Chapter3Page';
import Chapter4Page from './pages/modules/Chapter4Page';
import Chapter5Page from './pages/modules/Chapter5Page';
import Chapter6Page from './pages/modules/Chapter6Page';
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/learn" element={<Layout />}>
              <Route index element={<LearnHomePage />} />
              <Route path="module/digital-image-fundamentals" element={<Chapter2Page />} />
              <Route path="module/intensity-and-spatial-filtering" element={<Chapter3Page />} />
              <Route path="module/frequency-domain-filtering" element={<Chapter4Page />} />
              <Route path="module/image-restoration" element={<Chapter5Page />} />
              <Route path="module/color-image-processing" element={<Chapter6Page />} />
              <Route path="module/:moduleId" element={<ModulePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
