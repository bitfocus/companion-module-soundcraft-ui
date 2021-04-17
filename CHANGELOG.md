# 2.0.1

- add support for headphone/solo level setting
- fix connection error bug due to wrong config timing

# 2.0.0

This is a complete rework of this module. It now uses the generic connection library [soundcraft-ui-connection](https://www.npmjs.com/package/soundcraft-ui-connection) to communicate with the mixer.

- Migration to TypeScript
- Use connection library [soundcraft-ui-connection](https://www.npmjs.com/package/soundcraft-ui-connection)
- Add actions and feedback
- New features:
  - Fader level and transitions for all channels and master fader
  - Master channel mute and solo
  - AUX channel mute, post and postproc
  - FX channel mute and post
  - Master dim
  - Media player transport, load, play mode and shuffle
  - 2-track USB recorder
  - MUTE groups, ALL and FX
- Add migration script from 1.0.0

# 1.1.0

- add master dim action (ui24r only)
- add media player actions
- add mute/fade for AUX and FX bus
- minor refactoring

# 1.0.0

- initial setup
- mute channels
- set fader level
