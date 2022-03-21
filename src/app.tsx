import React from "react";
import { render } from "react-dom";

import { HashRouter, Routes, Route } from "react-router-dom";

import App from "./pages/App";
import ReviewVideos from "./pages/ReviewVideos";
import ManageVideos from "./pages/ManageVideos";

render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<ReviewVideos />} />
        <Route path="/manage_videos" element={<ManageVideos />} />
      </Route>
    </Routes>
  </HashRouter>,
  document.getElementById("app")
);
