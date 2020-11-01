import InstanceSkel = require('../../../instance_skel');
import { CompanionFeedback, CompanionFeedbacks } from '../../../instance_skel_types';
import { UiConfig } from './config';
import { UiFeedbackState } from './state';
import {
  getBackgroundPicker,
  getForegroundPicker,
  getOptColorsForBinaryState,
  getStateCheckbox
} from './utils/feedback-utils';
import { OPTION_SETS } from './utils/input-utils';
import {
  getAuxChannelFromOptions,
  getFxChannelFromOptions,
  getMasterChannelFromOptions
} from './utils/channel-selection';
import { SoundcraftUI } from 'soundcraft-ui-connection';

type CompanionFeedbackWithCallback = CompanionFeedback &
  Required<Pick<CompanionFeedback, 'callback' | 'subscribe' | 'unsubscribe'>>;

export enum FeedbackType {
  MuteMasterChannel = 'mutemasterchannel',
  SoloMasterChannel = 'solomasterchannel',
  DimMaster = 'dimmaster',
  MuteAuxChannel = 'muteauxchannel',
  MuteFxChannel = 'mutefxchannel'
}

export function GetFeedbacksList(
  instance: InstanceSkel<UiConfig>,
  feedback: UiFeedbackState,
  conn: SoundcraftUI
): CompanionFeedbacks {
  const muteColorPickers = [
    getBackgroundPicker(instance.rgb(255, 0, 0)),
    getForegroundPicker(instance.rgb(255, 255, 255))
  ];

  const feedbacks: { [type in FeedbackType]: CompanionFeedbackWithCallback } = {
    [FeedbackType.MuteMasterChannel]: {
      label: 'Change colors from master channel MUTE state',
      description: 'If the specified target is muted, change color of the bank',
      options: [...muteColorPickers, ...OPTION_SETS.masterChannel, getStateCheckbox('Muted')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getMasterChannelFromOptions(evt.options, conn);
        feedback.connect(evt, c.mute$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.SoloMasterChannel]: {
      label: 'Change colors from master channel SOLO state',
      description: 'If the channel is soloed, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(255, 255, 0)),
        getForegroundPicker(instance.rgb(0, 0, 0)),
        ...OPTION_SETS.masterChannel,
        getStateCheckbox('Solo')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getMasterChannelFromOptions(evt.options, conn);
        feedback.connect(evt, c.solo$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.DimMaster]: {
      label: 'Change colors from master DIM state',
      description: 'If the master is dimmed, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(0, 150, 255)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
        getStateCheckbox('Dimmed')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => feedback.connect(evt, conn.master.dim$),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteAuxChannel]: {
      label: 'Change colors from AUX bus channel MUTE state',
      description: 'If the specified channel on the AUX bus is muted, change color of the bank',
      options: [...muteColorPickers, ...OPTION_SETS.auxChannel, getStateCheckbox('Muted')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getAuxChannelFromOptions(evt.options, conn);
        feedback.connect(evt, c.mute$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteFxChannel]: {
      label: 'Change colors from FX bus channel MUTE state',
      description: 'If the specified channel on the FX bus is muted, change color of the bank',
      options: [...muteColorPickers, ...OPTION_SETS.fxChannel, getStateCheckbox('Muted')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getFxChannelFromOptions(evt.options, conn);
        feedback.connect(evt, c.mute$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    }
  };

  return feedbacks;
}
