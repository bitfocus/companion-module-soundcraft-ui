import { CompanionAction, CompanionActions } from '../../../instance_skel_types';
import { SoundcraftUI } from 'soundcraft-ui-connection';
import { CHOICES, OPTIONS, OPTION_SETS } from './utils/input-utils';
import {
  getAuxChannelFromOptions,
  getFxChannelFromOptions,
  getMasterChannelFromOptions,
  getMuteGroupIDFromOptions
} from './utils/channel-selection';
import InstanceSkel = require('../../../instance_skel');
import { UiConfig } from './config';

export enum ActionType {
  // Master
  SetMasterValue = 'setmastervalue',
  ChangeMasterValue = 'changemastervalue',
  FadeMaster = 'fademaster',
  DimMaster = 'dimmaster',

  // Master Channels
  MuteMasterChannel = 'mutemasterchannel',
  SoloMasterChannel = 'solomasterchannel',
  SetMasterChannelValue = 'setmasterchannelvalue',
  ChangeMasterChannelValue = 'changemasterchannelvalue',
  FadeMasterChannel = 'fademasterchannel',

  // AUX Channels
  MuteAuxChannel = 'muteauxchannel',
  SetAuxChannelValue = 'setauxchannelvalue',
  ChangeAuxChannelValue = 'changeauxchannelvalue',
  FadeAuxChannel = 'fadeauxchannel',
  SetAuxChannelPost = 'setauxchannelpost',
  SetAuxChannelPostProc = 'setauxchannelpostproc',

  // FX Channels
  MuteFxChannel = 'mutefxchannel',
  SetFxChannelPost = 'setfxchannelpost',
  SetFxChannelValue = 'setfxchannelvalue',
  ChangeFxChannelValue = 'changefxchannelvalue',
  FadeFxChannel = 'fadefxchannel',

  // Media Player
  MediaPlay = 'mediaplay',
  MediaStop = 'mediastop',
  MediaPause = 'mediapause',
  MediaNext = 'medianext',
  MediaPrev = 'mediaprev',
  MediaSwitchPlist = 'mediaswitchplist',
  MediaSwitchTrack = 'mediaswitchtrack',
  MediaSetPlayMode = 'mediasetplaymode',
  MediaSetShuffle = 'mediasetshuffle',

  // 2-Track Recorder
  DTRecordToggle = 'dualtrackrecordtoggle',

  // MUTE Groups / ALL / FX
  MuteGroupMute = 'mutegroupmute',
  MuteGroupClear = 'mutegroupclear',
}

type CompanionActionWithCallback = CompanionAction & Required<Pick<CompanionAction, 'callback'>>;

