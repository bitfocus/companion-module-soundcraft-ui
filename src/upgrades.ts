import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base';
import { FeedbackId } from './feedback';

// see https://github.com/bitfocus/companion/wiki/Migrating-legacy-to-boolean-feedbacks
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
  [FeedbackId.MuteMuteGroup]: true
});
