# AGENTS.md

This file provides guidance to AI agents such as Claude Code when working with code in this repository.

## Releases

The `CHANGELOG.md` file contains all changes for each release as a list of all commits.
Version numbers follow Semantic Versioning.
To release a new version, the following steps are necessary:

- increment version number in `package.json` and `companion/manifest.json`
- create new section in the changelog, following the existing structure
- commit with the following commit message pattern: `chore: release X.Y.Z`

## Project Overview

This is a Bitfocus Companion module for controlling Soundcraft Ui12, Ui16, and Ui24R mixing consoles over WebSocket. It extends `@companion-module/base` and uses the `soundcraft-ui-connection` library for device communication.

## Common Commands

```bash
yarn                 # Install dependencies
yarn dev             # Build in watch mode (development)
yarn build           # Clean build (compiles to dist/)
yarn lint            # Run ESLint
yarn dist            # Build distribution package for Companion
```

## Architecture

### Main Components

- **`src/index.ts`** - `SoundcraftUiInstance` extends `InstanceBase<UiConfig>`, manages connection lifecycle and integrates all components
- **`src/actions.ts`** - 100+ action definitions (mute, solo, fader levels, media player, etc.) via `GetActionsList()`
- **`src/feedback.ts`** - Boolean feedback definitions via `GetFeedbacksList()`, shows current mixer state on buttons
- **`src/variables.ts`** - Dynamic variable definitions (fader levels, channel names, PAN values) via `createVariables()`
- **`src/presets.ts`** - Pre-configured button layouts via `createPresets()`

### State Management (RxJS-based)

- **`src/feedback-store.ts`** - `UiFeedbackStore` manages feedback subscriptions, maps internal streams to Companion feedback state
- **`src/variables-store.ts`** - `UiVariablesStore` batches variable updates (100ms) before sending to Companion API

Both stores follow the same pattern: subscribe to `soundcraft-ui-connection` Observables, transform state, and update Companion.

### Channel System

- **`src/utils/channel-selection.ts`** - Type-safe channel getters for different buses (Master, AUX, FX)
- Channel type prefixes: `i` (Input), `l` (Line), `p` (Player), `f` (FX), `s` (Sub), `a` (AUX), `v` (VCA)
- Not all channel types are available on all buses or device models

### Utilities

- **`src/utils/input-utils.ts`** - Dropdown choices and option sets for action/feedback inputs
- **`src/utils/utils.ts`** - Value conversion utilities (linear ↔ dB, PAN ranges, percentages)
- **`src/utils/patch-parameters.ts`** - Patching route data (Ui24R only)

## Key Dependencies

- `soundcraft-ui-connection` - WebSocket connection and RxJS Observables for all mixer state
- `@companion-module/base` - Companion module framework
- `rxjs` - Reactive state management

## Device Capabilities

The three supported devices have different capabilities:

- **Ui12**: Basic channel set
- **Ui16**: Extended channel set
- **Ui24R**: Full features including multitrack recording, PRE/POST PROC, patching

Many features check device capabilities at runtime. The connection library exposes device info after connecting.
