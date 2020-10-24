import InstanceSkel = require('../../../instance_skel')
import { SomeCompanionConfigField } from '../../../instance_skel_types'

export interface UiConfig {
  host?: string
}

export function GetConfigFields(self: InstanceSkel<UiConfig>): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Target IP',
      width: 12,
      regex: self.REGEX_IP
    }
  ]
}
