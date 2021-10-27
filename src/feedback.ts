/* eslint-disable @typescript-eslint/explicit-function-return-type */
import InstanceSkel = require('../../../instance_skel');
import { CompanionFeedback, CompanionFeedbacks } from '../../../instance_skel_types';
import { UiConfig } from './config';
import { UiFeedbackState } from './state';
import { getFeedbackFromBinaryState, getStateCheckbox } from './utils/feedback-utils';
import { OPTION_SETS, OPTIONS } from './utils/input-utils';
import {
  getAuxChannelFromOptions,
  getFxChannelFromOptions,
  getMasterChannelFromOptions,
  getMuteGroupIDFromOptions
} from './utils/channel-selection';
import { PlayerState, SoundcraftUI } from 'soundcraft-ui-connection';
import { distinctUntilChanged, map } from 'rxjs/operators';

type CompanionFeedbackWithCallback = CompanionFeedback &
  Required<Pick<CompanionFeedback, 'callback' | 'subscribe' | 'unsubscribe'>>;

export enum FeedbackType {
  MuteMasterChannel = 'mutemasterchannel',
  SoloMasterChannel = 'solomasterchannel',
  DimMaster = 'dimmaster',
  MuteAuxChannel = 'muteauxchannel',
  PostAuxChannel = 'postauxchannel',
  MuteFxChannel = 'mutefxchannel',
  PostFxChannel = 'postfxchannel',
  MediaPlayerState = 'mediaplayerstate',
  MediaPlayerShuffle = 'mediaplayershuffle',
  DTRecordState = 'dualtrackrecordstate',
  MuteMuteGroup = 'mutemutegroup',
  HwPhantomPower = 'hwphantompower'
}

export function GetFeedbacksList(
  instance: InstanceSkel<UiConfig>,
  feedback: UiFeedbackState,
  conn: SoundcraftUI
): CompanionFeedbacks {
  const muteStyle = {
    color: instance.rgb(255, 255, 255),
    bgcolor: instance.rgb(255, 0, 0)
  };

  const postStyle = {
    bgcolor: instance.rgb(0, 255, 0),
    color: instance.rgb(255, 255, 255)
  };

  const feedbacks: { [type in FeedbackType]: CompanionFeedbackWithCallback } = {
    [FeedbackType.MuteMasterChannel]: {
      type: 'boolean',
      label: 'Change colors from master channel MUTE state',
      description: 'If the specified target is muted, change color of the bank',
      style: muteStyle,
      options: [...OPTION_SETS.masterChannel, getStateCheckbox('Muted')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getMasterChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.SoloMasterChannel]: {
      type: 'boolean',
      label: 'Change colors from master channel SOLO state',
      description: 'If the channel is soloed, change color of the bank',
      style: postStyle,
      options: [...OPTION_SETS.masterChannel, getStateCheckbox('Solo')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getMasterChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-solo';
        feedback.connect(evt, c.solo$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.DimMaster]: {
      type: 'boolean',
      label: 'Change colors from master DIM state',
      description: 'If the master is dimmed, change color of the bank',
      style: {
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 150, 255)
      },
      options: [getStateCheckbox('Dimmed')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => feedback.connect(evt, conn.master.dim$, 'masterdim'),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteAuxChannel]: {
      type: 'boolean',
      label: 'Change colors from AUX bus channel MUTE state',
      description: 'If the specified channel on the AUX bus is muted, change color of the bank',
      style: muteStyle,
      options: [...OPTION_SETS.auxChannel, getStateCheckbox('Muted')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getAuxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.PostAuxChannel]: {
      type: 'boolean',
      label: 'Change colors from AUX bus channel POST state',
      description: 'If the specified channel on the AUX bus has POST enabled, change color of the bank',
      style: postStyle,
      options: [...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getAuxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-post';
        feedback.connect(evt, c.post$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteFxChannel]: {
      type: 'boolean',
      label: 'Change colors from FX bus channel MUTE state',
      description: 'If the specified channel on the FX bus is muted, change color of the bank',
      style: muteStyle,
      options: [...OPTION_SETS.fxChannel, getStateCheckbox('Muted')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getFxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.PostFxChannel]: {
      type: 'boolean',
      label: 'Change colors from FX bus channel POST state',
      description: 'If the specified channel on the FX bus has POST enabled, change color of the bank',
      style: postStyle,
      options: [...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getFxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-post';
        feedback.connect(evt, c.post$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MediaPlayerState]: {
      type: 'boolean',
      label: 'Change colors from media player state',
      description: 'If the media player has the specified state, change color of the bank',
      style: {
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 255, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'State',
          id: 'state',
          choices: [
            { id: PlayerState.Stopped, label: 'Stopped' },
            { id: PlayerState.Playing, label: 'Playing' },
            { id: PlayerState.Paused, label: 'Paused' }
          ],
          default: PlayerState.Playing
        }
      ],
      callback: evt => !!feedback.get(evt.id),
      subscribe: evt => {
        const state = Number(evt.options.state);
        const state$ = conn.player.state$.pipe(
          map(s => (s === state ? 1 : 0)),
          distinctUntilChanged()
        );
        const streamId = 'playerstate' + state;
        feedback.connect(evt, state$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MediaPlayerShuffle]: {
      type: 'boolean',
      label: 'Change colors from media player shuffle setting',
      description: 'If the shuffle setting of the media player has the specified state, change color of the bank',
      style: {
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(156, 22, 69)
      },
      options: [getStateCheckbox('Shuffle')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => feedback.connect(evt, conn.player.shuffle$, 'playershuffle'),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.DTRecordState]: {
      type: 'boolean',
      label: 'Change colors from 2-track USB recording state',
      description: 'If the 2-track USB recorder has the specified state, change color of the bank',
      style: {
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(255, 0, 0)
      },
      options: [
        {
          type: 'dropdown',
          label: 'State',
          id: 'state',
          choices: [
            { id: 'rec', label: 'Recording' },
            { id: 'busy', label: 'Busy' }
          ],
          default: 'rec'
        }
      ],
      callback: evt => !!feedback.get(evt.id),
      subscribe: evt => {
        const recorder = conn.recorderDualTrack;
        switch (evt.options.state) {
          case 'rec':
            return feedback.connect(evt, recorder.recording$, 'dtrec-rec');
          case 'busy':
            return feedback.connect(evt, recorder.busy$, 'dtrec-busy');
        }
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteMuteGroup]: {
      type: 'boolean',
      label: 'Change colors from MUTE group/ALL/FX state',
      description: 'If the specified group is muted, change color of the bank',
      style: muteStyle,
      options: [OPTIONS.muteGroupDropdown, getStateCheckbox('Muted')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const groupId = getMuteGroupIDFromOptions(evt.options);
        if (groupId === -1) {
          return;
        }
        const group = conn.muteGroup(groupId);

        const streamId = 'mgstate' + groupId;
        feedback.connect(evt, group.state$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.HwPhantomPower]: {
      type: 'boolean',
      label: 'Change colors from phantom power state',
      description: 'If Phantom Power is enabled for a channel, change color of the bank',
      style: {
        bgcolor: instance.rgb(51, 102, 255),
        color: instance.rgb(255, 255, 255)
      },
      options: [OPTIONS.hwChannelNumberField, getStateCheckbox('Phantom Power enabled')],
      callback: evt => getFeedbackFromBinaryState(feedback, evt),
      subscribe: evt => {
        const channelNo = Number(evt.options.hwchannel);
        const channel = conn.hw(channelNo);
        const streamId = 'hw' + channelNo + 'phantom';
        feedback.connect(evt, channel.phantom$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    }
  };

  return feedbacks;
}
