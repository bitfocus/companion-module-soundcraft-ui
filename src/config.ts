import { type SomeCompanionConfigField, Regex } from '@companion-module/base'

export interface UiConfig {
	host: string
	enableFaderLevelVars?: boolean
	enablePanVars?: boolean
}

export const instanceConfigFields: SomeCompanionConfigField[] = [
	{
		type: 'textinput',
		id: 'host',
		label: 'Target IP',
		width: 12,
		regex: Regex.IP,
		required: true,
	},
	{
		type: 'static-text',
		id: 'info',
		width: 12,
		label: 'IP address change',
		value:
			'After changing the IP address of the mixer, it might be necessary to disable and re-enable the module or to restart Companion.',
	},
	{
		type: 'checkbox',
		id: 'enableFaderLevelVars',
		label: 'Enable Fader Level variables',
		width: 12,
		default: false,
	},
	{
		type: 'checkbox',
		id: 'enablePanVars',
		label: 'Enable PAN variables',
		width: 12,
		default: false,
	},
]
