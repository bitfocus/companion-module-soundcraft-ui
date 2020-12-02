import InstanceSkel = require('../../../instance_skel');
import { CompanionFeedback, CompanionFeedbacks } from '../../../instance_skel_types';
import { UiConfig } from './config';
import { UiFeedbackState } from './state';
import {
  getBackgroundPicker,
  getForegroundPicker,
  getOptColors,
  getOptColorsForBinaryState,
  getStateCheckbox
} from './utils/feedback-utils';
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
  MuteMuteGroup = 'mutemutegroup'
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

  const postColorPickers = [
    getBackgroundPicker(instance.rgb(0, 255, 0)),
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
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
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
        const streamId = c.fullChannelId + '-solo';
        feedback.connect(evt, c.solo$, streamId);
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
      subscribe: evt => feedback.connect(evt, conn.master.dim$, 'masterdim'),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MuteAuxChannel]: {
      label: 'Change colors from AUX bus channel MUTE state',
      description: 'If the specified channel on the AUX bus is muted, change color of the bank',
      options: [...muteColorPickers, ...OPTION_SETS.auxChannel, getStateCheckbox('Muted')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getAuxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.PostAuxChannel]: {
      label: 'Change colors from AUX bus channel POST state',
      description: 'If the specified channel on the AUX bus has POST enabled, change color of the bank',
      options: [...postColorPickers, ...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getAuxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-post';
        feedback.connect(evt, c.post$, streamId);
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
        const streamId = c.fullChannelId + '-mute';
        feedback.connect(evt, c.mute$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.PostFxChannel]: {
      label: 'Change colors from FX bus channel POST state',
      description: 'If the specified channel on the FX bus has POST enabled, change color of the bank',
      options: [...postColorPickers, ...OPTION_SETS.auxChannel, getStateCheckbox('POST')],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const c = getFxChannelFromOptions(evt.options, conn);
        const streamId = c.fullChannelId + '-post';
        feedback.connect(evt, c.post$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MediaPlayerState]: {
      label: 'Change colors from media player state',
      description: 'If the media player has the specified state, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(0, 255, 0)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
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
      callback: evt => feedback.get(evt.id) ? getOptColors(evt) : {},
      subscribe: evt => {
        const state = Number(evt.options.state);
        const state$ = conn.player.state$.pipe(
          map(s => s === state ? 1 : 0),
          distinctUntilChanged(),
        );
        const streamId = 'playerstate' + state;
        feedback.connect(evt, state$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.MediaPlayerShuffle]: {
      label: 'Change colors from media player shuffle setting',
      description: 'If the shuffle setting of the media player has the specified state, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(156, 22, 69)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
        getStateCheckbox('Shuffle')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => feedback.connect(evt, conn.player.shuffle$, 'playershuffle'),
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },

    [FeedbackType.DTRecordState]: {
      label: 'Change colors from 2-track USB recording state',
      description: 'If the 2-track USB recorder has the specified state, change color of the bank',
      options: [
        getBackgroundPicker(instance.rgb(255, 0, 0)),
        getForegroundPicker(instance.rgb(255, 255, 255)),
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
      callback: evt => feedback.get(evt.id) ? getOptColors(evt) : {},
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
      label: 'Change colors from MUTE group/ALL/FX state',
      description: 'If the specified group is muted, change color of the bank',
      options: [
        ...muteColorPickers,
        OPTIONS.muteGroupDropdown,
        getStateCheckbox('Muted')
      ],
      callback: evt => getOptColorsForBinaryState(feedback, evt),
      subscribe: evt => {
        const groupId = getMuteGroupIDFromOptions(evt.options);
        if (groupId === -1) { return; }
        const group = conn.muteGroup(groupId);

        const streamId = 'mgstate' + groupId;
        feedback.connect(evt, group.state$, streamId);
      },
      unsubscribe: evt => feedback.unsubscribe(evt.id)
    },
  };

  return feedbacks;
}
