import type { CompanionActionDefinitions } from '@companion-module/base'
import type { AutomixGroupId, DelayableMasterChannel, MuteGroupID, SoundcraftUI } from 'soundcraft-ui-connection'

import { CHOICES, OPTIONS, OPTION_SETS } from './utils/input-utils.js'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannel,
	getMasterChannelFromOptions,
	getVolumeBusFromOptions,
} from './utils/channel-selection.js'
import { patchDestinations, patchSources } from './utils/patch-parameters.js'
import { convertPanOffsetToLinearOffset, convertPanToLinearValue } from './utils/utils.js'
import type { AuxChannelOpts, FadeOpts, FxChannelOpts, MasterChannelOpts, NoOpts } from './utils/option-types.js'

export type UiActionSchemas = {
	// Master
	setmastervalue: { options: { value: number } }
	changemastervalue: { options: { value: number } }
	fademaster: { options: FadeOpts }
	dimmaster: { options: { dim: number } }
	setmasterdelay: { options: { time: number; side: string } }
	changemasterdelay: { options: { time: number; side: string } }

	// Master Channels
	mutemasterchannel: { options: MasterChannelOpts & { mute: number } }
	solomasterchannel: { options: MasterChannelOpts & { solo: number } }
	setmasterchannelpan: { options: MasterChannelOpts & { value: number } }
	changemasterchannelpan: { options: MasterChannelOpts & { value: number } }
	setmasterchannelvalue: { options: MasterChannelOpts & { value: number } }
	changemasterchannelvalue: { options: MasterChannelOpts & { value: number } }
	fademasterchannel: { options: MasterChannelOpts & FadeOpts }
	setmasterchanneldelay: { options: MasterChannelOpts & { time: number } }
	changemasterchanneldelay: { options: MasterChannelOpts & { time: number } }
	masterchannelselectmtk: { options: MasterChannelOpts & { select: number } }

	// AUX Channels
	muteauxchannel: { options: AuxChannelOpts & { mute: number } }
	setauxchannelvalue: { options: AuxChannelOpts & { value: number } }
	changeauxchannelvalue: { options: AuxChannelOpts & { value: number } }
	fadeauxchannel: { options: AuxChannelOpts & FadeOpts }
	setauxchannelpost: { options: AuxChannelOpts & { post: number } }
	setauxchannelpostproc: { options: AuxChannelOpts & { postproc: number } }
	setauxchannelpan: { options: AuxChannelOpts & { value: number } }
	changeauxchannelpan: { options: AuxChannelOpts & { value: number } }

	// FX Channels
	mutefxchannel: { options: FxChannelOpts & { mute: number } }
	setfxchannelvalue: { options: FxChannelOpts & { value: number } }
	changefxchannelvalue: { options: FxChannelOpts & { value: number } }
	fadefxchannel: { options: FxChannelOpts & FadeOpts }
	setfxchannelpost: { options: FxChannelOpts & { post: number } }

	// FX Settings
	setfxbpm: { options: { fx: number[]; bpm: number } }
	setfxparam: { options: { fx: number; param: number; value: number } }

	// Volume Buses (SOLO, Headphone)
	setvolumebusvalue: { options: { bus: string; value: number } }
	changevolumebusvalue: { options: { bus: string; value: number } }

	// Media Player
	mediaplay: { options: NoOpts }
	mediastop: { options: NoOpts }
	mediapause: { options: NoOpts }
	medianext: { options: NoOpts }
	mediaprev: { options: NoOpts }
	mediaswitchplist: { options: { playlist: string } }
	mediaswitchtrack: { options: { playlist: string; track: string } }
	mediasetplaymode: { options: { mode: string } }
	mediasetshuffle: { options: { shuffle: number } }

	// 2-Track Recorder
	dualtrackrecordtoggle: { options: NoOpts }
	dualtrackrecordstart: { options: NoOpts }
	dualtrackrecordstop: { options: NoOpts }

	// Multitrack Recorder
	mtkplay: { options: NoOpts }
	mtkstop: { options: NoOpts }
	mtkpause: { options: NoOpts }
	mtkrecordtoggle: { options: NoOpts }
	mtkrecordstart: { options: NoOpts }
	mtkrecordstop: { options: NoOpts }
	mtksoundcheck: { options: { state: number } }

	// MUTE Groups / ALL / FX
	mutegroupmute: { options: { group: number | string; mute: number } }
	mutegroupclear: { options: NoOpts }

	// Shows / Snapshots / Cues
	loadshow: { options: { show: string } }
	loadsnapshot: { options: { show: string; snapshot: string } }
	loadcue: { options: { show: string; cue: string } }
	savesnapshot: { options: { show: string; snapshot: string } }
	updatecurrentsnapshot: { options: NoOpts }
	savecue: { options: { show: string; cue: string } }
	updatecurrentcue: { options: NoOpts }

	// Hardware Channels / Phantom Power
	hwsetphantompower: { options: { hwchannel: number; power: number } }

	// Automix
	automixassigngrouptochannel: { options: { channel: number; group: string } }
	automixenablegroup: { options: { group: string; state: number } }

	// Patching / Routing
	patchingsetroute: { options: { source: string; destination: string } }
}

