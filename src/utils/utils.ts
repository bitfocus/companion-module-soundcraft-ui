import { type ChannelType } from 'soundcraft-ui-connection'

import { FADER_TYPES } from './input-utils.js'

export function intToBool(value: number): boolean {
	return value === 1
}

export function stringToInt(value: string): number {
	return parseInt(value, 10)
}

export function binaryStringToBool(value: string): boolean {
	return intToBool(stringToInt(value))
}

export function isValidChannelType(input: string): input is ChannelType {
	return !!FADER_TYPES[input as ChannelType]
}

export function optionToChannelType(input: unknown): ChannelType {
	if (typeof input === 'string' && isValidChannelType(input)) {
		return input
	} else {
		return 'i'
	}
}

/** Map -Infinity to -100 for fader level representation */
export function mapInfinityToNumber(value: number): number {
	return value === Number.NEGATIVE_INFINITY ? -100 : value
}

/** Convert internal 0..1 value to percent range (0..100) */
export function convertLinearValueToPercent(linearValue: number): number {
	return Math.round(linearValue * 100)
}

/** Convert PAN value 0..1 to string representation (L 100 .. C .. R 100) */
/*export function convertPanLinearValueToString(value: number): string {
	if (value === 0) {
		return 'L 100'
	} else if (value === 1) {
		return 'R 100'
	} else if (value === 0.5) {
		return 'C'
	} else if (value > 0.5) {
		const right = Math.round((value - 0.5) * 200)
		return `R ${right}`
	} else {
		const left = Math.round((0.5 - value) * 200)
		return `L ${left}`
	}
}*/

/** Convert PAN value -100..0..100 to internal range 0..1 */
export function convertPanToLinearValue(panValue: number): number {
	return (panValue + 100) / 200
}

/** Convert internal 0..1 value to PAN range -100..0..100 */
export function convertLinearValueToPan(linearValue: number): number {
	return Math.round(linearValue * 200 - 100)
}

export function convertPanOffsetToLinearOffset(panOffset: number): number {
	return panOffset / 200
}

/** Create array with specified amount of items, created by the transform callback. */
export function createRangeArray<T>(amount: number, transform: (i: number) => T): T[] {
	return new Array(Math.max(amount, 1)).fill(undefined).map((_, i) => transform(i))
}
