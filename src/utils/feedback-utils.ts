import { CompanionFeedbackBooleanEvent, CompanionInputFieldCheckbox } from '@companion-module/base';

import { UiFeedbackState } from '../state';
import { intToBool } from './utils';

export function getStateCheckbox(label: string): CompanionInputFieldCheckbox {
  return {
    id: 'state',
    type: 'checkbox',
    label,
    default: true
  };
}

export function getFeedbackFromBinaryState(feedback: UiFeedbackState, evt: CompanionFeedbackBooleanEvent): boolean {
  const state = intToBool(Number(feedback.get(evt.id)));
  return evt.options.state === state;
}
