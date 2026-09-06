import {
	type ChannelType,
	MasterBus,
	AuxBus,
	FxBus,
	SoundcraftUI,
	AuxChannel,
	FxChannel,
	MasterChannel,
	MtxChannel,
	VolumeBus,
	vuValueToDB,
} from 'soundcraft-ui-connection'
import { auditTime, distinctUntilChanged, map, Observable } from 'rxjs'

import { type CompanionOptionValues } from '@companion-module/base'
import type { AuxChannelOpts, FxChannelOpts, MasterChannelOpts, MatrixChannelOpts, VuOpts } from './option-types.js'
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

/** Unique identifier for a master channel, used to group feedback subscriptions */
export function getMasterChannelId(options: MasterChannelOpts): string {
	return `master.${options.channelType}.${options.channel}`
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

/** Unique identifier for an AUX bus channel, used to group feedback subscriptions */
export function getAuxChannelId(options: AuxChannelOpts): string {
	return `aux.${options.bus}.${options.channelType}.${options.channel}`
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

/** Unique identifier for an FX bus channel, used to group feedback subscriptions */
export function getFxChannelId(options: FxChannelOpts): string {
	return `fx.${options.bus}.${options.channelType}.${options.channel}`
}

/** Matrix Channels */

export function getMatrixChannelFromOptions(options: MatrixChannelOpts, conn: SoundcraftUI): MtxChannel | undefined {
	const matrix = conn.mtx(options.bus)
	switch (options.channelType) {
		case 'a':
			return matrix.aux(options.channel)
		case 's':
			return matrix.sub(options.channel)
		case 'm':
			return matrix.master()
		default:
			return
	}
}

/** Unique identifier for a matrix source channel, used to group feedback subscriptions */
export function getMatrixChannelId(options: MatrixChannelOpts): string {
	// the master source has no channel index
	if (options.channelType === 'm') {
		return `mtx.${options.bus}.m`
	}
	return `mtx.${options.bus}.${options.channelType}.${options.channel}`
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

/** VU metering */

/** Stereo channel types (VU) that expose separate L/R values */
const VU_STEREO_TYPES = new Set(['f', 's', 'master'])

/** Unique identifier for a VU stream, used to group feedback subscriptions */
export function getVuChannelId(options: VuOpts): string {
	const { channelType, channel, point, side } = options
	if (channelType === 'master') {
		return `vu.master.${point}.${side}`
	}
	if (VU_STEREO_TYPES.has(channelType)) {
		return `vu.${channelType}.${channel}.${point}.${side}`
	}
	return `vu.${channelType}.${channel}.${point}`
}

/**
 * Observable of the VU meter level in dB (-80..0) for the given options.
 * Throttled to ~10 updates/sec; `vuValueToDB` already clamps to -80..0 and rounds to 0.1 dB.
 */
export function getVuValue$(conn: SoundcraftUI, options: VuOpts): Observable<number> {
	const { channelType, channel, point, side } = options
	const vu = conn.vuProcessor
	const isRight = side === 'right'

	const mono = (d: { vuPost: number; vuPostFader: number }): number => (point === 'post' ? d.vuPost : d.vuPostFader)
	const stereo = (d: { vuPostL: number; vuPostR: number; vuPostFaderL: number; vuPostFaderR: number }): number => {
		if (point === 'post') {
			return isRight ? d.vuPostR : d.vuPostL
		}
		return isRight ? d.vuPostFaderR : d.vuPostFaderL
	}

	let linear$: Observable<number>
	switch (channelType) {
		case 'l':
			linear$ = vu.line(channel).pipe(map(mono))
			break
		case 'p':
			linear$ = vu.player(channel).pipe(map(mono))
			break
		case 'a':
			linear$ = vu.aux(channel).pipe(map(mono))
			break
		case 'f':
			linear$ = vu.fx(channel).pipe(map(stereo))
			break
		case 's':
			linear$ = vu.sub(channel).pipe(map(stereo))
			break
		case 'master':
			linear$ = vu.master().pipe(map(stereo))
			break
		default:
		case 'i':
			linear$ = vu.input(channel).pipe(map(mono))
			break
	}

	return linear$.pipe(
		auditTime(100),
		map((linear) => vuValueToDB(linear)),
		distinctUntilChanged(),
	)
}
