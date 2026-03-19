import {
	type ChannelType,
	MasterBus,
	AuxBus,
	FxBus,
	SoundcraftUI,
	AuxChannel,
	FxChannel,
	MasterChannel,
	VolumeBus,
} from 'soundcraft-ui-connection'

import { type CompanionOptionValues } from '@companion-module/base'
import type { AuxChannelOpts, FxChannelOpts, MasterChannelOpts } from './option-types.js'
import { optionToChannelType } from './utils.js'

/** Master Channels */

export function getMasterChannel(source: MasterBus, type: ChannelType, channel: number): MasterChannel {
	switch (type) {
		case 'l':
			return source.line(channel)
		case 'p':
			return source.player(channel)
		case 'a':
			return source.aux(channel)
		case 's':
			return source.sub(channel)
		case 'v':
			return source.vca(channel)
		case 'f':
			return source.fx(channel)
		default:
		case 'i':
			return source.input(channel)
	}
}

export function getMasterChannelFromOptions(options: MasterChannelOpts, conn: SoundcraftUI): MasterChannel {
	const channelType = optionToChannelType(options.channelType)
	return getMasterChannel(conn.master, channelType, options.channel)
}

/** AUX Channels */

export function getAuxChannel(source: AuxBus, type: ChannelType, channel: number): AuxChannel {
	switch (type) {
		case 'l':
			return source.line(channel)
		case 'p':
			return source.player(channel)
		case 'f':
			return source.fx(channel)
		default:
		case 'i':
			return source.input(channel)
	}
}

export function getAuxChannelFromOptions(options: AuxChannelOpts, conn: SoundcraftUI): AuxChannel {
	const channelType = optionToChannelType(options.channelType)
	return getAuxChannel(conn.aux(options.bus), channelType, options.channel)
}

/** FX Channels */

export function getFxChannel(source: FxBus, type: ChannelType, channel: number): FxChannel {
	switch (type) {
		case 'l':
			return source.line(channel)
		case 'p':
			return source.player(channel)
		case 's':
			return source.sub(channel)
		default:
		case 'i':
			return source.input(channel)
	}
}

export function getFxChannelFromOptions(options: FxChannelOpts, conn: SoundcraftUI): FxChannel {
	const channelType = optionToChannelType(options.channelType)
	return getFxChannel(conn.fx(options.bus), channelType, options.channel)
}

export function getVolumeBusFromOptions(options: CompanionOptionValues, conn: SoundcraftUI): VolumeBus | undefined {
	switch (options.bus) {
		case 'solo':
			return conn.volume.solo
		case 'hp1':
			return conn.volume.headphone(1)
		case 'hp2':
			return conn.volume.headphone(2)
		default:
			return
	}
}
