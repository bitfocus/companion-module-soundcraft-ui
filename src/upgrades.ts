import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'
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
