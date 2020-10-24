import InstanceSkel = require('../../../instance_skel')
import { CompanionAction, CompanionActions } from '../../../instance_skel_types'
import { UiConfig } from './config';

export enum ActionId {
  Mute = 'mute'
}


type CompanionActionWithCallback = CompanionAction &
  Required<Pick<CompanionAction, 'callback'>>

export function GetActionsList(self: InstanceSkel<UiConfig>): CompanionActions {

  console.log(self);
  const actions: { [id in ActionId]: CompanionActionWithCallback } = {
    [ActionId.Mute]: {
      label: 'Set mute',
      options: [
        {
          type: 'dropdown',
          label: 'Target',
          id: 'target',
          choices: [
            { id: 1, label: 'On' },
            { id: 0, label: 'Off' }
          ],
          default: 1      
        },
      ],
      callback: action => {
        console.log('callback action', action);
      },
      subscribe: (evt): void => {
        console.log('subscribe action', evt);
      }
    }
  }

  return actions;
}