export function GetActionsList(instance: InstanceSkel<UiConfig>, conn: SoundcraftUI): CompanionActions {
  const actions: { [id in ActionType]: CompanionActionWithCallback } = {
    /**
     * MASTER
     */
    [ActionType.SetMasterValue]: {
      label: 'Master: Set fader value',
      options: [OPTIONS.faderValuesSlider],
      callback: action => {
        const value = Number(action.options.value);
        return conn.master.setFaderLevelDB(value);
      }
    },

    [ActionType.FadeMaster]: {
      label: 'Master: Fade transition',
      options: [...OPTION_SETS.fadeTransition],
      callback: action => {
        return conn.master.fadeToDB(
          Number(action.options.value),
          Number(action.options.fadeTime),
          Number(action.options.easing)
        );
      }
    },
    
    [ActionType.ChangeMasterValue]: {
      label: 'Master: Change fader value (relative)',
      options: [OPTIONS.faderChangeField],
      callback: action => {
        const value = Number(action.options.value);
        return conn.master.changeFaderLevelDB(value);
      }
    },

    [ActionType.DimMaster]: {
      label: 'Master: Dim',
      options: [
        {
          type: 'dropdown',
          label: 'Dim',
          id: 'dim',
          ...CHOICES.onofftoggleDropdown
        }
      ],
      callback: action => {
        switch (Number(action.options.dim)) {
          case 0:
            return conn.master.undim();
          case 1:
            return conn.master.dim();
          case 2:
            return conn.master.toggleDim();
        }
      }
    },

    /**
     * Master Channels
     */
    [ActionType.MuteMasterChannel]: {
      label: 'Master channels: Mute',
      options: [...OPTION_SETS.masterChannel, OPTIONS.muteDropdown],
      callback: action => {
        const c = getMasterChannelFromOptions(action.options, conn);
        switch (Number(action.options.mute)) {
          case 0:
            return c.unmute();
          case 1:
            return c.mute();
          case 2:
            return c.toggleMute();
        }
      }
    },

    [ActionType.SetMasterChannelValue]: {
      label: 'Master channels: Set fader value',
      options: [...OPTION_SETS.masterChannel, OPTIONS.faderValuesSlider],
      callback: action => {
        const c = getMasterChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.setFaderLevelDB(value);
      }
    },

    [ActionType.FadeMasterChannel]: {
      label: 'Master channels: Fade transition',
      options: [...OPTION_SETS.masterChannel, ...OPTION_SETS.fadeTransition],
      callback: action => {
        const c = getMasterChannelFromOptions(action.options, conn);
        return c.fadeToDB(
          Number(action.options.value),
          Number(action.options.fadeTime),
          Number(action.options.easing)
        );
      }
    },

    [ActionType.ChangeMasterChannelValue]: {
      label: 'Master channels: Change fader value (relative)',
      options: [...OPTION_SETS.masterChannel, OPTIONS.faderChangeField],
      callback: action => {
        const c = getMasterChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.changeFaderLevelDB(value);
      }
    },

    [ActionType.SoloMasterChannel]: {
      label: 'Master channels: Solo',
      options: [...OPTION_SETS.masterChannel, OPTIONS.soloDropdown],
      callback: action => {
        const c = getMasterChannelFromOptions(action.options, conn);
        switch (Number(action.options.solo)) {
          case 0:
            return c.unsolo();
          case 1:
            return c.solo();
          case 2:
            return c.toggleSolo();
        }
      }
    },

    /**
     * AUX Channels
     */
    [ActionType.MuteAuxChannel]: {
      label: 'AUX channels: Mute',
      options: [...OPTION_SETS.auxChannel, OPTIONS.muteDropdown],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        switch (Number(action.options.mute)) {
          case 0:
            return c.unmute();
          case 1:
            return c.mute();
          case 2:
            return c.toggleMute();
        }
      }
    },

    [ActionType.SetAuxChannelValue]: {
      label: 'AUX channels: Set fader value',
      options: [...OPTION_SETS.auxChannel, OPTIONS.faderValuesSlider],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.setFaderLevelDB(value);
      }
    },

    [ActionType.FadeAuxChannel]: {
      label: 'AUX channels: Fade transition',
      options: [...OPTION_SETS.auxChannel, ...OPTION_SETS.fadeTransition],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        return c.fadeToDB(
          Number(action.options.value),
          Number(action.options.fadeTime),
          Number(action.options.easing)
        );
      }
    },

    [ActionType.ChangeAuxChannelValue]: {
      label: 'AUX channels: Change fader value (relative)',
      options: [...OPTION_SETS.auxChannel, OPTIONS.faderChangeField],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.changeFaderLevelDB(value);
      }
    },

    [ActionType.SetAuxChannelPost]: {
      label: 'AUX channels: Set PRE/POST',
      options: [...OPTION_SETS.auxChannel, OPTIONS.prepostDropdown],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        switch (Number(action.options.post)) {
          case 0:
            return c.pre();
          case 1:
            return c.post();
          case 2:
            return c.togglePost();
        }
      }
    },

    [ActionType.SetAuxChannelPostProc]: {
      label: 'AUX channels: Set POST PROC',
      options: [
        ...OPTION_SETS.auxChannel,
        {
          type: 'dropdown',
          label: 'POST PROC',
          id: 'postproc',
          ...CHOICES.onoffDropdown
        }
      ],
      callback: action => {
        const c = getAuxChannelFromOptions(action.options, conn);
        const value = Number(action.options.postproc);
        return c.setPostProc(value);
      }
    },

    /**
     * FX channels
     */
    [ActionType.MuteFxChannel]: {
      label: 'FX channels: Mute',
      options: [...OPTION_SETS.fxChannel, OPTIONS.muteDropdown],
      callback: action => {
        const c = getFxChannelFromOptions(action.options, conn);
        switch (Number(action.options.mute)) {
          case 0:
            return c.unmute();
          case 1:
            return c.mute();
          case 2:
            return c.toggleMute();
        }
      }
    },

    [ActionType.SetFxChannelValue]: {
      label: 'FX channels: Set fader value',
      options: [...OPTION_SETS.fxChannel, OPTIONS.faderValuesSlider],
      callback: action => {
        const c = getFxChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.setFaderLevelDB(value);
      }
    },

    [ActionType.FadeFxChannel]: {
      label: 'FX channels: Fade transition',
      options: [...OPTION_SETS.fxChannel, ...OPTION_SETS.fadeTransition],
      callback: action => {
        const c = getFxChannelFromOptions(action.options, conn);
        return c.fadeToDB(
          Number(action.options.value),
          Number(action.options.fadeTime),
          Number(action.options.easing)
        );
      }
    },

    [ActionType.ChangeFxChannelValue]: {
      label: 'FX channels: Change fader value (relative)',
      options: [...OPTION_SETS.fxChannel, OPTIONS.faderChangeField],
      callback: action => {
        const c = getFxChannelFromOptions(action.options, conn);
        const value = Number(action.options.value);
        return c.changeFaderLevelDB(value);
      }
    },

    [ActionType.SetFxChannelPost]: {
      label: 'FX channels: Set PRE/POST',
      options: [...OPTION_SETS.fxChannel, OPTIONS.prepostDropdown],
      callback: action => {
        const c = getFxChannelFromOptions(action.options, conn);
        switch (Number(action.options.post)) {
          case 0:
            return c.pre();
          case 1:
            return c.post();
          case 2:
            return c.togglePost();
        }
      }
    },

    /**
     * Media Player
     */
    [ActionType.MediaPlay]: {
      label: 'Media Player: Play/Stop',
      options: [],
      callback: () => conn.player.play()
    },

    [ActionType.MediaStop]: {
      label: 'Media Player: Stop',
      options: [],
      callback: () => conn.player.stop()
    },

    [ActionType.MediaPause]: {
      label: 'Media Player: Pause',
      options: [],
      callback: () => conn.player.pause()
    },

    [ActionType.MediaNext]: {
      label: 'Media Player: Next track',
      options: [],
      callback: () => conn.player.next()
    },

    [ActionType.MediaPrev]: {
      label: 'Media Player: Previous track',
      options: [],
      callback: () => conn.player.prev()
    },

    [ActionType.MediaSwitchPlist]: {
      label: 'Media Player: Switch Playlist',
      options: [
        {
          type: 'textinput',
          label: 'Playlist',
          id: 'playlist',
          default: '~all~',
          regex: instance.REGEX_SOMETHING
        }
      ],
      callback: action => {
        conn.player.loadPlaylist(action.options.playlist as string);
      }
    },

    [ActionType.MediaSwitchTrack]: {
      label: 'Media Player: Switch Track',
      options: [
        {
          type: 'textinput',
          label: 'Playlist',
          id: 'playlist',
          default: '~all~',
          regex: instance.REGEX_SOMETHING
        },
        {
          type: 'textinput',
          label: 'Track/File',
          id: 'track',
          regex: instance.REGEX_SOMETHING
        }
      ],
      callback: action => {
        conn.player.loadTrack(
          action.options.playlist as string,
          action.options.track as string
        );
      }
    },

    [ActionType.MediaSetPlayMode]: {
      label: 'Media Player: Set play mode (MANUAL/AUTO)',
      options: [
        {
          type: 'dropdown',
          label: 'Mode',
          id: 'mode',
          choices: [
            { id: 'manual', label: 'MANUAL' },
            { id: 'auto', label: 'AUTO' },
          ],
          default: 'manual'
        }
      ],
      callback: action => {
        switch (action.options.mode) {
          case 'manual':
            return conn.player.setManual();
          case 'auto':
            return conn.player.setAuto();
        }
      }
    },

    [ActionType.MediaSetShuffle]: {
      label: 'Media Player: Set shuffle',
      options: [
        {
          type: 'dropdown',
          label: 'Shuffle',
          id: 'shuffle',
          ...CHOICES.onofftoggleDropdown
        }
      ],
      callback: action => {
        switch (Number(action.options.shuffle)) {
          case 0:
            return conn.player.setShuffle(0);
          case 1:
            return conn.player.setShuffle(1);
          case 2:
            return conn.player.toggleShuffle();
        }        
      }
    },
    
    /**
     * 2-track Recorder
     */
    [ActionType.DTRecordToggle]: {
      label: '2-Track USB Recording: Record Toggle',
      options: [],
      callback: () => conn.recorderDualTrack.recordToggle()
    },

    /**
     * MUTE Groups / ALL / FX
     */
    [ActionType.MuteGroupMute]: {
      label: 'MUTE Groups/ALL/FX: Mute',
      options: [OPTIONS.muteGroupDropdown, OPTIONS.muteDropdown],
      callback: action => {
        const groupId = getMuteGroupIDFromOptions(action.options);
        if (groupId === -1) { return; }
        
        const group = conn.muteGroup(groupId);
        switch (Number(action.options.mute)) {
          case 0:
            return group.unmute();
          case 1:
            return group.mute();
          case 2:
            return group.toggle();
        }
      }
    },

    [ActionType.MuteGroupClear]: {
      label: 'MUTE Groups/ALL/FX: Clear',
      options: [],
      callback: () => conn.clearMuteGroups()
    },
  };

  return actions;
}
