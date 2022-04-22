### 1.6.5

- Fixed bugs with video alignment (now just uses the "overlapping" area).
- Fixed bugs with trying to draw on moving video.

### 1.5.7

- Time display fixed to display hh:mm:ss instead of seconds.

### 1.5.6

- Navigation keys (`left arrow, a, right arrow, d`) can now be held down to navigate through frames quickly.

### 1.5.5

- Added `a` and `d` as navigation keys.

### 1.5.4

- Added instant thumbnail previews when mousing over the global timeline.
- Fix some layout bugs related to videos going out of range.

### 1.5.3

- Handle removing active video when only two videos present.

### 1.5.2

- Load and save projects.

### 1.5.1

- Added volume control per video.

### 1.5.0

- Auto save changes. Restore last state when loading app.
- Reworked "Setup Videos" UI by moving instructions to a dialog box. Allows more room to setup videos.
- It's now possible to hold the mouse button down when using the frame advance / rewind functionality.
- Added the name of the currently active video.
- Changed navigation from "Setup videos" to "videos".

### 1.4.1

- Fix selecting a single video, removing it, then selecting another causing the videos not to activate.
- Fix single video play not starting when play triggered.
- Trigger resize after fullscreen to recalculate video layout dimensions.
- Improved layout algo to avoid needing to scroll sidebar.
- Hide visual alignment tool when setting up videos.

### 1.4.0

- Added a "slow CPU" mode which disables smooth playback of the thumbnail videos.

### 1.3.0

- Removed hardcoded 16:9 aspect ratio for videos, now supports actual video aspect ratio.
- Removed hardcoded 60fps for videos, now supports actual video fps.
- Added ability to toggle fullscreen.
- Added ability to toggle drawing controls on or off. Drawing controls are off by default.
- Adding a video will automatically default it to being active on the review video page.
- Removed placeholder when a video is "popped out".
- Removed sidebar video selector when only one video being reviewed.
