import {
	type CompanionFeedbackDefinitions,
	type CompanionFeedbackButtonStyleResult,
	combineRgb,
} from '@companion-module/base'
import { type MuteGroupID, MtkState, PlayerState, SoundcraftUI } from 'soundcraft-ui-connection'
import { distinctUntilChanged, map } from 'rxjs'

import { UiFeedbackStore } from './feedback-store.js'
import { getFeedbackFromBinaryState, getStateCheckbox } from './utils/feedback-utils.js'
import { OPTION_SETS, OPTIONS } from './utils/input-utils.js'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannelFromOptions,
} from './utils/channel-selection.js'
import { patchDestinations, patchSources } from './utils/patch-parameters.js'
import type { AuxChannelOpts, FxChannelOpts, MasterChannelOpts } from './utils/option-types.js'

type StateOpts = { state: boolean }

export type UiFeedbackSchemas = {
	mutemasterchannel: { type: 'boolean'; options: MasterChannelOpts & StateOpts }
	solomasterchannel: { type: 'boolean'; options: MasterChannelOpts & StateOpts }
	masterchannelmtkselection: { type: 'boolean'; options: MasterChannelOpts & StateOpts }
	dimmaster: { type: 'boolean'; options: StateOpts }
	muteauxchannel: { type: 'boolean'; options: AuxChannelOpts & StateOpts }
	postauxchannel: { type: 'boolean'; options: AuxChannelOpts & StateOpts }
	mutefxchannel: { type: 'boolean'; options: FxChannelOpts & StateOpts }
	postfxchannel: { type: 'boolean'; options: FxChannelOpts & StateOpts }
	mediaplayerstate: { type: 'boolean'; options: { state: number } }
	mediaplayershuffle: { type: 'boolean'; options: StateOpts }
	dualtrackrecordstate: { type: 'boolean'; options: { state: string } }
	mtkplayerstate: { type: 'boolean'; options: { state: number } }
	mtkrecordstate: { type: 'boolean'; options: { state: string } }
	mtksoundcheckstate: { type: 'boolean'; options: StateOpts }
	mutemutegroup: { type: 'boolean'; options: { group: number | string; state: boolean } }
	hwphantompower: { type: 'boolean'; options: { hwchannel: number; state: boolean } }
	automixgroupstate: { type: 'boolean'; options: { group: string; state: boolean } }
	patchingroutestate: { type: 'boolean'; options: { source: string; destination: string } }
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
			options: [...OPTION_SETS.masterChannel, getStateCheckbox('Muted')],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.connect(evt, c.mute$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		solomasterchannel: {
			type: 'boolean',
			name: 'Master channel: SOLO',
			description: 'If the specified master channel has SOLO active',
			defaultStyle: feedbackDefaultStyles.solo,
			options: [...OPTION_SETS.masterChannel, getStateCheckbox('Solo')],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-solo'
				store.connect(evt, c.solo$, streamId)
				return getFeedbackFromBinaryState(store, evt)
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
			options: [...OPTION_SETS.multiTrackMasterChannel, getStateCheckbox('Selected')],
			callback: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mtkrec'
				store.connect(evt, c.multiTrackSelected$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		dimmaster: {
			type: 'boolean',
			name: 'Master: DIM',
			description: 'If the master is dimmed',
			defaultStyle: feedbackDefaultStyles.dim,
			options: [getStateCheckbox('Dimmed')],
			callback: (evt) => {
				store.connect(evt, conn.master.dim$, 'masterdim')
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		muteauxchannel: {
			type: 'boolean',
			name: 'AUX bus channel: MUTE',
			description: 'If the specified channel on the AUX bus is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [...OPTION_SETS.auxChannel, getStateCheckbox('Muted')],
			callback: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.connect(evt, c.mute$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		postauxchannel: {
			type: 'boolean',
			name: 'AUX bus channel: POST',
			description: 'If the specified channel on the AUX bus has POST enabled',
			defaultStyle: feedbackDefaultStyles.post,
			options: [...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
			callback: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				store.connect(evt, c.post$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mutefxchannel: {
			type: 'boolean',
			name: 'FX bus channel: MUTE',
			description: 'If the specified channel on the FX bus is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [...OPTION_SETS.fxChannel, getStateCheckbox('Muted')],
			callback: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				store.connect(evt, c.mute$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		postfxchannel: {
			type: 'boolean',
			name: 'FX bus channel: POST',
			description: 'If the specified channel on the FX bus has POST enabled',
			defaultStyle: feedbackDefaultStyles.post,
			options: [...OPTION_SETS.fxChannel, getStateCheckbox('POST')],
			callback: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				store.connect(evt, c.post$, streamId)
				return getFeedbackFromBinaryState(store, evt)
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
				const state$ = conn.player.state$.pipe(
					map((s) => (s === state ? 1 : 0)),
					distinctUntilChanged(),
				)
				const streamId = 'playerstate' + state
				store.connect(evt, state$, streamId)
				return !!store.get(evt.id)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mediaplayershuffle: {
			type: 'boolean',
			name: 'Media Player: Shuffle',
			description: 'If the shuffle setting of the media player has the specified state',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(156, 22, 69),
			},
			options: [getStateCheckbox('Shuffle')],
			callback: (evt) => {
				store.connect(evt, conn.player.shuffle$, 'playershuffle')
				return getFeedbackFromBinaryState(store, evt)
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
						store.connect(evt, recorder.recording$, streamId)
						break
					case 'busy':
						store.connect(evt, recorder.busy$, streamId)
						break
				}
				return !!store.get(evt.id)
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
				const state$ = conn.recorderMultiTrack.state$.pipe(
					map((s) => (s === state ? 1 : 0)),
					distinctUntilChanged(),
				)
				const streamId = 'mtkstate' + state
				store.connect(evt, state$, streamId)
				return !!store.get(evt.id)
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
						store.connect(evt, recorder.recording$, streamId)
						break
					case 'busy':
						store.connect(evt, recorder.busy$, streamId)
						break
				}
				return !!store.get(evt.id)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mtksoundcheckstate: {
			type: 'boolean',
			name: 'Multitrack Recording: Soundcheck State',
			description: 'If soundcheck in the multitrack recorder has the specified state',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [getStateCheckbox('Active')],
			callback: (evt) => {
				store.connect(evt, conn.recorderMultiTrack.soundcheck$, 'mtksoundcheck')
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		mutemutegroup: {
			type: 'boolean',
			name: 'MUTE group/ALL/FX state',
			description: 'If the specified group is muted',
			defaultStyle: feedbackDefaultStyles.mute,
			options: [OPTIONS.muteGroupDropdown, getStateCheckbox('Muted')],
			callback: (evt) => {
				const groupId = evt.options.group as MuteGroupID
				const streamId = 'mgstate' + groupId
				const group = conn.muteGroup(groupId)
				store.connect(evt, group.state$, streamId)
				return getFeedbackFromBinaryState(store, evt)
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
			options: [OPTIONS.hwChannelNumberField, getStateCheckbox('Phantom Power enabled')],
			callback: (evt) => {
				const streamId = 'hw' + evt.options.hwchannel + 'phantom'
				const channel = conn.hw(evt.options.hwchannel)
				store.connect(evt, channel.phantom$, streamId)
				return getFeedbackFromBinaryState(store, evt)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},

		automixgroupstate: {
			type: 'boolean',
			name: 'Automix: Group State',
			description: 'If an automix group is enabled/disabled',
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
				getStateCheckbox('Group enabled'),
			],
			callback: (evt) => {
				const groupId = evt.options.group
				let group = conn.automix.groups.a
				if (groupId === 'b') {
					group = conn.automix.groups.b
				}
				const streamId = 'amixgroupstate' + groupId
				store.connect(evt, group.state$, streamId)
				return getFeedbackFromBinaryState(store, evt)
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

				const feedback$ = conn.store.state$.pipe(
					map((state) => state[destination] === source),
					distinctUntilChanged(),
				)

				const streamId = `patchroute-${source}-${destination}`
				store.connect(evt, feedback$, streamId)
				return !!store.get(evt.id)
			},
			unsubscribe: (evt) => store.unsubscribe(evt.id),
		},
	}
}
