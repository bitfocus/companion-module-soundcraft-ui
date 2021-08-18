import { CompanionFeedbackEvent, CompanionInputFieldCheckbox } from '../../../../instance_skel_types';
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

export function getFeedbackFromBinaryState(feedback: UiFeedbackState, evt: CompanionFeedbackEvent): boolean {
  const state = intToBool(Number(feedback.get(evt.id)));
  return evt.options.state === state;
}
