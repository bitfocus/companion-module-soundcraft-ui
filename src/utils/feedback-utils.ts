import {
  CompanionFeedbackEvent,
  CompanionFeedbackResult,
  CompanionInputFieldCheckbox,
  CompanionInputFieldColor
} from '../../../../instance_skel_types';
import { UiFeedbackState } from '../state';
import { intToBool } from './utils';

export function getForegroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Foreground color',
    id: 'fg',
    default: color
  };
}
export function getBackgroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Background color',
    id: 'bg',
    default: color
  };
}

export function getStateCheckbox(label: string): CompanionInputFieldCheckbox {
  return {
    id: 'state',
    type: 'checkbox',
    label,
    default: true
  };
}

export function getOptColors(evt: CompanionFeedbackEvent): CompanionFeedbackResult {
  return {
    color: Number(evt.options.fg),
    bgcolor: Number(evt.options.bg)
  };
}

export function getOptColorsForBinaryState(
  feedback: UiFeedbackState,
  evt: CompanionFeedbackEvent
): CompanionFeedbackResult {
  const state = intToBool(Number(feedback.get(evt.id)));
  if (evt.options.state === state) {
    return getOptColors(evt);
  } else {
    return {};
  }
}
