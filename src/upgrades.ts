import { CompanionStaticUpgradeScript, CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'
import { FeedbackId } from './feedback'

export const upgradeLegacyFeedbackToBoolean = CreateConvertToBooleanFeedbackUpgradeScript({
	[FeedbackId.MuteMasterChannel]: true,
	[FeedbackId.SoloMasterChannel]: true,
	[FeedbackId.DimMaster]: true,
	[FeedbackId.MuteAuxChannel]: true,
	[FeedbackId.PostAuxChannel]: true,
	[FeedbackId.MuteFxChannel]: true,
	[FeedbackId.PostFxChannel]: true,
	[FeedbackId.MediaPlayerState]: true,
	[FeedbackId.MediaPlayerShuffle]: true,
	[FeedbackId.DTRecordState]: true,
	[FeedbackId.MuteMuteGroup]: true,
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
export const upgradeV2x0x0: CompanionStaticUpgradeScript<unknown> = function (_context, _props) {
	return { updatedActions: [], updatedConfig: null, updatedFeedbacks: [] }
}
