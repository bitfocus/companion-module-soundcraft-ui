import { CompanionActionDefinitions, Regex } from '@companion-module/base'
import { SoundcraftUI } from 'soundcraft-ui-connection'
import { CHOICES, OPTIONS, OPTION_SETS } from './utils/input-utils'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannelFromOptions,
	getMuteGroupIDFromOptions,
	getVolumeBusFromOptions,
} from './utils/channel-selection'

export enum ActionId {
	// Master
	SetMasterValue = 'setmastervalue',
	ChangeMasterValue = 'changemastervalue',
	FadeMaster = 'fademaster',
	DimMaster = 'dimmaster',

	// Master Channels
	MuteMasterChannel = 'mutemasterchannel',
	SoloMasterChannel = 'solomasterchannel',
	SetMasterChannelValue = 'setmasterchannelvalue',
	ChangeMasterChannelValue = 'changemasterchannelvalue',
	FadeMasterChannel = 'fademasterchannel',

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

	// MUTE Groups / ALL / FX
	MuteGroupMute = 'mutegroupmute',
	MuteGroupClear = 'mutegroupclear',

	// Shows / Snapshots / Cues
	LoadShow = 'loadshow',
	LoadSnapshot = 'loadsnapshot',
	LoadCue = 'loadcue',

	// Hardware Channels / Phantom Power
	HwSetPhantomPower = 'hwsetphantompower',
}

export function GetActionsList(conn: SoundcraftUI): CompanionActionDefinitions {
	return {
		/**
		 * MASTER
		 */
		[ActionId.SetMasterValue]: {
			name: 'Master: Set fader value',
			options: [OPTIONS.faderValuesSlider],
			callback: (action) => {
				const value = Number(action.options.value)
				return conn.master.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeMaster]: {
			name: 'Master: Fade transition',
			options: [...OPTION_SETS.fadeTransition],
			callback: (action) => {
				return conn.master.fadeToDB(
					Number(action.options.value),
					Number(action.options.fadeTime),
					Number(action.options.easing)
				)
			},
		},

		[ActionId.ChangeMasterValue]: {
			name: 'Master: Change fader value (relative)',
			options: [OPTIONS.faderChangeField],
			callback: (action) => {
				const value = Number(action.options.value)
				return conn.master.changeFaderLevelDB(value)
			},
		},

		[ActionId.DimMaster]: {
			name: 'Master: Dim',
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

		/**
		 * Master Channels
		 */
		[ActionId.MuteMasterChannel]: {
			name: 'Master channels: Mute',
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
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeMasterChannel]: {
			name: 'Master channels: Fade transition',
			options: [...OPTION_SETS.masterChannel, ...OPTION_SETS.fadeTransition],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeMasterChannelValue]: {
			name: 'Master channels: Change fader value (relative)',
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.SoloMasterChannel]: {
			name: 'Master channels: Solo',
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

		/**
		 * AUX Channels
		 */
		[ActionId.MuteAuxChannel]: {
			name: 'AUX channels: Mute',
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
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeAuxChannel]: {
			name: 'AUX channels: Fade transition',
			options: [...OPTION_SETS.auxChannel, ...OPTION_SETS.fadeTransition],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeAuxChannelValue]: {
			name: 'AUX channels: Change fader value (relative)',
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.SetAuxChannelPost]: {
			name: 'AUX channels: Set PRE/POST',
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
			options: [OPTIONS.volumeBusesDropdown, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const bus = getVolumeBusFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return bus && bus.setFaderLevelDB(value)
			},
		},

		[ActionId.ChangeVolumeBusValue]: {
			name: 'SOLO/Headphone Bus: Change volume (relative)',
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
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.setFaderLevelDB(value)
			},
		},

		[ActionId.FadeFxChannel]: {
			name: 'FX channels: Fade transition',
			options: [...OPTION_SETS.fxChannel, ...OPTION_SETS.fadeTransition],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				return c.fadeToDB(Number(action.options.value), Number(action.options.fadeTime), Number(action.options.easing))
			},
		},

		[ActionId.ChangeFxChannelValue]: {
			name: 'FX channels: Change fader value (relative)',
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				const value = Number(action.options.value)
				return c.changeFaderLevelDB(value)
			},
		},

		[ActionId.SetFxChannelPost]: {
			name: 'FX channels: Set PRE/POST',
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
		[ActionId.DTRecordToggle]: {
			name: '2-Track USB Recording: Record Toggle',
			options: [],
			callback: () => conn.recorderDualTrack.recordToggle(),
		},

		/**
		 * MUTE Groups / ALL / FX
		 */
		[ActionId.MuteGroupMute]: {
			name: 'MUTE Groups/ALL/FX: Mute',
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
				'A Hardware Channel is a physical input on the mixer. Be aware that input and HW channel numbers can be different when patching is enabled. Use with care! Enabling phantom power can destroy some microphones.',
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
	}
}
