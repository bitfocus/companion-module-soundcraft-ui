import { ChannelType, MasterBus, AuxBus, FxBus } from 'soundcraft-ui-connection';

export function getMasterChannel(source: MasterBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.input(channel);
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

export function getAuxChannel(source: AuxBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.input(channel);
    case 'p':
      return source.player(channel);
    case 'f':
      return source.fx(channel);
    default:
    case 'i':
      return source.input(channel);
  }
}

export function getFxChannel(source: FxBus, type: ChannelType, channel: number) {
  switch (type) {
    case 'l':
      return source.input(channel);
    case 'p':
      return source.player(channel);
    case 's':
      return source.sub(channel);
    default:
    case 'i':
      return source.input(channel);
  }
}
