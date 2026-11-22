import { render } from 'react-dom';
import { HashRouter, Route, Routes } from 'react-router-dom';
import About from './pages/About';
import App from './pages/App';
import ReceivedVODs from './pages/ReceivedVODs';
import ReviewVideos from './pages/ReviewVideos';
import Settings from './pages/Settings';
import SetupVideos from './pages/SetupVideos';

render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<SetupVideos />} />
        <Route path="/about" element={<About />} />
        <Route path="/review" element={<ReviewVideos />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/received_vods" element={<ReceivedVODs />} />
      </Route>
    </Routes>
  </HashRouter>,
  document.getElementById('root'),
);
