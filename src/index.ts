import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { SoundcraftUI, ConnectionStatus, ConnectionErrorEvent } from 'soundcraft-ui-connection'

import { GetActionsList } from './actions'
import { instanceConfigFields, UiConfig } from './config'
import { GetFeedbacksList } from './feedback'
import { UiFeedbackState } from './state'
import { upgradeLegacyFeedbackToBoolean } from './upgrades'

/**
 * Companion instance class for the Soundcraft Ui Mixers.
 */
class SoundcraftUiInstance extends InstanceBase<UiConfig> {
	private state = new UiFeedbackState(this)
	private conn?: SoundcraftUI
	private config: UiConfig = {}

	constructor(internal: unknown) {
		super(internal)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	async init(_config: UiConfig): Promise<void> {
		this.log('debug', 'HALLO WELT')
		// this.updateStatus(InstanceStatus.Disconnected)
		// this.createConnection(config)
		// await this.configUpdated(config)
	}

	/**
	 * Create new mixer connection object,
	 * start connection and set things up
	 */
	private createConnection(config: UiConfig): void {
		if (config.host) {
			this.conn = new SoundcraftUI(config.host)
			this.conn.connect()

			this.subscribeConnectionStatus()
			this.updateCompanionBits()
		}
	}

	/**
	 * Consume the status of the connection and map it to companion status flags
	 */
	private subscribeConnectionStatus(): void {
		if (!this.conn) {
			return
		}

		this.conn.status$.subscribe((status) => {
			switch (status.type) {
				case ConnectionStatus.Opening:
					this.updateStatus(InstanceStatus.Connecting)
					break
				case ConnectionStatus.Error:
					this.updateStatus(InstanceStatus.ConnectionFailure, (status as ConnectionErrorEvent).payload.message)
					break
				case ConnectionStatus.Open:
					this.updateStatus(InstanceStatus.Ok)
					break
				case ConnectionStatus.Close:
					this.updateStatus(InstanceStatus.Disconnected)
					break
			}
		})
	}

	/**
	 * set up all companion specific things for this module
	 * such as actions, feedback and presets.
	 */
	private updateCompanionBits(): void {
		if (!this.conn) {
			this.updateStatus(InstanceStatus.ConnectionFailure)
			return
		}

		this.setActionDefinitions(GetActionsList(this.conn))
		this.setFeedbackDefinitions(GetFeedbacksList(this.state, this.conn))
		this.subscribeFeedbacks()
	}

	/**
	 * Process an updated configuration array.
	 */
	async configUpdated(config: UiConfig): Promise<void> {
		const oldConfig = this.config
		this.config = config

		// if host has changed, reconnect
		if (config.host && oldConfig?.host !== config.host) {
			console.log('RECONNECT AFTER CONFIG CHANGE')
			this.conn?.disconnect()
			this.createConnection(config)
		}
	}

	/**
	 * Create the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return instanceConfigFields
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	async destroy(): Promise<void> {
		this.log('debug', 'DESTROY')
		this.state.unsubscribeAll()
		this.conn?.disconnect()
	}
}

runEntrypoint(SoundcraftUiInstance, [upgradeLegacyFeedbackToBoolean])
