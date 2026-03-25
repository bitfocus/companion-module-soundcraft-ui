import {
	type CompanionStaticUpgradeScript,
	CreateConvertToBooleanFeedbackUpgradeScript,
	type JsonObject,
} from '@companion-module/base'

export const upgradeLegacyFeedbackToBoolean = CreateConvertToBooleanFeedbackUpgradeScript({
	mutemasterchannel: true,
	solomasterchannel: true,
	dimmaster: true,
	muteauxchannel: true,
	postauxchannel: true,
	mutefxchannel: true,
	postfxchannel: true,
	mediaplayerstate: true,
	mediaplayershuffle: true,
	dualtrackrecordstate: true,
	mutemutegroup: true,
})

/**
 * Dummy upgrade script as a replacement for the old implementation prior to v3.
 * People who used v1 of this module have already upgraded to v2
 * so the upgrade implementation is not necessary anymore.
 * However, the script must not be deleted:
 * > "We track whether they have run by recording the count that have been run.
 * > So with it going from 2 to 1 upgrade scripts, some users will have their db reporting that they
 * > have run 2, some will report that they have run 1. When you add a new upgrade script,
 * > all those whose db says 2 will think they have already run it."
 */
export const upgradeV2x0x0: CompanionStaticUpgradeScript<JsonObject> = function (_context, _props) {
	return { updatedActions: [], updatedConfig: null, updatedFeedbacks: [] }
}

/**
 * Remove the `state` checkbox option from binary feedbacks.
 * Companion provides a built-in `isInverted` toggle,
 * making our custom `state` checkbox redundant.
 * If `state` was `false` (inverted), toggle `isInverted` to preserve behavior.
 */
export const upgradeRemoveStateFeedbackOption: CompanionStaticUpgradeScript<JsonObject> = function (_context, props) {
	const binaryStateFeedbackIds = [
		'mutemasterchannel',
		'solomasterchannel',
		'masterchannelmtkselection',
		'dimmaster',
		'muteauxchannel',
		'postauxchannel',
		'mutefxchannel',
		'postfxchannel',
		'mediaplayershuffle',
		'mtksoundcheckstate',
		'mutemutegroup',
		'hwphantompower',
		'automixgroupstate',
	]

	const result = { updatedActions: [], updatedConfig: null, updatedFeedbacks: [] as typeof props.feedbacks }

	for (const feedback of props.feedbacks) {
		if (!binaryStateFeedbackIds.includes(feedback.feedbackId)) {
			continue
		}

		// v1 API: options are plain values (e.g. state: true)
		// v2 API: options are wrapped (e.g. state: { isExpression: false, value: true })
		const rawState = feedback.options['state']
		const stateValue =
			rawState != null && typeof rawState === 'object' && 'value' in rawState
				? (rawState as { value: unknown }).value
				: (rawState ?? true)

		if (stateValue === false) {
			const rawInverted = feedback.isInverted
			if (rawInverted != null && typeof rawInverted === 'object' && 'value' in rawInverted) {
				// v2 API: wrapped value
				const wrapped = rawInverted as { isExpression: boolean; value: boolean }
				feedback.isInverted = { isExpression: false, value: !wrapped.value }
			} else {
				// v1 API: plain boolean
				feedback.isInverted = { isExpression: false, value: !(rawInverted ?? false) }
			}
		}

		delete feedback.options['state']
		result.updatedFeedbacks.push(feedback)
	}

	return result
}
