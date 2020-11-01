import { ChannelType } from 'soundcraft-ui-connection';
import { DropdownChoice, SomeCompanionInputField } from '../../../../instance_skel_types';

/**
 * This file contains generic helpers for action/feedback creation
 * like reusable dropdown choices and pre-defined options
 */

/**
 * All possible fader types as dropdown choices
 */
export const FADER_TYPES: { [key in ChannelType]: DropdownChoice } = {
  i: { id: 'i', label: 'Input' },
  l: { id: 'l', label: 'Line Input' },
  p: { id: 'p', label: 'Player' },
  f: { id: 'f', label: 'FX' },
  s: { id: 's', label: 'Sub Group' },
  a: { id: 'a', label: 'AUX Master' },
  v: { id: 'v', label: 'VCA' }
};

/**
 * Commonly used choice groups for dropdowns
 */
export const CHOICES = {
  mute: {
    choices: [
      { id: 2, label: 'Toggle' },
      { id: 1, label: 'Mute' },
      { id: 0, label: 'Unmute' }
    ],
    default: 2
  },

  onofftoggleDropdown: {
    choices: [
      { id: 2, label: 'Toggle' },
      { id: 1, label: 'On' },
      { id: 0, label: 'Off' }
    ],
    default: 2
  },

  onoffDropdown: {
    choices: [
      { id: 1, label: 'On' },
      { id: 0, label: 'Off' }
    ],
    default: 1
  },

  masterChannelTypes: {
    choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.f, FADER_TYPES.s, FADER_TYPES.a, FADER_TYPES.v],
    default: 'i'
  },

  auxChannelTypes: {
    choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.f],
    default: 'i'
  },

  fxChannelTypes: {
    choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.s],
    default: 'i'
  }
}

/**
 * Commonly used option fields
 */
export const OPTIONS: { [key: string]: SomeCompanionInputField } = {
  masterChannelTypeDropdown: {
    type: 'dropdown',
    label: 'Channel Type',
    id: 'channelType',
    ...CHOICES.masterChannelTypes
  },
  auxChannelTypeDropdown: {
    type: 'dropdown',
    label: 'Channel Type',
    id: 'channelType',
    ...CHOICES.auxChannelTypes
  },
  fxChannelTypeDropdown: {
    type: 'dropdown',
    label: 'Channel Type',
    id: 'channelType',
    ...CHOICES.fxChannelTypes
  },
  busNumberField: {
    type: 'number',
    label: 'Bus number',
    id: 'bus',
    min: 1,
    max: 10,
    default: 1
  },
  channelNumberField: {
    type: 'number',
    label: 'Channel number',
    id: 'channel',
    min: 1,
    max: 24,
    default: 1
  },
  muteDropdown: {
    type: 'dropdown',
    label: 'Mute',
    id: 'mute',
    ...CHOICES.mute
  },
  soloDropdown: {
    type: 'dropdown',
    label: 'Solo',
    id: 'solo',
    ...CHOICES.onofftoggleDropdown
  },
  faderValuesSlider: {
    type: 'number',
    label: 'Fader Level dB (-100 = -∞)',
    id: 'value',
    range: true,
    required: true,
    default: 0,
    step: 0.1,
    min: -100,
    max: 10
  },
  prepostDropdown: {
    type: 'dropdown',
    label: 'Pre/Post',
    id: 'post',
    choices: [
      { id: 0, label: 'PRE' },
      { id: 1, label: 'POST' }
    ],
    default: 2
  }
};

/**
 * Commonly used combinations of option fields
 */

export const OPTION_SETS: { [key: string]: SomeCompanionInputField[] } = {
  masterChannel: [OPTIONS.masterChannelTypeDropdown, OPTIONS.channelNumberField],
  auxChannel: [OPTIONS.busNumberField, OPTIONS.auxChannelTypeDropdown, OPTIONS.channelNumberField],
  fxChannel: [OPTIONS.busNumberField, OPTIONS.fxChannelTypeDropdown, OPTIONS.channelNumberField]
};
