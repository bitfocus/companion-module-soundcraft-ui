import {
	ChannelType,
	MasterBus,
	AuxBus,
	FxBus,
	SoundcraftUI,
	AuxChannel,
	FxChannel,
	MasterChannel,
	MuteGroupID,
	VolumeBus,
} from 'soundcraft-ui-connection'
import { CompanionOptionValues } from '@companion-module/base'
import { optionToChannelType } from './utils'

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

export function getMasterChannelFromOptions(options: CompanionOptionValues, conn: SoundcraftUI): MasterChannel {
	const channelType = optionToChannelType(options.channelType)
	const channel = Number(options.channel)
	return getMasterChannel(conn.master, channelType, channel)
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

export function getAuxChannelFromOptions(options: CompanionOptionValues, conn: SoundcraftUI): AuxChannel {
	const bus = Number(options.bus)
	const channel = Number(options.channel)
	const channelType = optionToChannelType(options.channelType)
	return getAuxChannel(conn.aux(bus), channelType, channel)
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

export function getFxChannelFromOptions(options: CompanionOptionValues, conn: SoundcraftUI): FxChannel {
	const bus = Number(options.bus)
	const channel = Number(options.channel)
	const channelType = optionToChannelType(options.channelType)
	return getFxChannel(conn.fx(bus), channelType, channel)
}

export function getMuteGroupIDFromOptions(options: CompanionOptionValues): MuteGroupID {
	const group = options.group
	if (group === 'all' || group === 'fx') {
		return group
	}

	const groupAsNum = Number(group)
	if (groupAsNum) {
		return groupAsNum
	}

	return 'all'
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
