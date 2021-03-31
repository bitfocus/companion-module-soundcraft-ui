import {
  ChannelType,
  MasterBus,
  AuxBus,
  FxBus,
  SoundcraftUI,
  AuxChannel,
  FxChannel,
  MasterChannel,
  MuteGroupID,
  VolumeBus
} from 'soundcraft-ui-connection';
import { CompanionActionEvent, CompanionFeedbackEvent } from '../../../../instance_skel_types';
import { optionToChannelType } from './utils';

export type CompanionFeedbackOrActionEventOptions = CompanionActionEvent['options'] | CompanionFeedbackEvent['options'];

/** Master Channels */

export function getMasterChannel(source: MasterBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.line(channel);
    case 'p':
      return source.player(channel);
    case 'a':
      return source.aux(channel);
    case 's':
      return source.sub(channel);
    case 'v':
      return source.vca(channel);
    case 'f':
      return source.fx(channel);
    default:
    case 'i':
      return source.input(channel);
  }
}

export function getMasterChannelFromOptions(
  options: CompanionFeedbackOrActionEventOptions,
  conn: SoundcraftUI
): MasterChannel {
  const channelType = optionToChannelType(options.channelType);
  const channel = Number(options.channel);
  return getMasterChannel(conn.master, channelType, channel);
}

/** AUX Channels */

export function getAuxChannel(source: AuxBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.line(channel);
    case 'p':
      return source.player(channel);
    case 'f':
      return source.fx(channel);
    default:
    case 'i':
      return source.input(channel);
  }
}

export function getAuxChannelFromOptions(
  options: CompanionFeedbackOrActionEventOptions,
  conn: SoundcraftUI
): AuxChannel {
  const bus = Number(options.bus);
  const channel = Number(options.channel);
  const channelType = optionToChannelType(options.channelType);
  return getAuxChannel(conn.aux(bus), channelType, channel);
}

/** FX Channels */

export function getFxChannel(source: FxBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.line(channel);
    case 'p':
      return source.player(channel);
    case 's':
      return source.sub(channel);
    default:
    case 'i':
      return source.input(channel);
  }
}

export function getFxChannelFromOptions(options: CompanionFeedbackOrActionEventOptions, conn: SoundcraftUI): FxChannel {
  const bus = Number(options.bus);
  const channel = Number(options.channel);
  const channelType = optionToChannelType(options.channelType);
  return getFxChannel(conn.fx(bus), channelType, channel);
}


export function getMuteGroupIDFromOptions(options: CompanionFeedbackOrActionEventOptions): MuteGroupID {
  const group = options.group;
  if (group === 'all' || group === 'fx') {
    return group;
  }

  const groupAsNum = Number(group);
  if (groupAsNum) {
    return groupAsNum;
  }

  return 'all';
}

export function getVolumeBusFromOptions(
  options: CompanionFeedbackOrActionEventOptions,
  conn: SoundcraftUI
): VolumeBus | undefined {
  switch (options.bus) {
    case 'solo':
      return conn.volume.solo;
    case 'hp1':
      return conn.volume.headphone(1);
    case 'hp2':
      return conn.volume.headphone(2);
    default:
      return;
  }
}
