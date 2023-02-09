# 3.0.0

This release migrates the module to the new Module API of Companion v3.
It also contains a few new features:

- migrate to new Companion Module API v3
- update to TypeScript 4.9
- refactoring and improvement
- add support for output delay (set and change)
- add support for multitrack recording

# 2.0.6

- fix: type error ([f5fc91b](https://github.com/bitfocus/companion-module-soundcraft-ui/commit/f5fc91b81e8307e01bf2c59385ce0d5d03af1218))

# 2.0.5

- bulk tidy package.json ([9ca37eb](https://github.com/bitfocus/companion-module-soundcraft-ui/commit/9ca37eb873c537b55d1e5c6b81a43623394eacb3))

# 2.0.4

- add actions and feedback for phantom power ([499d3be](https://github.com/bitfocus/companion-module-soundcraft-ui/commit/499d3be64fa8eab13b31109ef5af463fd1e1eecd))
- change feedback descriptions ([b15bca4](https://github.com/bitfocus/companion-module-soundcraft-ui/commit/b15bca441ebf0e5d05f6640fb02b2cccd069a600))

# 2.0.3

- add support for loading shows, snapshots and cues
- migrate to new boolean feedbacks

# 2.0.2

- chore: convert upgrade scripts ([bca2a60](https://github.com/bitfocus/companion-module-soundcraft-ui/commit/bca2a60d64f59a8017f001584bfd9f188acaf4b1))

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
