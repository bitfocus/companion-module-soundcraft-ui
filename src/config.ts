import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface UiConfig {
	host?: string
}

export const instanceConfigFields: SomeCompanionConfigField[] = [
	{
		type: 'textinput',
		id: 'host',
		label: 'Target IP',
		width: 12,
		regex: Regex.IP,
	},
	{
		type: 'static-text',
		id: 'info',
		width: 12,
		label: 'IP address change',
		value:
			'After changing the IP address of the mixer, it might be necessary to disable and re-enable the module or to restart Companion.',
	},
]
