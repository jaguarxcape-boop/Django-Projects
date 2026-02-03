import { Routes, Route } from 'react-router-dom';
import PublicEvents from './Events/PublicEvents.jsx';
import VotingPage from './Pages/VotingPage.jsx';
import ResultsPage from './Pages/ResultsPage.jsx';

export default function VotingLayout({ setnotification }) {
  return (
    <main className="voting-app">
      <Routes>
        <Route index element={<PublicEvents setnotification={setnotification} />} />
        <Route path=":eventId" element={<VotingPage setnotification={setnotification} />} />
        <Route path=":eventId/results" element={<ResultsPage setnotification={setnotification} />} />
      </Routes>
    </main>
  );
}
