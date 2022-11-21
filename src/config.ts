import { Regex, SomeCompanionConfigField } from '@companion-module/base';

export interface UiConfig {
  host?: string;
}

export const instanceConfigFields: SomeCompanionConfigField[] = [
  {
    type: 'textinput',
    id: 'host',
    label: 'Target IP',
    width: 12,
    regex: Regex.IP
  }
];
