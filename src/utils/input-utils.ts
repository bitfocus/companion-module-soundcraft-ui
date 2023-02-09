import {
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	DropdownChoice,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import { ChannelType, Easings } from 'soundcraft-ui-connection'

/**
 * This file contains generic helpers for action/feedback creation
 * like reusable dropdown choices and pre-defined options
 */

/**
 * All possible fader types as dropdown choices
 */
export const FADER_TYPES: { [key in ChannelType]: DropdownChoice } = {
	i: { id: 'i', label: 'Input' },
	l: { id: 'l', label: 'Line Input' },
	p: { id: 'p', label: 'Player' },
	f: { id: 'f', label: 'FX' },
	s: { id: 's', label: 'Sub Group' },
	a: { id: 'a', label: 'AUX Master' },
	v: { id: 'v', label: 'VCA' },
}

/**
 * Commonly used choice groups for dropdowns
 */
export const CHOICES = {
	mute: {
		choices: [
			{ id: 2, label: 'Toggle' },
			{ id: 1, label: 'Mute' },
			{ id: 0, label: 'Unmute' },
		],
		default: 2,
	},

	onofftoggleDropdown: {
		choices: [
			{ id: 2, label: 'Toggle' },
			{ id: 1, label: 'On' },
			{ id: 0, label: 'Off' },
		],
		default: 2,
	},

	onoffDropdown: {
		choices: [
			{ id: 1, label: 'On' },
			{ id: 0, label: 'Off' },
		],
		default: 1,
	},

	masterChannelTypes: {
		choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.f, FADER_TYPES.s, FADER_TYPES.a, FADER_TYPES.v],
		default: 'i',
	},

	masterDelayableChannelTypes: {
		choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.a],
		default: 'i',
	},

	auxChannelTypes: {
		choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.f],
		default: 'i',
	},

	fxChannelTypes: {
		choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.s],
		default: 'i',
	},
}

/**
 * Commonly used option fields
 */
