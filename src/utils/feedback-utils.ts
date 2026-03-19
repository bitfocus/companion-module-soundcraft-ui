import type { CompanionFeedbackBooleanEvent, CompanionInputFieldCheckbox } from '@companion-module/base'

import { UiFeedbackStore } from '../feedback-store.js'
import { intToBool } from './utils.js'

export function getStateCheckbox(label: string): CompanionInputFieldCheckbox<'state'> {
	return {
		id: 'state',
		type: 'checkbox',
		label,
		default: true,
		disableAutoExpression: true,
	}
}

export function getFeedbackFromBinaryState(
	feedback: UiFeedbackStore,
	evt: CompanionFeedbackBooleanEvent<{ state: boolean }>,
): boolean {
	const state = intToBool(Number(feedback.get(evt.id)))
	return evt.options.state === state
}
