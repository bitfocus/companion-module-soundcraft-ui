import InstanceSkel = require('../../../instance_skel');
import { CompanionFeedback, CompanionFeedbacks } from '../../../instance_skel_types';
import { UiConfig } from './config';
import { timer } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { UiFeedbackState } from './state';
import { getBackgroundPicker, getForegroundPicker, getOptColors } from './utils/feedback-utils';

const muteToggleSignal$ = timer(1000, 1000).pipe(
  map(i => i % 2),
  share()
);

type CompanionFeedbackWithCallback = CompanionFeedback &
  Required<Pick<CompanionFeedback, 'callback' | 'subscribe' | 'unsubscribe'>>;

export enum FeedbackType {
  MuteMasterFader = 'mutemasterfader',
  /*
  SoloMasterFader = 'solomasterfader'
  MuteSendFader = 'mutesendfader',
  PostSendFader = 'postsendfader',
  DimMaster = 'dimmaster'
  */
}

export function GetFeedbacksList(instance: InstanceSkel<UiConfig>, feedback: UiFeedbackState): CompanionFeedbacks {
  const feedbacks: { [type in FeedbackType]: CompanionFeedbackWithCallback } = {
    [FeedbackType.MuteMasterFader]: {
      label: 'Change colors from mute state',
      description: 'If the specified target is muted, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(255, 0, 0)),
        getForegroundPicker(instance.rgb(0, 0, 0)),
        {
          id: 'channel',
          type: 'dropdown',
          label: 'Target',
          choices: [
            { label: 'foo', id: '0' },
            { label: 'bar', id: '1' }
          ],
          default: '0'
        },
        {
          id: 'state',
          type: 'checkbox',
          label: 'Muted',
          default: true
        }
      ],
      callback: evt => {
        if (evt.options.state === (feedback.get(evt.id) === 1)) {  
            return getOptColors(evt);
        } else {
            return {};
        }
      },
      subscribe: evt => feedback.connect(evt, muteToggleSignal$),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    }
  };

  return feedbacks;
}
