import {
	type CompanionFeedbackDefinitions,
	type CompanionFeedbackButtonStyleResult,
	combineRgb,
} from '@companion-module/base'
import { MtkState, PlayerState, SoundcraftUI } from 'soundcraft-ui-connection'
import { distinctUntilChanged, map } from 'rxjs'

import { UiFeedbackState } from './state.js'
import { getFeedbackFromBinaryState, getStateCheckbox } from './utils/feedback-utils.js'
import { OPTION_SETS, OPTIONS } from './utils/input-utils.js'
import {
	getAuxChannelFromOptions,
	getFxChannelFromOptions,
	getMasterChannelFromOptions,
	getMuteGroupIDFromOptions,
} from './utils/channel-selection.js'

export enum FeedbackId {
	MuteMasterChannel = 'mutemasterchannel',
	SoloMasterChannel = 'solomasterchannel',
	MasterChannelMTKSelection = 'masterchannelmtkselection',
	DimMaster = 'dimmaster',
	MuteAuxChannel = 'muteauxchannel',
	PostAuxChannel = 'postauxchannel',
	MuteFxChannel = 'mutefxchannel',
	PostFxChannel = 'postfxchannel',
	MediaPlayerState = 'mediaplayerstate',
	MediaPlayerShuffle = 'mediaplayershuffle',
	DTRecordState = 'dualtrackrecordstate',
	MTKPlayerState = 'mtkplayerstate',
	MTKRecordState = 'mtkrecordstate',
	MTKSoundcheckState = 'mtksoundcheckstate',
	MuteMuteGroup = 'mutemutegroup',
	HwPhantomPower = 'hwphantompower',
	AutomixGroupState = 'automixgroupstate',
}

const defaultStyles: { [key: string]: CompanionFeedbackButtonStyleResult } = {
	mute: {
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(255, 0, 0),
	},
	post: {
		bgcolor: combineRgb(0, 255, 0),
		color: combineRgb(255, 255, 255),
	},
}

