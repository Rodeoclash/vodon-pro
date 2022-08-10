import { render } from 'react-dom';
import { HashRouter, Routes, Route } from 'react-router-dom';

import App from './pages/App';
import ReviewVideos from './pages/ReviewVideos';
import SetupVideos from './pages/SetupVideos';
import About from './pages/About';
import Settings from './pages/Settings';
import ReceivedVODs from './pages/ReceivedVODs';

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
  document.getElementById('root')
);
