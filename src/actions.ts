import { type CompanionActionDefinitions, Regex } from '@companion-module/base'
import type { AutomixGroupId, DelayableMasterChannel, SoundcraftUI } from 'soundcraft-ui-connection'

import { CHOICES, OPTIONS, OPTION_SETS } from './utils/input-utils.js'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannel,
	getMasterChannelFromOptions,
	getMuteGroupIDFromOptions,
	getVolumeBusFromOptions,
} from './utils/channel-selection.js'

export enum ActionId {
	// Master
	SetMasterValue = 'setmastervalue',
	ChangeMasterValue = 'changemastervalue',
	FadeMaster = 'fademaster',
	DimMaster = 'dimmaster',
	SetMasterDelay = 'setmasterdelay',
	ChangeMasterDelay = 'changemasterdelay',

	// Master Channels
	MuteMasterChannel = 'mutemasterchannel',
	SoloMasterChannel = 'solomasterchannel',
	SetMasterChannelValue = 'setmasterchannelvalue',
	ChangeMasterChannelValue = 'changemasterchannelvalue',
	FadeMasterChannel = 'fademasterchannel',
	SetMasterChannelDelay = 'setmasterchanneldelay',
	ChangeMasterChannelDelay = 'changemasterchanneldelay',
	MasterChannelSelectMTK = 'masterchannelselectmtk',

	// AUX Channels
	MuteAuxChannel = 'muteauxchannel',
	SetAuxChannelValue = 'setauxchannelvalue',
	ChangeAuxChannelValue = 'changeauxchannelvalue',
	FadeAuxChannel = 'fadeauxchannel',
	SetAuxChannelPost = 'setauxchannelpost',
	SetAuxChannelPostProc = 'setauxchannelpostproc',

	// FX Channels
	MuteFxChannel = 'mutefxchannel',
	SetFxChannelPost = 'setfxchannelpost',
	SetFxChannelValue = 'setfxchannelvalue',
	ChangeFxChannelValue = 'changefxchannelvalue',
	FadeFxChannel = 'fadefxchannel',

	// Volume Buses (SOLO, Headphone)
	SetVolumeBusValue = 'setvolumebusvalue',
	ChangeVolumeBusValue = 'changevolumebusvalue',

	// Media Player
	MediaPlay = 'mediaplay',
	MediaStop = 'mediastop',
	MediaPause = 'mediapause',
	MediaNext = 'medianext',
	MediaPrev = 'mediaprev',
	MediaSwitchPlist = 'mediaswitchplist',
	MediaSwitchTrack = 'mediaswitchtrack',
	MediaSetPlayMode = 'mediasetplaymode',
	MediaSetShuffle = 'mediasetshuffle',

	// 2-Track Recorder
	DTRecordToggle = 'dualtrackrecordtoggle',
	DTRecordStart = 'dualtrackrecordstart',
	DTRecordStop = 'dualtrackrecordstop',

	// Multitrack Recorder
	MTKPlay = 'mtkplay',
	MTKPause = 'mtkstop',
	MTKStop = 'mtkpause',
	MTKRecordToggle = 'mtkrecordtoggle',
	MTKRecordStart = 'mtkrecordstart',
	MTKRecordStop = 'mtkrecordstop',
	MTKSoundcheck = 'mtksoundcheck',

	// MUTE Groups / ALL / FX
	MuteGroupMute = 'mutegroupmute',
	MuteGroupClear = 'mutegroupclear',

	// Shows / Snapshots / Cues
	LoadShow = 'loadshow',
	LoadSnapshot = 'loadsnapshot',
	LoadCue = 'loadcue',

	// Hardware Channels / Phantom Power
	HwSetPhantomPower = 'hwsetphantompower',

	// Automix
	AutomixAssignGroupToChannel = 'automixassigngrouptochannel',
	AutomixEnableGroup = 'automixenablegroup',
}

