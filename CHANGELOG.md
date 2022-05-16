### 1.7.11

- Fix bug with sidebar size after exiting presentation mode.

### 1.7.10

- Improved frame step controls so they don't overwhelm the video with requests and cause it to stall out.
- Added unified help button. Help button will display help based on which page you are on (only setup and review for now)
- Changed shortcuts so that "a" and "d" move frame by frame, "w" and "s" jump frames (based on jump distance in settings)\
- Removed ability to change arrow keys from frame navigation to jump frame (just added more shortcuts)
- Added ability to resize the sidebar where thumbnails are located.
- Added keyboard shortcuts to jump between viewpoints using the number keys.
- Review page help button now displays all available keyboard shortcuts.

### 1.7.9

- Introduces new floating controls
- Hold H to hide controls
- Slow audio down rather than trying to pitch shift it.
- Added 1.5x and 2x speed controls for video.
- Removed preview thumbnail images from seek bar as they were too slow to generate.

### 1.7.8::- Pre-release for user testing

### 1.7.7

- Removed focus on fullscreen button after click. Prevents spacebar toggling fullscreen on and off when trying to pause video.

### 1.7.6

- Fix for the fullscreen video controls losing sync.
- Pause video when navigating using arrow keys, shortcurts.

### 1.7.5

- Added shift modifier key option to a, d, left arrow, right arrow. Will perform the "other" behaviour depending on how you have the navigation set. If set to frame by frame navigation, holding shift and using they keys will jump seconds, if set to jump seconds, holding shift will navigate frame by frame.
- Default arrow keys to navigate by jumping, not frames.

### 1.7.4

- Bookmarks now have navigation controls to jump between them.

### 1.7.3

- Improved the way you input the jump length number.
- Improved behaviour around the way the screen is cleared of drawings (when set)
- Full screen now full screens the full video element (drawings are lost)
- Don't deselect current tool when playing.
- Restored duration display when syncing videos (makes it easier to see which video is which when length is known)

### 1.7.2

- Allow decimal values when specifying jump.

### 1.7.1

- Drawings persist even when the video is playing. Cleared when moving in and out of bookmarks.
- Added function to use the arrow keys to move backwards and forwards by jumps in time instead of by frame. Selectable from the settings menu.
- Added function to select how far the jump should be (in seconds)

### 1.7.0

- Added a control for playback speed.

### 1.6.11

- Added "dash styles". You can now have dotted, dashed or solid lines for drawing.

### 1.6.10

- Can play the alignement videos to help alignment.
- Slight tweak to the way the time is displayed for the alignment videos (now shows: "Syncs @ 1:00")
- Improved test coverage and typing.

### 1.6.9

- No release

### 1.6.8

- Upgraded build system to use `electron-build` instead of `electron-forge`.

### 1.6.7

- Added loading screen
- Reworked bookmarks to show all at once

### 1.6.6

- Added "New Project" in file dropdown which resets state.
- Prompt user on loading if they want to restore the last project
- Fixed ordering of videos to preserve the order they're added in (was being reordered by duration)

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