export function GetActionsList(conn: SoundcraftUI): CompanionActionDefinitions<UiActionSchemas> {
	return {
		/**
		 * MASTER
		 */
		setmastervalue: {
			name: 'Master: Set fader value',
			description: 'Set the fader value (dB) for the master fader',
			options: [OPTIONS.faderValuesSlider],
			callback: (action) => conn.master.setFaderLevelDB(action.options.value),
		},

		fademaster: {
			name: 'Master: Fade transition',
			description: 'Perform a timed fade transition on the master fader',
			options: [...OPTION_SETS.fadeTransition],
			callback: async (action) =>
				conn.master.fadeToDB(action.options.value, action.options.fadeTime, action.options.easing),
		},

		changemastervalue: {
			name: 'Master: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for the master fader',
			options: [OPTIONS.faderChangeField],
			callback: (action) => conn.master.changeFaderLevelDB(action.options.value),
		},

		dimmaster: {
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
				switch (action.options.dim) {
					case 0:
						return conn.master.undim()
					case 1:
						return conn.master.dim()
					case 2:
						return conn.master.toggleDim()
				}
			},
		},

		setmasterdelay: {
			name: 'Master: Set output delay',
			description: 'Set delay for the master output (left, right or both)',
			options: [OPTIONS.delayTimeField(0, 500), OPTIONS.masterDelayDropdown],
			callback: (action) => {
				switch (action.options.side) {
					case 'left':
						return conn.master.setDelayL(action.options.time)
					case 'right':
						return conn.master.setDelayR(action.options.time)
					default: {
						conn.master.setDelayL(action.options.time)
						conn.master.setDelayR(action.options.time)
						return
					}
				}
			},
		},

		changemasterdelay: {
			name: 'Master: Change output delay (relative)',
			description: 'Relatively change delay for the master output (left, right or both)',
			options: [OPTIONS.delayTimeField(-500, 500), OPTIONS.masterDelayDropdown],
			callback: (action) => {
				switch (action.options.side) {
					case 'left':
						return conn.master.changeDelayL(action.options.time)
					case 'right':
						return conn.master.changeDelayR(action.options.time)
					default: {
						conn.master.changeDelayL(action.options.time)
						conn.master.changeDelayR(action.options.time)
						return
					}
				}
			},
		},

		/**
		 * Master Channels
		 */
		mutemasterchannel: {
			name: 'Master channels: Mute',
			description: 'Set or toggle MUTE for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				switch (action.options.mute) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		setmasterchannelvalue: {
			name: 'Master channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				return c.setFaderLevelDB(action.options.value)
			},
		},

		fademasterchannel: {
			name: 'Master channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				return c.fadeToDB(action.options.value, action.options.fadeTime, action.options.easing)
			},
		},

		changemasterchannelvalue: {
			name: 'Master channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				return c.changeFaderLevelDB(action.options.value)
			},
		},

		solomasterchannel: {
			name: 'Master channels: Solo',
			description: 'Set or toggle SOLO for a channel on the master bus',
			options: [...OPTION_SETS.masterChannel, OPTIONS.soloDropdown],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				switch (action.options.solo) {
					case 0:
						return c.unsolo()
					case 1:
						return c.solo()
					case 2:
						return c.toggleSolo()
				}
			},
		},

		setmasterchannelpan: {
			name: 'Master channels: Set PAN',
			description: 'Set PAN value for a channel on the master bus',
			options: [...OPTION_SETS.pannableMasterChannel, OPTIONS.panValueSlider],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				c.setPan(convertPanToLinearValue(action.options.value))
			},
		},

		changemasterchannelpan: {
			name: 'Master channels: Change PAN (relative)',
			description: 'Relatively change PAN value for a channel on the master bus (PAN Range: -100 to 100)',
			options: [...OPTION_SETS.pannableMasterChannel, OPTIONS.panChangeField],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn)
				c.changePan(convertPanOffsetToLinearOffset(action.options.value))
			},
		},

		setmasterchanneldelay: {
			name: 'Master channels: Set output delay',
			description:
				'Set output delay for a channel on the master bus. Input and Line channels allow for max. 250 ms, AUX master faders can be delayed by max. 500 ms.',
			options: [...OPTION_SETS.delayableMasterChannel(0, 500)],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn) as DelayableMasterChannel
				c.setDelay(action.options.time)
			},
		},

		changemasterchanneldelay: {
			name: 'Master channels: Change output delay (relative)',
			description:
				'Relatively change output delay for a channel on the master bus. Input and Line channels allow for max. 250 ms, AUX master faders can be delayed by max. 500 ms.',
			options: [...OPTION_SETS.delayableMasterChannel(-500, 500)],
			callback: (action) => {
				const c = getMasterChannelFromOptions(action.options, conn) as DelayableMasterChannel
				c.changeDelay(action.options.time)
			},
		},

		masterchannelselectmtk: {
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
				switch (action.options.select) {
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
		muteauxchannel: {
			name: 'AUX channels: Mute',
			description: 'Set or toggle MUTE for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				switch (action.options.mute) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		setauxchannelvalue: {
			name: 'AUX channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				return c.setFaderLevelDB(action.options.value)
			},
		},

		fadeauxchannel: {
			name: 'AUX channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				return c.fadeToDB(action.options.value, action.options.fadeTime, action.options.easing)
			},
		},

		changeauxchannelvalue: {
			name: 'AUX channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				return c.changeFaderLevelDB(action.options.value)
			},
		},

		setauxchannelpost: {
			name: 'AUX channels: Set PRE/POST',
			description: 'Set or toggle PRE/POST for a channel on an AUX bus',
			options: [...OPTION_SETS.auxChannel, OPTIONS.prepostDropdown],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				switch (action.options.post) {
					case 0:
						return c.pre()
					case 1:
						return c.post()
					case 2:
						return c.togglePost()
				}
			},
		},

		setauxchannelpostproc: {
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
				return c.setPostProc(action.options.postproc)
			},
		},

		setauxchannelpan: {
			name: 'AUX channels: Set PAN',
			description: 'Set PAN value for a channel on a AUX bus. Not possible for mono AUX!',
			options: [...OPTION_SETS.auxChannel, OPTIONS.panValueSlider],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				c.setPan(convertPanToLinearValue(action.options.value))
			},
		},

		changeauxchannelpan: {
			name: 'AUX channels: Change PAN (relative)',
			description:
				'Relatively change PAN value for a channel on a AUX bus (PAN Range: -100 to 100). Not possible for mono AUX!',
			options: [...OPTION_SETS.auxChannel, OPTIONS.panChangeField],
			callback: (action) => {
				const c = getAuxChannelFromOptions(action.options, conn)
				c.changePan(convertPanOffsetToLinearOffset(action.options.value))
			},
		},

		/**
		 * Volume Buses (SOLO and Headphone)
		 */
		setvolumebusvalue: {
			name: 'SOLO/Headphone Bus: Set volume',
			description: 'Set the fader value (dB) for a SOLO or headphone bus (Ui24R only)',
			options: [OPTIONS.volumeBusesDropdown, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const bus = getVolumeBusFromOptions(action.options, conn)
				return bus && bus.setFaderLevelDB(action.options.value)
			},
		},

		changevolumebusvalue: {
			name: 'SOLO/Headphone Bus: Change volume (relative)',
			description: 'Relatively change the fader value (dB) for a SOLO or headphone bus (Ui24R only)',
			options: [OPTIONS.volumeBusesDropdown, OPTIONS.faderChangeField],
			callback: (action) => {
				const bus = getVolumeBusFromOptions(action.options, conn)
				return bus && bus.changeFaderLevelDB(action.options.value)
			},
		},

		/**
		 * FX channels
		 */
		mutefxchannel: {
			name: 'FX channels: Mute',
			description: 'Mute/unmute a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.muteDropdown],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				switch (action.options.mute) {
					case 0:
						return c.unmute()
					case 1:
						return c.mute()
					case 2:
						return c.toggleMute()
				}
			},
		},

		setfxchannelvalue: {
			name: 'FX channels: Set fader value',
			description: 'Set the fader value (dB) for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderValuesSlider],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				return c.setFaderLevelDB(action.options.value)
			},
		},

		fadefxchannel: {
			name: 'FX channels: Fade transition',
			description: 'Perform a timed fade transition for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, ...OPTION_SETS.fadeTransition],
			callback: async (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				return c.fadeToDB(action.options.value, action.options.fadeTime, action.options.easing)
			},
		},

		changefxchannelvalue: {
			name: 'FX channels: Change fader value (relative)',
			description: 'Relatively change the fader value (dB) for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.faderChangeField],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				return c.changeFaderLevelDB(action.options.value)
			},
		},

		setfxchannelpost: {
			name: 'FX channels: Set PRE/POST',
			description: 'Set or toggle PRE/POST for a channel on an FX bus',
			options: [...OPTION_SETS.fxChannel, OPTIONS.prepostDropdown],
			callback: (action) => {
				const c = getFxChannelFromOptions(action.options, conn)
				switch (action.options.post) {
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
		 * FX Settings
		 */
		setfxbpm: {
			name: 'FX: Set BPM',
			description: 'Set BPM value for FX processors',
			options: [
				{
					type: 'multidropdown',
					label: 'FX',
					id: 'fx',
					choices: [
						{ id: 1, label: 'FX 1' },
						{ id: 2, label: 'FX 2' },
						{ id: 3, label: 'FX 3' },
						{ id: 4, label: 'FX 4' },
					],
					default: [2, 3, 4],
					minSelection: 1,
					disableAutoExpression: true,
				},
				{
					type: 'number',
					label: 'BPM',
					id: 'bpm',
					min: 20,
					max: 400,
					default: 120,
				},
			],
			callback: (action) => {
				action.options.fx.forEach((fxNo) => {
					conn.fx(fxNo).setBpm(action.options.bpm)
				})
			},
		},

		setfxparam: {
			name: 'FX: Set FX Parameter',
			description:
				'Set parameter for an FX processor. Not every FX uses all of the 6 available parameters. There are no units and number conversion available: The value represents the fader range in percent.',
			options: [
				{
					type: 'dropdown',
					label: 'FX',
					id: 'fx',
					choices: [
						{ id: 1, label: 'FX 1' },
						{ id: 2, label: 'FX 2' },
						{ id: 3, label: 'FX 3' },
						{ id: 4, label: 'FX 4' },
					],
					default: 1,
					disableAutoExpression: true,
				},
				{
					type: 'dropdown',
					label: 'Parameter',
					id: 'param',
					choices: [
						{ id: 1, label: '1' },
						{ id: 2, label: '2' },
						{ id: 3, label: '3' },
						{ id: 4, label: '4' },
						{ id: 5, label: '5' },
						{ id: 6, label: '6' },
					],
					default: 1,
					disableAutoExpression: true,
				},
				{
					type: 'number',
					label: 'Parameter Fader Level (%)',
					id: 'value',
					range: true,
					default: 0,
					step: 1,
					min: 0,
					max: 100,
				},
			],
			callback: (action) => {
				const normalizedValue = action.options.value / 100

				const fx = conn.fx(action.options.fx)
				fx.setParam(action.options.param, normalizedValue)
			},
		},

		/**
		 * Media Player
		 */
		mediaplay: {
			name: 'Media Player: Play/Stop',
			options: [],
			callback: () => conn.player.play(),
		},

		mediastop: {
			name: 'Media Player: Stop',
			options: [],
			callback: () => conn.player.stop(),
		},

		mediapause: {
			name: 'Media Player: Pause',
			options: [],
			callback: () => conn.player.pause(),
		},

		medianext: {
			name: 'Media Player: Next track',
			options: [],
			callback: () => conn.player.next(),
		},

		mediaprev: {
			name: 'Media Player: Previous track',
			options: [],
			callback: () => conn.player.prev(),
		},

		mediaswitchplist: {
			name: 'Media Player: Switch Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist',
					id: 'playlist',
					default: '~all~',
					minLength: 1,
				},
			],
			callback: (action) => conn.player.loadPlaylist(action.options.playlist),
		},

		mediaswitchtrack: {
			name: 'Media Player: Switch Track',
			options: [
				{
					type: 'textinput',
					label: 'Playlist',
					id: 'playlist',
					default: '~all~',
					minLength: 1,
				},
				{
					type: 'textinput',
					label: 'Track/File',
					id: 'track',
					minLength: 1,
				},
			],
			callback: (action) => conn.player.loadTrack(action.options.playlist, action.options.track),
		},

		mediasetplaymode: {
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
					disableAutoExpression: true,
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

		mediasetshuffle: {
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
				switch (action.options.shuffle) {
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
		dualtrackrecordstart: {
			name: '2-Track Recording: Record Start',
			options: [],
			callback: () => conn.recorderDualTrack.recordStart(),
		},

		dualtrackrecordstop: {
			name: '2-Track Recording: Record Stop',
			options: [],
			callback: () => conn.recorderDualTrack.recordStop(),
		},

		dualtrackrecordtoggle: {
			name: '2-Track Recording: Record Toggle',
			options: [],
			callback: () => conn.recorderDualTrack.recordToggle(),
		},

		/**
		 * Multitrack Recorder
		 */
		mtkplay: {
			name: 'Multitrack: Play/Pause Playback',
			description:
				'Play or pause playback in the multitrack recorder. If playback is running, it will be paused. If playback is stopped or paused, it will be started.',
			options: [],
			callback: () => conn.recorderMultiTrack.play(),
		},

		mtkstop: {
			name: 'Multitrack: Stop Playback',
			description:
				'Stop playback in the multitrack recorder. This will not stop recording, please use the "Multitrack: Stop Recording" action for this use-case.',
			options: [],
			callback: () => conn.recorderMultiTrack.stop(),
		},

		mtkpause: {
			name: 'Multitrack: Pause Playback',
			options: [],
			callback: () => conn.recorderMultiTrack.pause(),
		},

		mtkrecordstart: {
			name: 'Multitrack: Start Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordStart(),
		},

		mtkrecordstop: {
			name: 'Multitrack: Stop Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordStop(),
		},

		mtkrecordtoggle: {
			name: 'Multitrack: Toggle Recording',
			options: [],
			callback: () => conn.recorderMultiTrack.recordToggle(),
		},

		mtksoundcheck: {
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

				switch (action.options.state) {
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
		mutegroupmute: {
			name: 'MUTE Groups/ALL/FX: Mute',
			description: 'Mute/unmute a mute group or ALL/FX',
			options: [OPTIONS.muteGroupDropdown, OPTIONS.muteDropdown],
			callback: (action) => {
				const group = conn.muteGroup(action.options.group as MuteGroupID)
				switch (action.options.mute) {
					case 0:
						return group.unmute()
					case 1:
						return group.mute()
					case 2:
						return group.toggle()
				}
			},
		},

		mutegroupclear: {
			name: 'MUTE Groups/ALL/FX: Clear',
			description: 'Unmute all mute groups',
			options: [],
			callback: () => conn.clearMuteGroups(),
		},

		/**
		 * Shows / Snapshots / Cues
		 */
		loadshow: {
			name: 'Shows: Load Show',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					minLength: 1,
				},
			],
			callback: (action) => conn.shows.loadShow(action.options.show),
		},

		loadsnapshot: {
			name: 'Shows: Load Snapshot',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					minLength: 1,
				},
				{
					type: 'textinput',
					label: 'Snapshot Name',
					id: 'snapshot',
					default: '* Init *',
					minLength: 1,
				},
			],
			callback: (action) => conn.shows.loadSnapshot(action.options.show, action.options.snapshot),
		},

		loadcue: {
			name: 'Shows: Load Cue',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: 'Default',
					minLength: 1,
				},
				{
					type: 'textinput',
					label: 'Cue Name',
					id: 'cue',
					default: '',
					minLength: 1,
				},
			],
			callback: (action) => conn.shows.loadCue(action.options.show, action.options.cue),
		},

		savesnapshot: {
			name: 'Shows: Save Snapshot',
			description: 'Save or overwrite a snapshot in a show. This action will not ask for confirmation!',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: '',
					minLength: 1,
				},
				{
					type: 'textinput',
					label: 'Snapshot Name',
					id: 'snapshot',
					default: '',
					minLength: 1,
				},
			],
			callback: (action) => conn.shows.saveSnapshot(action.options.show, action.options.snapshot),
		},

		updatecurrentsnapshot: {
			name: 'Shows: Update Current Snapshot',
			description: 'Update the currently loaded show snapshot. This action will not ask for confirmation!',
			options: [],
			callback: () => conn.shows.updateCurrentSnapshot(),
		},

		savecue: {
			name: 'Shows: Save Cue',
			description: 'Save or overwrite a cue in a show. This action will not ask for confirmation!',
			options: [
				{
					type: 'textinput',
					label: 'Show Name',
					id: 'show',
					default: '',
					minLength: 1,
				},
				{
					type: 'textinput',
					label: 'Cue Name',
					id: 'cue',
					default: '',
					minLength: 1,
				},
			],
			callback: (action) => conn.shows.saveCue(action.options.show, action.options.cue),
		},

		updatecurrentcue: {
			name: 'Shows: Update Current Cue',
			description: 'Update the currently loaded show cue. This action will not ask for confirmation!',
			options: [],
			callback: () => conn.shows.updateCurrentCue(),
		},

		/**
		 * HW Channels / Phantom Power
		 */
		hwsetphantompower: {
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
				const channel = conn.hw(action.options.hwchannel)

				switch (action.options.power) {
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
		automixassigngrouptochannel: {
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
					disableAutoExpression: true,
				},
			],
			callback: (action) => {
				const channel = getMasterChannel(conn.master, 'i', action.options.channel)
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

		automixenablegroup: {
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
					disableAutoExpression: true,
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

				switch (action.options.state) {
					case 0:
						return group.disable()
					case 1:
						return group.enable()
					case 2:
						return group.toggle()
				}
			},
		},

		patchingsetroute: {
			name: 'Patching: Configure patch route (Ui24R only)',
			description:
				'Configure patch from source to destination. USB-A inputs cannot be patched to HW OUTS and CASCADE OUTS.',
			options: [
				{
					type: 'dropdown',
					label: 'Source (from)',
					id: 'source',
					choices: patchSources,
					default: 'none',
					disableAutoExpression: true,
				},
				{
					type: 'dropdown',
					label: 'Destination (to)',
					id: 'destination',
					choices: patchDestinations,
					default: 'i.0.src',
					disableAutoExpression: true,
				},
			],
			callback: (action) => {
				const source = action.options.source
				const destination = action.options.destination

				// USB-A source cannot be patched to HW OUTS or CASCADE OUTS
				if (source.startsWith('ua') && (destination.startsWith('hwout') || destination.startsWith('casc'))) {
					return
				}

				conn.conn.sendMessage(`SETS^${destination}^${source}`)
			},
		},
	}
}
