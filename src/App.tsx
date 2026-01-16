import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PostListPage from './pages/PostListPage';
import PostWritePage from './pages/PostWritePage';
import PostDetailPage from './pages/PostDetailPage';
import PostEditPage from './pages/PostEditPage';
import AdminPage from './pages/AdminPage';
import MyPage from './pages/MyPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
