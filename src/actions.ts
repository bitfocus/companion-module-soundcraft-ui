import { CompanionAction, CompanionActions } from '../../../instance_skel_types';
import { SoundcraftUI } from 'soundcraft-ui-connection';
import { CHOICES, OPTIONS } from './utils/input-utils';
import { getAuxChannel, getMasterChannel } from './utils/channel-selection';
import { optionToChannelType } from './utils/utils';

export enum ActionType {
  MuteMasterChannel = 'mutemasterchannel',
  SoloMasterChannel = 'solomasterchannel',
  // SetMasterChannelValue = 'setmasterchannelvalue',
  MuteAuxChannel = 'muteauxchannel',
  // SetAuxChannelValue = 'setauxchannelvalue',
  SetAuxChannelPost = 'setauxchannelpost',
  SetAuxChannelPostProc = 'setauxchannelpostproc',
  // MuteFxChannel = 'mutefxchannel',
  // SetFxChannelPost = 'setfxchannelpost',
  // SetFxChannelValue = 'setfxchannelvalue',
  // SetMasterValue = 'setmastervalue',
  DimMaster = 'dimmaster'
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
    /* [ActionType.SetMasterValue]: {
      label: 'Master: Set fader value',
      options: [
        OPTIONS.faderValuesDropdown
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

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
      options: [OPTIONS.masterChannelTypeDropdown, OPTIONS.channelNumberField, OPTIONS.muteDropdown],
      callback: action => {
        const channelType = optionToChannelType(action.options.channelType);
        const channel = Number(action.options.channel);
        const c = getMasterChannel(conn.master, channelType, channel);
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

    /* [ActionType.SetMasterChannelValue]: {
      label: 'Master channels: Set fader value',
      options: [OPTIONS.masterChannelTypeDropdown, OPTIONS.channelNumberField, OPTIONS.faderValuesDropdown],
      callback: action => {
        console.log(action);
      }
    }, */

    [ActionType.SoloMasterChannel]: {
      label: 'Master channels: Solo',
      options: [OPTIONS.masterChannelTypeDropdown, OPTIONS.channelNumberField, OPTIONS.soloDropdown],
      callback: action => {
        const channelType = optionToChannelType(action.options.channelType);
        const channel = Number(action.options.channel);
        const c = getMasterChannel(conn.master, channelType, channel);
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
      label: 'AUX: Mute channel',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.auxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.muteDropdown
      ],
      callback: action => {
        const bus = Number(action.options.bus);
        const channel = Number(action.options.channel);
        const channelType = optionToChannelType(action.options.channelType);
        const c = getAuxChannel(conn.aux(bus), channelType, channel);
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

    /* [ActionType.SetAuxChannelValue]: {
      label: 'AUX: Set fader value',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.auxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.faderValuesDropdown
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    [ActionType.SetAuxChannelPost]: {
      label: 'AUX: Set PRE/POST',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.auxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.prepostDropdown
      ],
      callback: action => {
        const bus = Number(action.options.bus);
        const channel = Number(action.options.channel);
        const channelType = optionToChannelType(action.options.channelType);
        const c = getAuxChannel(conn.aux(bus), channelType, channel);
        switch (Number(action.options.post)) {
          case 0:
            return c.pre();
          case 1:
            return c.post();
        }
      }
    },

    [ActionType.SetAuxChannelPostProc]: {
      label: 'AUX: Set Post proc',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.auxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        {
          type: 'dropdown',
          label: 'Post Proc',
          id: 'postproc',
          ...CHOICES.onoffDropdown
        }
      ],
      callback: action => {
        const bus = Number(action.options.bus);
        const channel = Number(action.options.channel);
        const channelType = optionToChannelType(action.options.channelType);
        const c = getAuxChannel(conn.aux(bus), channelType, channel);

        const value = Number(action.options.postproc);
        return c.setPostproc(value);
      }
    }

    /**
     * FX channels
     */
    /* [ActionType.MuteFxChannel]: {
      label: 'FX: Mute channel',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.fxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.muteDropdown
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.SetFxChannelValue]: {
      label: 'FX: Set fader value',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.fxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.faderValuesDropdown
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

    /* [ActionType.SetFxChannelPost]: {
      label: 'FX: Set PRE/POST',
      options: [
        OPTIONS.busNumberField,
        OPTIONS.auxChannelTypeDropdown,
        OPTIONS.channelNumberField,
        OPTIONS.prepostDropdown
      ],
      callback: action => {
        // TODO
        console.log('ACTION', action);
      }
    }, */

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
