import {
	type CompanionFeedbackDefinitions,
	type CompanionFeedbackButtonStyleResult,
	combineRgb,
} from '@companion-module/base'
import { type MuteGroupID, MtkState, PlayerState, SoundcraftUI } from 'soundcraft-ui-connection'
import { map } from 'rxjs'

import { UiFeedbackStore } from './feedback-store.js'
import { OPTION_SETS, OPTIONS } from './utils/input-utils.js'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannelFromOptions,
} from './utils/channel-selection.js'
import { patchDestinations, patchSources } from './utils/patch-parameters.js'
import type { AuxChannelOpts, FxChannelOpts, MasterChannelOpts, NoOpts } from './utils/option-types.js'

export type UiFeedbackSchemas = {
	mutemasterchannel: { type: 'boolean'; options: MasterChannelOpts }
	solomasterchannel: { type: 'boolean'; options: MasterChannelOpts }
	masterchannelmtkselection: { type: 'boolean'; options: MasterChannelOpts }
	dimmaster: { type: 'boolean'; options: NoOpts }
	muteauxchannel: { type: 'boolean'; options: AuxChannelOpts }
	postauxchannel: { type: 'boolean'; options: AuxChannelOpts }
	mutefxchannel: { type: 'boolean'; options: FxChannelOpts }
	postfxchannel: { type: 'boolean'; options: FxChannelOpts }
	mediaplayerstate: { type: 'boolean'; options: { state: number } }
	mediaplayershuffle: { type: 'boolean'; options: NoOpts }
	dualtrackrecordstate: { type: 'boolean'; options: { state: string } }
	mtkplayerstate: { type: 'boolean'; options: { state: number } }
	mtkrecordstate: { type: 'boolean'; options: { state: string } }
	mtksoundcheckstate: { type: 'boolean'; options: NoOpts }
	mutemutegroup: { type: 'boolean'; options: { group: number | string } }
	hwphantompower: { type: 'boolean'; options: { hwchannel: number } }
	automixgroupstate: { type: 'boolean'; options: { group: string } }
	patchingroutestate: { type: 'boolean'; options: { source: string; destination: string } }
	rawvalue: { type: 'value'; options: { key: string } }
}

export const feedbackDefaultStyles: Record<string, CompanionFeedbackButtonStyleResult> = {
	mute: {
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(255, 0, 0),
	},
	post: {
		bgcolor: combineRgb(0, 120, 0),
		color: combineRgb(255, 255, 255),
	},
	solo: {
		bgcolor: combineRgb(255, 255, 0),
		color: combineRgb(0, 0, 0),
	},
	dim: {
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 150, 255),
	},
}

