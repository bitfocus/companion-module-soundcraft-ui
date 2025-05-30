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

export function convertPanToLinearValue(panValue: number): number {
	return (panValue + 100) / 200
}

export function convertPanOffsetToLinearOffset(panOffset: number): number {
	return panOffset / 200
}

/** Create array with specified amount of items, created by the transform callback. */
export function createRangeArray<T>(amount: number, transform: (i: number) => T): T[] {
	return new Array(Math.max(amount, 1)).fill(undefined).map((_, i) => transform(i))
}
