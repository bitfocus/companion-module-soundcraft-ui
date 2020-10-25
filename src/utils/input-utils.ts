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
    choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p, FADER_TYPES.s],
    default: 'i'
  },

  fxChannelTypes: {
    choices: [FADER_TYPES.i, FADER_TYPES.l, FADER_TYPES.p],
    default: 'i'
  },

  faderValues: {
    choices: [
      { label: '- ∞', id: 0.0 },
      { label: '-90 dB', id: 0.0037 },
      { label: '-80 dB', id: 0.01 },
      { label: '-70 dB', id: 0.0235 },
      { label: '-60 dB', id: 0.0562 },
      { label: '-50 dB', id: 0.114 },
      { label: '-30 dB', id: 0.2654 },
      { label: '-20 dB', id: 0.37 },
      { label: '-18 dB', id: 0.401 },
      { label: '-15 dB', id: 0.444 },
      { label: '-12 dB', id: 0.491 },
      { label: '-9 dB', id: 0.546 },
      { label: '-6 dB', id: 0.611 },
      { label: '-3 dB', id: 0.683 },
      { label: '-2 dB', id: 0.708 },
      { label: '-1 dB', id: 0.7365 },
      { label: '0 dB', id: 0.7653 },
      { label: '+1 dB', id: 0.7905 },
      { label: '+2 dB', id: 0.8188 },
      { label: '+3 dB', id: 0.844 },
      { label: '+4 dB', id: 0.8692 },
      { label: '+5 dB', id: 0.894 },
      { label: '+6 dB', id: 0.9156 },
      { label: '+9 dB', id: 0.98 },
      { label: '+10 dB', id: 1.0 }
    ],
    default: 0.7653
  }
};

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
  faderValuesDropdown: {
    type: 'dropdown',
    label: 'Value',
    id: 'value',
    ...CHOICES.faderValues
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
  },
};