export function GetActionsList(conn: SoundcraftUI): CompanionActionDefinitions {
	return {
		/**
		 * MASTER
		 */
		[ActionId.SetMasterValue]: {
			name: 'Master: Set fader value',
			description: 'Set the fader value (dB) for the master fader',
			options: [OPTIONS.faderValuesSlider],
			callback: (action) => {
				const value = Number(action.options.value)
				return conn.master.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeMaster]: {
			name: 'Master: Fade transition',
			description: 'Perform a timed fade transition on the master fader',
			options: [...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				return conn.master.fadeToDB(
					Number(action.options.value),
					Number(action.options.fadeTime),
					Number(action.options.easing)
				)
			},
		},

		[ActionId.ChangeMasterValue]: {
			name: 'Master: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for the master fader',
			options: [OPTIONS.faderChangeField],
			callback: (action) => {
				const value = Number(action.options.value)
				return conn.master.changeFaderLevelDB(value)
			},
		},

		[ActionId.DimMaster]: {
			name: 'Master: Dim',
			description: 'Dim the master fader (Ui24R only)',
			options: [
				{
					type: 'dropdown',
					label: 'Dim',
					id: 'dim',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				switch (Number(action.options.dim)) {
					case 0:
						return conn.master.undim()
					case 1:
						return conn.master.dim()
					case 2:
						return conn.master.toggleDim()
				}
			},
		},

		[ActionId.SetMasterDelay]: {
			name: 'Master: Set output delay',
			description: 'Set delay for the master output (left, right or both)',
			options: [OPTIONS.delayTimeField(0, 500), OPTIONS.masterDelayDropdown],
			callback: (action) => {
				const time = Number(action.options.time)
				switch (action.options.side) {
					case 'left':
						return conn.master.setDelayL(time)
					case 'right':
						return conn.master.setDelayR(time)
					default: {
						conn.master.setDelayL(time)
						conn.master.setDelayR(time)
						return
					}
				}
			},
		},

		[ActionId.ChangeMasterDelay]: {
			name: 'Master: Change output delay (relative)',
			description: 'Relatively change delay for the master output (left, right or both)',
			options: [OPTIONS.delayTimeField(-500, 500), OPTIONS.masterDelayDropdown],
			callback: (action) => {
				const time = Number(action.options.time)
				switch (action.options.side) {
					case 'left':
						return conn.master.changeDelayL(time)
					case 'right':
						return conn.master.changeDelayR(time)
					default: {
						conn.master.changeDelayL(time)
						conn.master.changeDelayR(time)
						return
					}
				}
			},
		},

		/**
		 * Master Channels
		 */
		[ActionId.MuteMasterChannel]: {
			name: 'Master channels: Mute',
			description: 'Set or toggle MUTE for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				switch (Number(action.options.mute)) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		[ActionId.SetMasterChannelValue]: {
			name: 'Master channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeMasterChannel]: {
			name: 'Master channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeMasterChannelValue]: {
			name: 'Master channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.ChangeMasterValue]: {
			name: 'Master: Change fader value (relative expression)',
			description: 'Relatively change the fader value (dB) for the master fader using a custom expression',
			options: [
				{
					type: 'textinput',
					label: 'Custom Expression',
					id: 'expression',
					default: '1', // Default to a simple relative change
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				let value: number;
				try {
					// Evaluate the expression; be careful with eval as it can execute arbitrary code.
					value = eval(action.options.expression);
				} catch (error) {
					// Handle any errors in expression evaluation
					console.error('Error evaluating expression:', error);
					value = 0; // Fallback to no change if there's an error
				}
				return conn.master.changeFaderLevelDB(value);
			},
		},


		[ActionId.SoloMasterChannel]: {
			name: 'Master channels: Solo',
			description: 'Set or toggle SOLO for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.soloDropdown],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				switch (Number(action.options.solo)) {
					case 0:
						return c.unsolo()
					case 1:
						return c.solo()
					case 2:
						return c.toggleSolo()
				}
			},
		},

		[ActionId.SetMasterChannelDelay]: {
			name: 'Master channels: Set output delay',
			description:
				'Set output delay for a channel on the master bus. Input and Line channels allow for max. 250 ms, AUX master faders can be delayed by max. 500ms.',
			options: [...OPTION_SETS.delayableMasterChannel(0, 500)],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn) as DelayableMasterChannel
				const time = Number(action.options.time)
				c.setDelay(time)
			},
		},

		[ActionId.ChangeMasterChannelDelay]: {
			name: 'Master channels: Change output delay (relative)',
			description:
				'Relatively change output delay for a channel on the master bus. Input and Line channels allow for max. 250 ms, AUX master faders can be delayed by max. 500ms.',
			options: [...OPTION_SETS.delayableMasterChannel(-500, 500)],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn) as DelayableMasterChannel
				const time = Number(action.options.time)
				c.changeDelay(time)
			},
		},

		[ActionId.MasterChannelSelectMTK]: {
			name: 'Master channels: Select for multitrack recording',
			description: 'Include or remove an input or line channel for multitrack recording',
			options: [
				...OPTION_SETS.multiTrackMasterChannel,
				{
					type: 'dropdown',
					label: 'Select Channel',
					id: 'select',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				switch (Number(action.options.select)) {
					case 0:
						return c.multiTrackUnselect()
					case 1:
						return c.multiTrackSelect()
					case 2:
						return c.multiTrackToggle()
				}
			},
		},

		/**
		 * AUX Channels
		 */
		[ActionId.MuteAuxChannel]: {
			name: 'AUX channels: Mute',
			description: 'Set or toggle MUTE for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				switch (Number(action.options.mute)) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		[ActionId.SetAuxChannelValue]: {
			name: 'AUX channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeAuxChannel]: {
			name: 'AUX channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeAuxChannelValue]: {
			name: 'AUX channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.SetAuxChannelPost]: {
			name: 'AUX channels: Set PRE/POST',
			description: 'Set or toggle PRE/POST for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.prepostDropdown],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				switch (Number(action.options.post)) {
					case 0:
						return c.pre()
					case 1:
						return c.post()
					case 2:
						return c.togglePost()
				}
			},
		},

		[ActionId.SetAuxChannelPostProc]: {
			name: 'AUX channels: Set POST PROC',
			description: 'Set POST PROC/PRE PROC for a channel on an AUX bus (Ui24R only)',
			options: [
				...OPTION_SETS.auxChannel,
				{
					type: 'dropdown',
					label: 'POST PROC',
					id: 'postproc',
					...CHOICES.onoffDropdown,
				},
			],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				const value = Number(action.options.postproc)
				return c.setPostProc(value)
			},
		},

		/**
		 * Volume Buses (SOLO and Headphone)
		 */
		[ActionId.SetVolumeBusValue]: {
			name: 'SOLO/Headphone Bus: Set volume',
			description: 'Set the fader value (dB) for a SOLO or headphone bus (Ui24R only)',
			options: [OPTIONS.volumeBusesDropdown, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const bus = getVolumeBusFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return bus && bus.setFaderLevelDB(value)
			},
		},

		[ActionId.ChangeVolumeBusValue]: {
			name: 'SOLO/Headphone Bus: Change volume (relative)',
			description: 'Relatively change the fader value (dB) for a SOLO or headphone bus (Ui24R only)',
			options: [OPTIONS.volumeBusesDropdown, OPTIONS.faderChangeField],
			callback: (action) => {
				const bus = getVolumeBusFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return bus && bus.changeFaderLevelDB(value)
			},
		},

		/**
		 * FX channels
		 */
		[ActionId.MuteFxChannel]: {
			name: 'FX channels: Mute',
			description: 'Mute/unmute a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				switch (Number(action.options.mute)) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		[ActionId.SetFxChannelValue]: {
			name: 'FX channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeFxChannel]: {
			name: 'FX channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeFxChannelValue]: {
			name: 'FX channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.SetFxChannelPost]: {
			name: 'FX channels: Set PRE/POST',
			description: 'Set or toggle PRE/POST for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.prepostDropdown],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				switch (Number(action.options.post)) {
					case 0:
						return c.pre()
					case 1:
						return c.post()
					case 2:
						return c.togglePost()
				}
			},
		},

		/**
		 * Media Player
		 */
		[ActionId.MediaPlay]: {
			name: 'Media Player: Play/Stop',
			options: [],
			callback: () => conn.player.play(),
		},

		[ActionId.MediaStop]: {
			name: 'Media Player: Stop',
			options: [],
			callback: () => conn.player.stop(),
		},

		[ActionId.MediaPause]: {
			name: 'Media Player: Pause',
			options: [],
			callback: () => conn.player.pause(),
		},

		[ActionId.MediaNext]: {
			name: 'Media Player: Next track',
			options: [],
			callback: () => conn.player.next(),
		},

		[ActionId.MediaPrev]: {
			name: 'Media Player: Previous track',
			options: [],
			callback: () => conn.player.prev(),
		},

		[ActionId.MediaSwitchPlist]: {
			name: 'Media Player: Switch Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist',
					id: 'playlist',
					default: '~all~',
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				conn.player.loadPlaylist(action.options.playlist as string)
			},
		},

		[ActionId.MediaSwitchTrack]: {
			name: 'Media Player: Switch Track',
			options: [
				{
					type: 'textinput',
					label: 'Playlist',
					id: 'playlist',
					default: '~all~',
					regex: Regex.SOMETHING,
				},
				{
					type: 'textinput',
					label: 'Track/File',
					id: 'track',
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				conn.player.loadTrack(action.options.playlist as string, action.options.track as string)
			},
		},

		[ActionId.MediaSetPlayMode]: {
			name: 'Media Player: Set play mode (MANUAL/AUTO)',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					choices: [
						{ id: 'manual', label: 'MANUAL' },
						{ id: 'auto', label: 'AUTO' },
					],
					default: 'manual',
				},
			],
			callback: (action) => {
				switch (action.options.mode) {
					case 'manual':
						return conn.player.setManual()
					case 'auto':
						return conn.player.setAuto()
				}
			},
		},

		[ActionId.MediaSetShuffle]: {
			name: 'Media Player: Set shuffle',
			options: [
				{
					type: 'dropdown',
					label: 'Shuffle',
					id: 'shuffle',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				switch (Number(action.options.shuffle)) {
					case 0:
						return conn.player.setShuffle(0)
					case 1:
						return conn.player.setShuffle(1)
					case 2:
						return conn.player.toggleShuffle()
				}
			},
		},

		/**
		 * 2-track Recorder
		 */
		[ActionId.DTRecordStart]: {
			name: '2-Track Recording: Record Start',
			options: [],
			callback: () => conn.recorderDualTrack.recordStart(),
		},

		[ActionId.DTRecordStop]: {
			name: '2-Track Recording: Record Stop',
			options: [],
			callback: () => conn.recorderDualTrack.recordStop(),
		},

		[ActionId.DTRecordToggle]: {
			name: '2-Track Recording: Record Toggle',
			options: [],
			callback: () => conn.recorderDualTrack.recordToggle(),
		},

		/**
		 * Multitrack Recorder
		 */
		[ActionId.MTKPlay]: {
			name: 'Multitrack: Play/Pause Playback',
			description:
				'Play or pause playback in the multitrack recorder. If playback is running, it will be paused. If playback is stopped or paused, it will be started.',
			options: [],
			callback: () => conn.recorderMultiTrack.play(),
		},

		[ActionId.MTKStop]: {
			name: 'Multitrack: Stop Playback',
			description:
				'Stop playback in the multitrack recorder. This will not stop recording, please use the "Multitrack: Stop Recording" action for this use-case.',
			options: [],
			callback: () => conn.recorderMultiTrack.stop(),
		},

		[ActionId.MTKPause]: {
			name: 'Multitrack: Pause Playback',
			options: [],
			callback: () => conn.recorderMultiTrack.pause(),
		},

		[ActionId.MTKRecordStart]: {
			name: 'Multitrack: Start Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordStart(),
		},

		[ActionId.MTKRecordStop]: {
			name: 'Multitrack: Stop Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordStop(),
		},

		[ActionId.MTKRecordToggle]: {
			name: 'Multitrack: Toggle Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordToggle(),
		},

		[ActionId.MTKSoundcheck]: {
			name: 'Multitrack: Activate/deactivate soundcheck',
			description: 'Activate, deactivate or toggle soundcheck in the multitrack recorder',
			options: [
				{
					type: 'dropdown',
					label: 'Activate/deactivate',
					id: 'state',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				const recorder = conn.recorderMultiTrack

				switch (Number(action.options.state)) {
					case 0:
						return recorder.deactivateSoundcheck()
					case 1:
						return recorder.activateSoundcheck()
					case 2:
						return recorder.toggleSoundcheck()
				}
			},
		},

		/**
		 * MUTE Groups / ALL / FX
		 */
		[ActionId.MuteGroupMute]: {
			name: 'MUTE Groups/ALL/FX: Mute',
			description: 'Mute/unmute a mute group or ALL/FX',
			options: [OPTIONS.muteGroupDropdown, OPTIONS.muteDropdown],
			callback: (action) => {
				const groupId = getMuteGroupIDFromOptions(action.options)
				if (groupId === -1) {
					return
				}

				const group = conn.muteGroup(groupId)
				switch (Number(action.options.mute)) {
					case 0:
						return group.unmute()
					case 1:
						return group.mute()
					case 2:
						return group.toggle()
				}
			},
		},

		[ActionId.MuteGroupClear]: {
			name: 'MUTE Groups/ALL/FX: Clear',
			description: 'Unmute all mute groups',
			options: [],
			callback: () => conn.clearMuteGroups(),
		},

		/**
		 * Shows / Snapshots / Cues
		 */
		[ActionId.LoadShow]: {
			name: 'Shows: Load Show',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				if (action.options.show) {
					conn.shows.loadShow(action.options.show as string)
				}
			},
		},

		[ActionId.LoadSnapshot]: {
			name: 'Shows: Load Snapshot',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					regex: Regex.SOMETHING,
				},
				{
					type: 'textinput',
					label: 'Snapshot Name',
					id: 'snapshot',
					default: '* Init *',
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				if (action.options.show && action.options.snapshot) {
					conn.shows.loadSnapshot(action.options.show as string, action.options.snapshot as string)
				}
			},
		},

		[ActionId.LoadCue]: {
			name: 'Shows: Load Cue',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					regex: Regex.SOMETHING,
				},
				{
					type: 'textinput',
					label: 'Cue Name',
					id: 'cue',
					default: '',
					regex: Regex.SOMETHING,
				},
			],
			callback: (action) => {
				if (action.options.show && action.options.cue) {
					conn.shows.loadCue(action.options.show as string, action.options.cue as string)
				}
			},
		},

		/**
		 * HW Channels / Phantom Power
		 */
		[ActionId.HwSetPhantomPower]: {
			name: 'HW Channel: Set Phantom Power',
			description:
				'Set or toggle phantom power for a physical input. Be aware that input and HW channel numbers can be different when patching is enabled (Ui24R only). Use with care! Phantom power can destroy some microphones.',
			options: [
				OPTIONS.hwChannelNumberField,
				{
					type: 'dropdown',
					label: 'Phantom Power',
					id: 'power',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				const channelNo = Number(action.options.hwchannel)
				const channel = conn.hw(channelNo)

				switch (Number(action.options.power)) {
					case 0:
						return channel.phantomOff()
					case 1:
						return channel.phantomOn()
					case 2:
						return channel.togglePhantom()
				}
			},
		},

		/**
		 * Automix
		 */
		[ActionId.AutomixAssignGroupToChannel]: {
			name: 'Automix: Assign channel to automix group',
			description: 'Assign a master input channel to an automix group',
			options: [
				OPTIONS.channelNumberField,
				{
					type: 'dropdown',
					label: 'Automix Group',
					id: 'group',
					choices: [
						{ id: 'a', label: 'A' },
						{ id: 'b', label: 'B' },
						{ id: 'none', label: 'None / Remove' },
					],
					default: 'none',
				},
			],
			callback: (action) => {
				const channel = getMasterChannel(conn.master, 'i', Number(action.options.channel))
				let group: AutomixGroupId | 'none' = 'none'
				switch (action.options.group) {
					case 'a':
						group = 'a'
						break
					case 'b':
						group = 'b'
						break
					default:
						group = 'none'
				}

				channel.automixAssignGroup(group)
			},
		},

		[ActionId.AutomixEnableGroup]: {
			name: 'Automix: Enable/disable automix group',
			description: 'Enable, disable or toggle an automix group',
			options: [
				{
					type: 'dropdown',
					label: 'Automix Group',
					id: 'group',
					choices: [
						{ id: 'a', label: 'A' },
						{ id: 'b', label: 'B' },
					],
					default: 'a',
				},
				{
					type: 'dropdown',
					label: 'Enable/disable',
					id: 'state',
					...CHOICES.onofftoggleDropdown,
				},
			],
			callback: (action) => {
				let group = conn.automix.groups.a
				if (action.options.group === 'b') {
					group = conn.automix.groups.b
				}

				switch (Number(action.options.state)) {
					case 0:
						return group.disable()
					case 1:
						return group.enable()
					case 2:
						return group.toggle()
				}
			},
		},
	}
}
