# Notice

Unfortunately the build framework that powers Vodon Pro, electron-react-boilerplate, is now no longer compatable with the latest versions of Electron. I don't have time to go through the project and make the changes required to the build process to upgrade it to use the new Electron. Additionally, it looks like the old version of Chrome that is powering Vodon Pro is having issues with some of the current video formats. I'm not going to take the repo down but I cannot work on it at the moment.

<div align="center">

# Vodon Pro

![GitHub all releases](https://img.shields.io/github/downloads/Rodeoclash/vodon-pro/total?style=flat-square)
![Discord](https://img.shields.io/discord/908876087747022919)

**Vodon Pro is a video player designed for esports coaches to review gameplay**. The main unique feature that it has is the ability for you to load multiple viewpoints of your team into the player, synchronise them, then watch the videos with the ability to instantly jump to any of the viewpoints of your players.

**[View homepage to download]([https://vodon.gg/](https://vodon-pro-website.vercel.app/)**

</div>

## Vodon Online

I now have a beta version of Vodon Pro which can be used online. If you're interested in trying it out, please go to: https://player.vodon.gg/

## Features

- 🎥 Watch multiple videos at once, perfectly synchronised together.
- 🖥️ Supports an _unlimited_ number of videos (restricted by your systems performance)
- 🖊 Draw on individual frames in each video (Powered by [TLDraw](https://github.com/tldraw/tldraw))
- ▶ Frame by frame advance and rewind controls.
- 🔖 Bookmark system to remind you of critical moments you need to talk about with the team.
- 💤 Slow motion mode, reduce speed to 10%, 25%, 50%, 75% of the original video.
- ⏩ Fast motion mode, increase speed to 1.5x, 2x of the original video.
- 💾 Load and save your projects (includes autosave as you work)
- 👀 No advertising or tracking.
- ⚙️ Sensible defaults but can be customised to match your workflow.
- 😎 Presentation mode which maximises the video sent over screenshare.
- 🔎 Pan and zoom your videos so you don't miss any details

## What games can I use it with?

Vodon Pro works on video so it can be used with any game that you record. It works best with team games where each player has a different viewpoint but is in the same match. Some of the games coaches use with Vodon Pro are:

- Valorant
- Apex Legends
- Halo Infinite

## Tested with

- MP4, MKV and WebM video formats.
- 60fps / 30fps videos.
- 16:9 and 4:3 aspect ratios.
- Windows, Linux and OSX

## Comparisons

If anything is incorrect or disputed about this list, please contact us or raise a PR.

| Feature                                     | Vodon Pro | Insights.gg | SquadOV |
| :------------------------------------------ | :-------- | :---------- | :------ |
| Free option available                       | ✔️        | ✔️          | ✔️      |
| Annotate with drawings                      | ✔️        | ✔️          | ✔️      |
| Bookmark moments, leave notes               | ✔️        | ✔️          | ✔️      |
| Multiple videos played in sync              | ✔️        | ❌          | ✔️      |
| Instant video switch                        | ✔️        | ❌          | ❌      |
| Can be used without an account              | ✔️        | ❌          | ❌      |
| Open source                                 | ✔️        | ❌          | ❌      |
| Instant seek to any point in videos         | ✔️        | ❌          | ❌      |
| Supports massive files with no quality loss | ✔️        | ❌          | ❌      |
| Online access                               | ❌        | ✔️          | ✔️      |

## Screenshots

### Synchronising videos

![Setup videos](https://raw.githubusercontent.com/Rodeoclash/vodon-pro/main/screenshots/setup.png)

_Everything starts in Vodon by telling it how to synchronise your videos. Align each video to the same point in time in the match._

### Reviewing videos

![Reviewing videos](https://raw.githubusercontent.com/Rodeoclash/vodon-pro/main/screenshots/review.png)

_With the videos aligned, the global time control can be used to navigate all videos. Click the videos in the sidebar to instantly jump to that players point of view._

### Drawing on frames

![Drawing on frames](https://raw.githubusercontent.com/Rodeoclash/vodon-pro/main/screenshots/drawing.png)

_Vodon Pro even has drawing tools. Use these to annotate the frame that you're talking about it in the review._

### Bookmarks

![Bookmarks](https://raw.githubusercontent.com/Rodeoclash/vodon-pro/main/screenshots/bookmarks.png)

_Bookmark important moments before your review to bring up with the team_

### Settings

![Settings](https://raw.githubusercontent.com/Rodeoclash/vodon-pro/main/screenshots/settings.png)

_Configuring the app_

## Frequently asked questions

### Why do I get warned about the download?

When you download, you may see one or more warnings about the download being "unsafe". This is due to code signing and while I can pay (about $100AUD) to sign my downloads, I haven't got this in place just yet.

### Why use this over the inbuilt replay tools?

If you're performing VOD reviews on games with inbuilt replay tools then Vodon Pro will be a poor substitute for those tools... use them instead! That said, not all games support replay files or allow you to easily find and share them.

### Why is this an app? I want to use it online!

This comes down to a few reasons, they are:

1. Video hosting costs a lot of money.
2. When you store videos that users have uploaded, you compress them to save on space. This means that the videos lose visual quality.
3. Streaming 5 1080p 60fps videos at once will crush almost anyones Internet connection (even if you compress the videos like in 2!)
4. Seeks to new locations should be _instant_. I hate clicking to go somewhere in a video and seeing a buffering icon.

### How can I get in touch?

You can or join me and the other users on

- [Email me](mailto:sam@vodon.gg)
- [Join our Discord](https://discord.gg/EaJdhHtZEk)
- [Follow our Twitter](https://twitter.com/GgVodon)

## Development

1. Clone the repo
2. `npm install`
3. `npm start` to being development
