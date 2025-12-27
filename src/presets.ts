import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import type { SoundcraftUI } from 'soundcraft-ui-connection'
import { ActionId } from './actions.js'

export async function createPresets(conn: SoundcraftUI): Promise<CompanionPresetDefinitions> {
	const presets: CompanionPresetDefinitions = {}

	console.log(conn)

	presets['m_input1_mute'] = {
		type: 'button',
		category: 'Master Channels',
		name: `Master Bus: Input 1 MUTE`,
		style: {
			text: `$(module:m_input1_name)`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: ActionId.MuteMasterChannel,
						options: {
							channelType: 'i',
							channel: 1,
							mute: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	return presets
}