export const OPTIONS = {
	masterChannelTypeDropdown: {
		type: 'dropdown',
		label: 'Channel Type',
		id: 'channelType',
		...CHOICES.masterChannelTypes,
	} satisfies CompanionInputFieldDropdown,
	auxChannelTypeDropdown: {
		type: 'dropdown',
		label: 'Channel Type',
		id: 'channelType',
		...CHOICES.auxChannelTypes,
	} satisfies CompanionInputFieldDropdown,
	fxChannelTypeDropdown: {
		type: 'dropdown',
		label: 'Channel Type',
		id: 'channelType',
		...CHOICES.fxChannelTypes,
	} satisfies CompanionInputFieldDropdown,
	busNumberField: {
		type: 'number',
		label: 'Bus number',
		id: 'bus',
		min: 1,
		max: 10,
		default: 1,
	} satisfies CompanionInputFieldNumber,
	channelNumberField: {
		type: 'number',
		label: 'Channel number',
		id: 'channel',
		min: 1,
		max: 24,
		default: 1,
	} satisfies CompanionInputFieldNumber,
	hwChannelNumberField: {
		type: 'number',
		label: 'HW Channel number',
		id: 'hwchannel',
		min: 1,
		max: 20,
		default: 1,
	} satisfies CompanionInputFieldNumber,
	muteDropdown: {
		type: 'dropdown',
		label: 'Mute',
		id: 'mute',
		...CHOICES.mute,
	} satisfies CompanionInputFieldDropdown,
	muteGroupDropdown: {
		type: 'dropdown',
		label: 'Group',
		id: 'group',
		choices: [
			{ id: 1, label: 'MUTE Group 1' },
			{ id: 2, label: 'MUTE Group 2' },
			{ id: 3, label: 'MUTE Group 3' },
			{ id: 4, label: 'MUTE Group 4' },
			{ id: 5, label: 'MUTE Group 5' },
			{ id: 6, label: 'MUTE Group 6' },
			{ id: 'all', label: 'MUTE ALL' },
			{ id: 'fx', label: 'MUTE FX' },
		],
		default: 1,
	} satisfies CompanionInputFieldDropdown,
	soloDropdown: {
		type: 'dropdown',
		label: 'Solo',
		id: 'solo',
		...CHOICES.onofftoggleDropdown,
	} satisfies CompanionInputFieldDropdown,
	faderValuesSlider: {
		type: 'number',
		label: 'Fader Level dB (-100 = -∞)',
		id: 'value',
		range: true,
		required: true,
		default: 0,
		step: 0.1,
		min: -100,
		max: 10,
	} satisfies CompanionInputFieldNumber,
	prepostDropdown: {
		type: 'dropdown',
		label: 'PRE/POST',
		id: 'post',
		choices: [
			{ id: 0, label: 'PRE' },
			{ id: 1, label: 'POST' },
			{ id: 2, label: 'Toggle' },
		],
		default: 2,
	} satisfies CompanionInputFieldDropdown,
	easingsDropdown: {
		type: 'dropdown',
		label: 'Easing',
		id: 'easing',
		choices: [
			{ id: Easings.Linear, label: 'Linear / None' },
			{ id: Easings.EaseIn, label: 'Ease In' },
			{ id: Easings.EaseOut, label: 'Ease Out' },
			{ id: Easings.EaseInOut, label: 'Ease In Out' },
		],
		default: Easings.Linear,
	} satisfies CompanionInputFieldDropdown,
	fadeTimeField: {
		type: 'number',
		label: 'Fade time (ms)',
		id: 'fadeTime',
		min: 100,
		max: 60000,
		default: 2000,
	} satisfies CompanionInputFieldNumber,
	faderChangeField: {
		type: 'number',
		label: 'Change value (dB)',
		id: 'value',
		min: -100,
		max: 100,
		default: 3,
	} satisfies CompanionInputFieldNumber,
	volumeBusesDropdown: {
		type: 'dropdown',
		label: 'Bus',
		id: 'bus',
		choices: [
			{ id: 'solo', label: 'SOLO' },
			{ id: 'hp1', label: 'Headphone 1' },
			{ id: 'hp2', label: 'Headphone 2' },
		],
		default: 'solo',
	} satisfies CompanionInputFieldDropdown,
	masterDelayDropdown: {
		type: 'dropdown',
		label: 'Delay side',
		id: 'side',
		choices: [
			{ id: 'both', label: 'Left and right' },
			{ id: 'left', label: 'Left' },
			{ id: 'right', label: 'Right' },
		],
		default: 'both',
	} satisfies CompanionInputFieldDropdown,
	delayTimeField: (min: number, max: number): CompanionInputFieldNumber => {
		return {
			type: 'number',
			label: 'Delay time (ms)',
			id: 'time',
			min,
			max,
			default: 0,
		}
	},
}

/**
 * Commonly used combinations of option fields
 */
export const OPTION_SETS = {
	masterChannel: [OPTIONS.masterChannelTypeDropdown, OPTIONS.channelNumberField],
	auxChannel: [OPTIONS.busNumberField, OPTIONS.auxChannelTypeDropdown, OPTIONS.channelNumberField],
	fxChannel: [OPTIONS.busNumberField, OPTIONS.fxChannelTypeDropdown, OPTIONS.channelNumberField],
	fadeTransition: [OPTIONS.faderValuesSlider, OPTIONS.fadeTimeField, OPTIONS.easingsDropdown],
	delayableMasterChannel: (min: number, max: number): SomeCompanionActionInputField[] => [
		{
			type: 'dropdown',
			label: 'Channel Type',
			id: 'channelType',
			...CHOICES.masterDelayableChannelTypes,
		},
		OPTIONS.channelNumberField,
		OPTIONS.delayTimeField(min, max),
	],
}
