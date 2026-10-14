import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoBanner } from './components/layout/DemoBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { RouteSearchPage } from './pages/RouteSearchPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { JourneyPlannerPage } from './pages/JourneyPlannerPage';
import { FavouritesPage } from './pages/FavouritesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TicketPage } from './pages/TicketPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-red-500 selection:text-white">
        {/* Persistent Demo Notice Banner */}
        <DemoBanner />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Main Content View Container */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<PassengerDashboard />} />
            <Route path="/routes" element={<RouteSearchPage />} />
            <Route path="/routes/:routeId" element={<RouteDetailPage />} />
            <Route path="/tracking" element={<LiveTrackingPage />} />
            <Route path="/planner" element={<JourneyPlannerPage />} />
            <Route path="/favourites" element={<FavouritesPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/ticket" element={<TicketPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
