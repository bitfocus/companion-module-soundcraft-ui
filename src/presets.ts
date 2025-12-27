import { combineRgb, type CompanionPresetDefinition, type CompanionPresetDefinitions } from '@companion-module/base'
import { PlayerState, type SoundcraftUI } from 'soundcraft-ui-connection'
import { ActionId } from './actions.js'
import { feedbackDefaultStyles, FeedbackId } from './feedback.js'
import { firstValueFrom } from 'rxjs'

function makeMasterChannelMuteButton(
	channelType: string,
	channel: number,
	variablePart: string,
	namePart: string,
): CompanionPresetDefinition {
	return {
		type: 'button',
		category: 'Master Channels: MUTE',
		name: `Master Bus: ${namePart} MUTE`,
		style: {
			text: `MUTE\\n$(module:m_${variablePart}_name)`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MuteMasterChannel,
						options: {
							channelType,
							channel,
							mute: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.MuteMasterChannel,
				options: {
					channelType,
					channel,
					state: true,
				},
				style: feedbackDefaultStyles.mute,
			},
		],
	}
}

function makeMasterChannelSoloButton(
	channelType: string,
	channel: number,
	variablePart: string,
	namePart: string,
): CompanionPresetDefinition {
	return {
		type: 'button',
		category: 'Master Channels: SOLO',
		name: `Master Bus: ${namePart} SOLO`,
		style: {
			text: `SOLO\\n$(module:m_${variablePart}_name)`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.SoloMasterChannel,
						options: {
							channelType,
							channel,
							mute: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.SoloMasterChannel,
				options: {
					channelType,
					channel,
					state: true,
				},
				style: feedbackDefaultStyles.solo,
			},
		],
	}
}

function makeAuxChannelMuteButton(
	bus: number,
	channelType: string,
	channel: number,
	variablePart: string,
	namePart: string,
): CompanionPresetDefinition {
	return {
		type: 'button',
		category: `AUX Bus ${bus}`,
		name: `AUX Bus ${bus}: ${namePart} MUTE`,
		style: {
			text: `AUX ${bus}\\nMUTE\\n$(module:m_${variablePart}_name)`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MuteAuxChannel,
						options: {
							bus,
							channelType,
							channel,
							mute: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.MuteAuxChannel,
				options: {
					bus,
					channelType,
					channel,
					state: true,
				},
				style: feedbackDefaultStyles.mute,
			},
		],
	}
}

function makeAuxChannelPrePostButton(
	bus: number,
	channelType: string,
	channel: number,
	variablePart: string,
	namePart: string,
): CompanionPresetDefinition {
	return {
		type: 'button',
		category: `AUX Bus ${bus}`,
		name: `AUX Bus ${bus}: ${namePart} PRE/POST`,
		style: {
			text: `AUX ${bus}\\nPRE\\n$(module:m_${variablePart}_name)`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.SetAuxChannelPost,
						options: {
							bus,
							channelType,
							channel,
							post: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.PostAuxChannel,
				options: {
					bus,
					channelType,
					channel,
					state: true,
				},
				style: {
					...feedbackDefaultStyles.post,
					text: `AUX ${bus}\\nPOST\\n$(module:m_${variablePart}_name)`,
				},
			},
		],
	}
}

