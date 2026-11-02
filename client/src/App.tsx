import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { SocketProvider } from './context/SocketContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { Footer } from './components/layout/Footer.js';
import { ToastContainer } from './components/common/ToastContainer.js';
import { AuthModal } from './components/auth/AuthModal.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PostDetailPage } from './pages/PostDetailPage.js';
import { CreatePostPage } from './pages/CreatePostPage.js';
import { ChatRequestsPage } from './pages/ChatRequestsPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { MyPostsPage } from './pages/MyPostsPage.js';
import { SafetyCenterPage } from './pages/SafetyCenterPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isChat = location.pathname.startsWith('/messages');

  return (
    <div className="min-h-screen flex flex-col bg-companion-bg text-companion-charcoal dark:bg-companion-dark-bg dark:text-companion-dark-text transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Render Sidebar on app routes (not landing) */}
        {!isLanding && <Sidebar />}

        <main
          className={`flex-1 min-w-0 ${
            isLanding
              ? 'px-0'
              : isChat
              ? 'p-2 sm:p-4'
              : 'p-4 sm:p-6 lg:p-8'
          } ${!isLanding ? 'pb-20 md:pb-8' : ''}`}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<DashboardPage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/requests" element={<ChatRequestsPage />} />
            <Route path="/messages" element={<ChatPage />} />
            <Route path="/messages/:id" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/safety" element={<SafetyCenterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Render Mobile Navigation bar */}
      <MobileNav />

      {/* Render Footer on full pages (not active chat) */}
      {!isChat && <Footer />}

      {/* Global Modals & Notifications */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
