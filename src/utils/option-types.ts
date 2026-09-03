export type NoOpts = Record<string, never>
export type MasterChannelOpts = { channelType: string; channel: number }
export type AuxChannelOpts = { bus: number; channelType: string; channel: number }
export type FxChannelOpts = { bus: number; channelType: string; channel: number }
export type MatrixChannelOpts = { bus: number; channelType: string; channel: number }
export type VuOpts = { channelType: string; channel: number; point: string; side: string }
export type FadeOpts = { value: number; fadeTime: number; easing: number }
