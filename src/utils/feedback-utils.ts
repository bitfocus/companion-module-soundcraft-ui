import {
    CompanionFeedbackEvent,
    CompanionFeedbackResult,
    CompanionInputFieldColor
} from '../../../../instance_skel_types'
import { UiFeedbackState } from '../state'

export function getForegroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Foreground color',
    id: 'fg',
    default: color
  }
}
export function getBackgroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Background color',
    id: 'bg',
    default: color
  }
}

export function getOptColors(evt: CompanionFeedbackEvent): CompanionFeedbackResult {
  return {
    color: Number(evt.options.fg),
    bgcolor: Number(evt.options.bg)
  }
}

export function getOptColorsWhenValue(feedback: UiFeedbackState, evt: CompanionFeedbackEvent, value: any) {
  if (feedback.get(evt.id) === value) {
    return getOptColors(evt);
  }
  return {};
}