export function GetFeedbacksList(
	store: UiFeedbackStore,
	conn: SoundcraftUI,
): CompanionFeedbackDefinitions<UiFeedbackSchemas> {
	return {
		mutemasterchannel: {
			type: 'boolean',
			name: 'Master channel: MUTE',
			description: 'If the specified master channel is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [...OPTION_SETS.masterChannel],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.ensureSubscription(evt.id, c.mute$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		solomasterchannel: {
			type: 'boolean',
			name: 'Master channel: SOLO',
			description: 'If the specified master channel has SOLO active',
			defaultStyle: feedbackDefaultStyles.solo,
			options: [...OPTION_SETS.masterChannel],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-solo'
				store.ensureSubscription(evt.id, c.solo$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		masterchannelmtkselection: {
			type: 'boolean',
			name: 'Master channel: Multitrack Selection State',
			description: 'If the specified master channel is selected for multitrack recording',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(153, 153, 0),
			},
			options: [...OPTION_SETS.multiTrackMasterChannel],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mtkrec'
				store.ensureSubscription(evt.id, c.multiTrackSelected$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		dimmaster: {
			type: 'boolean',
			name: 'Master: DIM (Ui24R only)',
			description: 'If the master is dimmed',
			defaultStyle: feedbackDefaultStyles.dim,
			options: [],
			callback: (evt) => {
				const streamId = 'masterdim'
				store.ensureSubscription(evt.id, conn.master.dim$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		muteauxchannel: {
			type: 'boolean',
			name: 'AUX bus channel: MUTE',
			description: 'If the specified channel on the AUX bus is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [...OPTION_SETS.auxChannel],
			callback: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.ensureSubscription(evt.id, c.mute$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		postauxchannel: {
			type: 'boolean',
			name: 'AUX bus channel: POST',
			description: 'If the specified channel on the AUX bus has POST enabled',
			defaultStyle: feedbackDefaultStyles.post,
			options: [...OPTION_SETS.auxChannel],
			callback: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				store.ensureSubscription(evt.id, c.post$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mutefxchannel: {
			type: 'boolean',
			name: 'FX bus channel: MUTE',
			description: 'If the specified channel on the FX bus is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [...OPTION_SETS.fxChannel],
			callback: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.ensureSubscription(evt.id, c.mute$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		postfxchannel: {
			type: 'boolean',
			name: 'FX bus channel: POST',
			description: 'If the specified channel on the FX bus has POST enabled',
			defaultStyle: feedbackDefaultStyles.post,
			options: [...OPTION_SETS.fxChannel],
			callback: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				store.ensureSubscription(evt.id, c.post$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mediaplayerstate: {
			type: 'boolean',
			name: 'Media Player: Player State',
			description: 'If the media player has the specified state (playing, paused, stopped)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 255, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					choices: [
						{ id: PlayerState.Stopped, label: 'Stopped' },
						{ id: PlayerState.Playing, label: 'Playing' },
						{ id: PlayerState.Paused, label: 'Paused' },
					],
					default: PlayerState.Playing,
					disableAutoExpression: true,
				},
			],
			callback: (evt) => {
				const state = evt.options.state
				const state$ = conn.player.state$.pipe(map((s) => s === state))
				const streamId = 'playerstate' + state
				store.ensureSubscription(evt.id, state$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mediaplayershuffle: {
			type: 'boolean',
			name: 'Media Player: Shuffle',
			description: 'If the shuffle setting of the media player is active',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(156, 22, 69),
			},
			options: [],
			callback: (evt) => {
				const streamId = 'playershuffle'
				store.ensureSubscription(evt.id, conn.player.shuffle$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		dualtrackrecordstate: {
			type: 'boolean',
			name: '2-track USB recording: Recording State',
			description: 'If the 2-track USB recorder has the specified state (recording, busy)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					choices: [
						{ id: 'rec', label: 'Recording' },
						{ id: 'busy', label: 'Busy' },
					],
					default: 'rec',
					disableAutoExpression: true,
				},
			],
			callback: (evt) => {
				const streamId = 'dtrec-' + evt.options.state
				const recorder = conn.recorderDualTrack
				switch (evt.options.state) {
					case 'rec':
						store.ensureSubscription(evt.id, recorder.recording$, streamId)
						break
					case 'busy':
						store.ensureSubscription(evt.id, recorder.busy$, streamId)
						break
				}
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mtkplayerstate: {
			type: 'boolean',
			name: 'Multitrack Recording: Player State',
			description: 'If the multitrack player has the specified state (playing, paused, stopped)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 255, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					choices: [
						{ id: MtkState.Stopped, label: 'Stopped' },
						{ id: MtkState.Playing, label: 'Playing' },
						{ id: MtkState.Paused, label: 'Paused' },
					],
					default: PlayerState.Playing,
					disableAutoExpression: true,
				},
			],
			callback: (evt) => {
				const state = evt.options.state
				const state$ = conn.recorderMultiTrack.state$.pipe(map((s) => s === state))
				const streamId = 'mtkstate' + state
				store.ensureSubscription(evt.id, state$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mtkrecordstate: {
			type: 'boolean',
			name: 'Multitrack Recording: Recording State',
			description: 'If the multitrack recorder has the specified state (recording, busy)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					choices: [
						{ id: 'rec', label: 'Recording' },
						{ id: 'busy', label: 'Busy' },
					],
					default: 'rec',
					disableAutoExpression: true,
				},
			],
			callback: (evt) => {
				const streamId = 'mtk-' + evt.options.state
				const recorder = conn.recorderMultiTrack
				switch (evt.options.state) {
					case 'rec':
						store.ensureSubscription(evt.id, recorder.recording$, streamId)
						break
					case 'busy':
						store.ensureSubscription(evt.id, recorder.busy$, streamId)
						break
				}
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mtksoundcheckstate: {
			type: 'boolean',
			name: 'Multitrack Recording: Soundcheck State',
			description: 'If soundcheck in the multitrack recorder is active',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: (evt) => {
				const streamId = 'mtksoundcheck'
				store.ensureSubscription(evt.id, conn.recorderMultiTrack.soundcheck$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mutemutegroup: {
			type: 'boolean',
			name: 'MUTE group/ALL/FX state',
			description: 'If the specified group is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [OPTIONS.muteGroupDropdown],
			callback: (evt) => {
				const groupId = evt.options.group as MuteGroupID
				const streamId = 'mgstate' + groupId
				const group = conn.muteGroup(groupId)
				store.ensureSubscription(evt.id, group.state$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		hwphantompower: {
			type: 'boolean',
			name: 'HW Channel: Phantom power',
			description: 'If Phantom Power is enabled for an input',
			defaultStyle: {
				bgcolor: combineRgb(51, 102, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [OPTIONS.hwChannelNumberField],
			callback: (evt) => {
				const streamId = 'hw' + evt.options.hwchannel + 'phantom'
				const channel = conn.hw(evt.options.hwchannel)
				store.ensureSubscription(evt.id, channel.phantom$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		automixgroupstate: {
			type: 'boolean',
			name: 'Automix: Group State',
			description: 'If an automix group is enabled',
			defaultStyle: {
				bgcolor: combineRgb(30, 150, 50),
				color: combineRgb(255, 255, 255),
			},
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
			],
			callback: (evt) => {
				let group
				switch (evt.options.group) {
					case 'a':
						group = conn.automix.groups.a
						break
					case 'b':
						group = conn.automix.groups.b
						break
					default:
						return false
				}
				const streamId = 'amixgroupstate' + evt.options.group
				store.ensureSubscription(evt.id, group.state$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		patchingroutestate: {
			type: 'boolean',
			name: 'Patching: Route config state (Ui24R only)',
			description: 'If the specified source is patched to the specified destination',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 0),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (evt) => {
				const source = evt.options.source
				const destination = evt.options.destination

				const feedback$ = conn.store.state$.pipe(map((state) => state[destination] === source))

				const streamId = `patchroute-${source}-${destination}`
				store.ensureSubscription(evt.id, feedback$, streamId)
				return store.getBooleanState(streamId)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		// Raw values
		rawvalue: {
			type: 'value',
			name: 'Raw value: Get raw state value (advanced)',
			description:
				'ADVANCED! USE WITH CAUTION! Read a raw value from the mixer. Always prefer the existing feedbacks and variables to read state.',
			options: [OPTIONS.stateKeyField],
			callback: async (evt) => {
				const value$ = conn.store.state$.pipe(map((state) => state[evt.options.key]))
				const streamId = `rawd-${evt.options.key}`
				store.ensureSubscription(evt.id, value$, streamId)
				return store.getState(streamId) ?? ''
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},
	}
}
