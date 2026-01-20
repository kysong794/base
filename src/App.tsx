import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from './Layout';
import './index.css';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const PostListPage = lazy(() => import('./pages/PostListPage'));
const PostWritePage = lazy(() => import('./pages/PostWritePage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const PostEditPage = lazy(() => import('./pages/PostEditPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const MyPage = lazy(() => import('./pages/MyPage'));

const queryClient = new QueryClient();

// Loading Component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-void">
    <Loader2 className="animate-spin text-gn" size={40} />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<PostListPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/posts/new" element={<PostWritePage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/posts/:id/edit" element={<PostEditPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
