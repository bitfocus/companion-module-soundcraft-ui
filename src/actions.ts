import { CompanionAction, CompanionActions } from '../../../instance_skel_types';
import { SoundcraftUI } from 'soundcraft-ui-connection';
import { CHOICES, OPTIONS, OPTION_SETS } from './utils/input-utils';
import {
  getAuxChannelFromOptions,
  getFxChannelFromOptions,
  getMasterChannelFromOptions
} from './utils/channel-selection';

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
  // MediaSwitchPlist = 'mediaswitchplist',
  // MediaSwitchTrack = 'mediaswitchtrack',
  // MediaPlay = 'mediaplay',
  // MediaStop = 'mediastop',
  // MediaPause = 'mediapause',
  // MediaNext = 'medianext',
  // MediaPrev = 'mediaprev'
}

type CompanionActionWithCallback = CompanionAction & Required<Pick<CompanionAction, 'callback'>>;

export function GetActionsList(conn: SoundcraftUI): CompanionActions {
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
        }
      }
    }

    /**
     * Media Player
     */
    /* [ActionType.MediaPlay]: {
      label: 'Media Player: Play/Stop',
      options: [],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaStop]: {
      label: 'Media Player: Stop',
      options: [],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaPause]: {
      label: 'Media Player: Pause',
      options: [],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaNext]: {
      label: 'Media Player: Next track',
      options: [],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaPrev]: {
      label: 'Media Player: Previous track',
      options: [],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaSwitchPlist]: {
      label: 'Media Player: Switch Playlist',
      options: [
        {
          type: 'textinput',
          label: 'Playlist',
          id: 'playlist',
          regex: self.REGEX_SOMETHING
        }
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.MediaSwitchTrack]: {
      label: 'Media Player: Switch Track',
      options: [
        {
          type: 'textinput',
          label: 'Playlist',
          id: 'playlist',
          default: '~all~',
          regex: self.REGEX_SOMETHING
        },
        {
          type: 'textinput',
          label: 'File',
          id: 'file',
          regex: self.REGEX_SOMETHING
        }
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */
  };

  return actions;
}
