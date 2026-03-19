import type { CompanionVariableValues } from '@companion-module/base'
import type { UiConfig } from './config.js'
import type { UiActionSchemas } from './actions.js'
import type { UiFeedbackSchemas } from './feedback.js'

export type UiSchema = {
	config: UiConfig
	secrets: undefined
	actions: UiActionSchemas
	feedbacks: UiFeedbackSchemas
	variables: CompanionVariableValues
}
