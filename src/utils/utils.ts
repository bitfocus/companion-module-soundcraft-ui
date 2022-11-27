import { ChannelType } from 'soundcraft-ui-connection'
import { FADER_TYPES } from './input-utils'

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