export async function createPresets(conn: SoundcraftUI): Promise<CompanionPresetDefinitions> {
	const presets: CompanionPresetDefinitions = {}

	const capabilities = await firstValueFrom(conn.deviceInfo.capabilities$)

	/****** Master Channels ******/
	for (let i = 1; i <= capabilities.input; i++) {
		presets[`m_input${i}_mute`] = makeMasterChannelMuteButton('i', i, `input${i}`, `Input ${i}`)
		presets[`m_input${i}_solo`] = makeMasterChannelSoloButton('i', i, `input${i}`, `Input ${i}`)
	}
	for (let i = 1; i <= capabilities.line; i++) {
		presets[`m_line${i}_mute`] = makeMasterChannelMuteButton('l', i, `line${i}`, `Line ${i}`)
		presets[`m_line${i}_solo`] = makeMasterChannelSoloButton('l', i, `line${i}`, `Line ${i}`)
	}
	for (let i = 1; i <= capabilities.player; i++) {
		presets[`m_player${i}_mute`] = makeMasterChannelMuteButton('p', i, `player${i}`, `Player ${i}`)
		presets[`m_player${i}_solo`] = makeMasterChannelSoloButton('p', i, `player${i}`, `Player ${i}`)
	}
	for (let i = 1; i <= capabilities.fx; i++) {
		presets[`m_fx${i}_mute`] = makeMasterChannelMuteButton('f', i, `fx${i}`, `FX ${i}`)
		presets[`m_fx${i}_solo`] = makeMasterChannelSoloButton('f', i, `fx${i}`, `FX ${i}`)
	}
	for (let i = 1; i <= capabilities.sub; i++) {
		presets[`m_sub${i}_mute`] = makeMasterChannelMuteButton('s', i, `sub${i}`, `Subgroup ${i}`)
		presets[`m_sub${i}_solo`] = makeMasterChannelSoloButton('s', i, `sub${i}`, `Subgroup ${i}`)
	}
	for (let ai = 1; ai <= capabilities.aux; ai++) {
		presets[`m_aux${ai}_mute`] = makeMasterChannelMuteButton('a', ai, `aux${ai}`, `AUX ${ai}`)
		presets[`m_aux${ai}_solo`] = makeMasterChannelSoloButton('a', ai, `aux${ai}`, `AUX ${ai}`)

		for (let i = 1; i <= capabilities.input; i++) {
			presets[`aux${ai}_input${i}_mute`] = makeAuxChannelMuteButton(ai, 'i', i, `input${i}`, `Input ${i}`)
			presets[`aux${ai}_input${i}_prepost`] = makeAuxChannelPrePostButton(ai, 'i', i, `input${i}`, `Input ${i}`)
		}
		for (let i = 1; i <= capabilities.line; i++) {
			presets[`aux${ai}_line${i}_mute`] = makeAuxChannelMuteButton(ai, 'l', i, `line${i}`, `Line ${i}`)
			presets[`aux${ai}_line${i}_prepost`] = makeAuxChannelPrePostButton(ai, 'l', i, `line${i}`, `Line ${i}`)
		}
		for (let i = 1; i <= capabilities.player; i++) {
			presets[`aux${ai}_player${i}_mute`] = makeAuxChannelMuteButton(ai, 'p', i, `player${i}`, `Player ${i}`)
			presets[`aux${ai}_player${i}_prepost`] = makeAuxChannelPrePostButton(ai, 'p', i, `player${i}`, `Player ${i}`)
		}
		for (let i = 1; i <= capabilities.fx; i++) {
			presets[`aux${ai}_fx${i}_mute`] = makeAuxChannelMuteButton(ai, 'f', i, `fx${i}`, `FX ${i}`)
			presets[`aux${ai}_fx${i}_prepost`] = makeAuxChannelPrePostButton(ai, 'f', i, `fx${i}`, `FX ${i}`)
		}
	}
	for (let i = 1; i <= capabilities.vca; i++) {
		presets[`m_vca${i}_mute`] = makeMasterChannelMuteButton('v', i, `vca${i}`, `VCA ${i}`)
		presets[`m_vca${i}_solo`] = makeMasterChannelSoloButton('v', i, `vca${i}`, `VCA ${i}`)
	}

	/****** Media Player ******/
	presets['player_elapsed'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Elapsed Time`,
		style: {
			text: `Elapsed\\n$(module:player_elapsed)`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [],
	}

	presets['player_remaining'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Remaining Time`,
		style: {
			text: `Remaining\\n$(module:player_remaining)`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [],
	}

	presets['player_previous'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Previous Track`,
		style: {
			text: `|<<`,
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MediaPrev,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['player_next'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Next Track`,
		style: {
			text: `>>|`,
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MediaNext,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['player_playstop'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Play/Stop`,
		style: {
			text: 'Play/\\nStop',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MediaPlay,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.MediaPlayerState,
				options: {
					state: PlayerState.Playing,
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
			{
				feedbackId: FeedbackId.MediaPlayerState,
				options: {
					state: PlayerState.Stopped,
				},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
			},
		],
	}

	presets['player_stop'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Stop`,
		style: {
			text: 'STOP',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MediaStop,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.MediaPlayerState,
				options: {
					state: PlayerState.Playing,
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}

	presets['player_pause'] = {
		type: 'button',
		category: 'Media Player',
		name: `Player: Pause`,
		style: {
			text: 'Pause',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MediaPause,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.MediaPlayerState,
				options: {
					state: PlayerState.Paused,
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 153, 51),
				},
			},
		],
	}

	/****** Master DIM ******/
	presets['master_dim'] = {
		type: 'button',
		category: 'Master',
		name: `Master: DIM`,
		style: {
			text: `DIM Master`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.DimMaster,
						options: { dim: 2 },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.DimMaster,
				options: {
					state: true,
				},
				style: feedbackDefaultStyles.dim,
			},
		],
	}

	return presets
}
