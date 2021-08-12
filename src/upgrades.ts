import { faderValueToDB } from 'soundcraft-ui-connection';
import InstanceSkel = require('../../../instance_skel');
import {
  CompanionCoreInstanceconfig,
  CompanionMigrationAction,
  CompanionMigrationFeedback,
  CompanionUpgradeContext
} from '../../../instance_skel_types';
import { ActionType } from './actions';
import { UiConfig } from './config';
import { FeedbackType } from './feedback';

// see https://github.com/bitfocus/companion/wiki/Migrating-legacy-to-boolean-feedbacks
export const upgradeLegacyFeedbackToBoolean = InstanceSkel.CreateConvertToBooleanFeedbackUpgradeScript({
  [FeedbackType.MuteMasterChannel]: true,
  [FeedbackType.SoloMasterChannel]: true,
  [FeedbackType.DimMaster]: true,
  [FeedbackType.MuteAuxChannel]: true,
  [FeedbackType.PostAuxChannel]: true,
  [FeedbackType.MuteFxChannel]: true,
  [FeedbackType.PostFxChannel]: true,
  [FeedbackType.MediaPlayerState]: true,
  [FeedbackType.MediaPlayerShuffle]: true,
  [FeedbackType.DTRecordState]: true,
  [FeedbackType.MuteMuteGroup]: true
});

export function upgradeV2x0x0(
  _context: CompanionUpgradeContext,
  _config: (CompanionCoreInstanceconfig & UiConfig) | null,
  actions: CompanionMigrationAction[],
  _feedbacks: CompanionMigrationFeedback[]
): boolean {
  let changed = false;

  for (const action of actions) {
    switch (action.action) {
      case 'mute': {
        action.options.channelType = action.options.type;
        delete action.options.type;

        action.options.channel = Number(action.options.channel);
        action.options.mute = Number(action.options.mute);

        action.action = ActionType.MuteMasterChannel;
        action.label = `${action.instance}:${action.action}`;

        changed = true;
        break;
      }

      case 'fade': {
        action.options.channel = Number(action.options.channel);
        action.options.channelType = action.options.type;
        delete action.options.type;

        const value = Number(action.options.level);
        action.options.value = Math.max(faderValueToDB(value), -100);
        delete action.options.level;

        action.action = ActionType.SetMasterChannelValue;
        action.label = `${action.instance}:${action.action}`;

        changed = true;
        break;
      }
    }
  }

  return changed;
}
