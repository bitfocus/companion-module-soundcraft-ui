export type NoOpts = Record<string, never>
export type MasterChannelOpts = { channelType: string; channel: number }
export type AuxChannelOpts = { bus: number; channelType: string; channel: number }
export type FxChannelOpts = { bus: number; channelType: string; channel: number }
export type FadeOpts = { value: number; fadeTime: number; easing: number }
