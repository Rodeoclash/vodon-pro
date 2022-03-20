import React from "react";
import { render } from "react-dom";

import { HashRouter, Routes, Route } from "react-router-dom";

import App from "./pages/App";
import Home from "./pages/Home";
import AlignVideos from "./pages/AlignVideos";

render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/align_videos" element={<AlignVideos />} />
      </Route>
    </Routes>
  </HashRouter>,
  document.getElementById("app")
);