export function GetFeedbacksList(feedback: UiFeedbackState, conn: SoundcraftUI): CompanionFeedbackDefinitions {
	return {
		[FeedbackId.MuteMasterChannel]: {
			type: 'boolean',
			name: 'Master channel: MUTE',
			description: 'If the specified master channel is muted',
			defaultStyle: defaultStyles.mute,
			options: [...OPTION_SETS.masterChannel, getStateCheckbox('Muted')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				feedback.connect(evt, c.mute$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.SoloMasterChannel]: {
			type: 'boolean',
			name: 'Master channel: SOLO',
			description: 'If the specified master channel has SOLO active',
			defaultStyle: defaultStyles.post,
			options: [...OPTION_SETS.masterChannel, getStateCheckbox('Solo')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-solo'
				feedback.connect(evt, c.solo$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MasterChannelMTKSelection]: {
			type: 'boolean',
			name: 'Master channel: Multitrack Selection State',
			description: 'If the specified master channel is selected for multitrack recording',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(153, 153, 0),
			},
			options: [...OPTION_SETS.multiTrackMasterChannel, getStateCheckbox('Selected')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getMasterChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mtkrec'
				feedback.connect(evt, c.multiTrackSelected$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.DimMaster]: {
			type: 'boolean',
			name: 'Master: DIM',
			description: 'If the master is dimmed',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 150, 255),
			},
			options: [getStateCheckbox('Dimmed')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => feedback.connect(evt, conn.master.dim$, 'masterdim'),
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MuteAuxChannel]: {
			type: 'boolean',
			name: 'AUX bus channel: MUTE',
			description: 'If the specified channel on the AUX bus is muted',
			defaultStyle: defaultStyles.mute,
			options: [...OPTION_SETS.auxChannel, getStateCheckbox('Muted')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				feedback.connect(evt, c.mute$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.PostAuxChannel]: {
			type: 'boolean',
			name: 'AUX bus channel: POST',
			description: 'If the specified channel on the AUX bus has POST enabled',
			defaultStyle: defaultStyles.post,
			options: [...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getAuxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				feedback.connect(evt, c.post$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MuteFxChannel]: {
			type: 'boolean',
			name: 'FX bus channel: MUTE',
			description: 'If the specified channel on the FX bus is muted',
			defaultStyle: defaultStyles.mute,
			options: [...OPTION_SETS.fxChannel, getStateCheckbox('Muted')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-mute'
				feedback.connect(evt, c.mute$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.PostFxChannel]: {
			type: 'boolean',
			name: 'FX bus channel: POST',
			description: 'If the specified channel on the FX bus has POST enabled',
			defaultStyle: defaultStyles.post,
			options: [...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const c = getFxChannelFromOptions(evt.options, conn)
				const streamId = c.fullChannelId + '-post'
				feedback.connect(evt, c.post$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MediaPlayerState]: {
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
				},
			],
			callback: (evt) => !!feedback.get(evt.id),
			subscribe: (evt) => {
				const state = Number(evt.options.state)
				const state$ = conn.player.state$.pipe(
					map((s) => (s === state ? 1 : 0)),
					distinctUntilChanged()
				)
				const streamId = 'playerstate' + state
				feedback.connect(evt, state$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MediaPlayerShuffle]: {
			type: 'boolean',
			name: 'Media Player: Shuffle',
			description: 'If the shuffle setting of the media player has the specified state',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(156, 22, 69),
			},
			options: [getStateCheckbox('Shuffle')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => feedback.connect(evt, conn.player.shuffle$, 'playershuffle'),
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.DTRecordState]: {
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
				},
			],
			callback: (evt) => !!feedback.get(evt.id),
			subscribe: (evt) => {
				const recorder = conn.recorderDualTrack
				switch (evt.options.state) {
					case 'rec':
						return feedback.connect(evt, recorder.recording$, 'dtrec-rec')
					case 'busy':
						return feedback.connect(evt, recorder.busy$, 'dtrec-busy')
				}
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MTKPlayerState]: {
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
				},
			],
			callback: (evt) => !!feedback.get(evt.id),
			subscribe: (evt) => {
				const state = Number(evt.options.state)
				const state$ = conn.recorderMultiTrack.state$.pipe(
					map((s) => (s === state ? 1 : 0)),
					distinctUntilChanged()
				)
				const streamId = 'mtkstate' + state
				feedback.connect(evt, state$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MTKRecordState]: {
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
				},
			],
			callback: (evt) => !!feedback.get(evt.id),
			subscribe: (evt) => {
				const recorder = conn.recorderMultiTrack
				switch (evt.options.state) {
					case 'rec':
						return feedback.connect(evt, recorder.recording$, 'mtk-rec')
					case 'busy':
						return feedback.connect(evt, recorder.busy$, 'mtk-busy')
				}
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MTKSoundcheckState]: {
			type: 'boolean',
			name: 'Multitrack Recording: Soundcheck State',
			description: 'If soundcheck in the multitrack recorder has the specified state',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [getStateCheckbox('Active')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => feedback.connect(evt, conn.recorderMultiTrack.soundcheck$, 'mtksoundcheck'),
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.MuteMuteGroup]: {
			type: 'boolean',
			name: 'MUTE group/ALL/FX state',
			description: 'If the specified group is muted',
			defaultStyle: defaultStyles.mute,
			options: [OPTIONS.muteGroupDropdown, getStateCheckbox('Muted')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const groupId = getMuteGroupIDFromOptions(evt.options)
				if (groupId === -1) {
					return
				}
				const group = conn.muteGroup(groupId)

				const streamId = 'mgstate' + groupId
				feedback.connect(evt, group.state$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.HwPhantomPower]: {
			type: 'boolean',
			name: 'HW Channel: Phantom power',
			description: 'If Phantom Power is enabled for an input',
			defaultStyle: {
				bgcolor: combineRgb(51, 102, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [OPTIONS.hwChannelNumberField, getStateCheckbox('Phantom Power enabled')],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const channelNo = Number(evt.options.hwchannel)
				const channel = conn.hw(channelNo)
				const streamId = 'hw' + channelNo + 'phantom'
				feedback.connect(evt, channel.phantom$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},

		[FeedbackId.AutomixGroupState]: {
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
				},
				getStateCheckbox('Group enabled'),
			],
			callback: (evt) => getFeedbackFromBinaryState(feedback, evt),
			subscribe: (evt) => {
				const groupId = evt.options.group

				let group = conn.automix.groups.a
				if (groupId === 'b') {
					group = conn.automix.groups.b
				}
				const streamId = 'amixgroupstate' + groupId
				feedback.connect(evt, group.state$, streamId)
			},
			unsubscribe: (evt) => feedback.unsubscribe(evt.id),
		},
	}
}
