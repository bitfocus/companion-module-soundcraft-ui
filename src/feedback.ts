import InstanceSkel = require('../../../instance_skel');
import { CompanionFeedback, CompanionFeedbacks } from '../../../instance_skel_types';
import { UiConfig } from './config';
import { UiFeedbackState } from './state';
import { getBackgroundPicker, getForegroundPicker, getOptColorsForBinaryState, getStateCheckbox } from './utils/feedback-utils';
import { OPTIONS } from './utils/input-utils';
import { optionToChannelType } from './utils/utils';
import { getMasterChannel } from './utils/channel-selection';
import { SoundcraftUI } from 'soundcraft-ui-connection';

type CompanionFeedbackWithCallback = CompanionFeedback &
  Required<Pick<CompanionFeedback, 'callback' | 'subscribe' | 'unsubscribe'>>;

export enum FeedbackType {
  MuteMasterChannel = 'mutemasterchannel',
  SoloMasterChannel = 'solomasterchannel',
  DimMaster = 'dimmaster',
  // MuteAuxChannel = 'muteauxchannel',
  // MuteFxChannel = 'mutefxchannel',
}

export function GetFeedbacksList(instance: InstanceSkel<UiConfig>, feedback: UiFeedbackState, conn: SoundcraftUI): CompanionFeedbacks {
  const feedbacks: { [type in FeedbackType]: CompanionFeedbackWithCallback } = {
    [FeedbackType.MuteMasterChannel]: {
      label: 'Change colors from master fader MUTE state',
      description: 'If the specified target is muted, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(255, 0, 0)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
        OPTIONS.masterChannelTypeDropdown,
        OPTIONS.channelNumberField,
        getStateCheckbox('Muted')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const channelType = optionToChannelType(evt.options.channelType);
        const channel = Number(evt.options.channel);
        const c = getMasterChannel(conn.master, channelType, channel);
        feedback.connect(evt, c.mute$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.SoloMasterChannel]: {
      label: 'Change colors from master fader SOLO state',
      description: 'If the channel is soloed, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(255, 255, 0)),
        getForegroundPicker(instance.rgb(0, 0, 0)),
        OPTIONS.masterChannelTypeDropdown,
        OPTIONS.channelNumberField,
        getStateCheckbox('Solo')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const channelType = optionToChannelType(evt.options.channelType);
        const channel = Number(evt.options.channel);
        const c = getMasterChannel(conn.master, channelType, channel);
        feedback.connect(evt, c.solo$);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.DimMaster]: {
      label: 'Change colors from master dim state',
      description: 'If the master is dimmed, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(0, 150, 255)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
        getStateCheckbox('Dimmed')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => feedback.connect(evt, conn.master.dim$),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    }
  };

  return feedbacks;
}
