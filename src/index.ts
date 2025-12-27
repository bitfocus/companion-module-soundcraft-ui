import { InstanceBase, InstanceStatus, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { SoundcraftUI, ConnectionStatus, type ConnectionErrorEvent } from 'soundcraft-ui-connection'

import { GetActionsList } from './actions.js'
import { instanceConfigFields, type UiConfig } from './config.js'
import { GetFeedbacksList } from './feedback.js'
import { UiFeedbackStore } from './feedback-store.js'
import { upgradeLegacyFeedbackToBoolean, upgradeV2x0x0 } from './upgrades.js'

/**
 * Companion instance class for the Soundcraft Ui Mixers.
 */
class SoundcraftUiInstance extends InstanceBase<UiConfig> {
	private feedbackStore = new UiFeedbackStore(this)
	private conn?: SoundcraftUI

	constructor(internal: unknown) {
		super(internal)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	async init(config: UiConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Disconnected)
		void this.createConnection(config)
	}

	/**
	 * Create new mixer connection object,
	 * start connection and set things up
	 */
	private async createConnection(config: UiConfig) {
		if (config.host) {
			this.conn = new SoundcraftUI(config.host)
			this.subscribeConnectionStatus()

			try {
				await this.conn.connect()
			} catch (e) {
				this.updateStatus(InstanceStatus.ConnectionFailure, JSON.stringify(e))
			}

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
					this.updateStatus(InstanceStatus.ConnectionFailure, JSON.stringify((status as ConnectionErrorEvent).payload))
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
		this.setFeedbackDefinitions(GetFeedbacksList(this.feedbackStore, this.conn))
		this.subscribeFeedbacks()
	}

	/**
	 * Process an updated configuration array.
	 */
	async configUpdated(config: UiConfig): Promise<void> {
		if (this.conn) {
			// TODO: use real connection status and disconnect when connection is open
			// currently blocked in connection lib
			/*if (status.type === ConnectionStatus.Open) {
				console.log('disconnecting from mixer')
				await this.conn.disconnect()
			}*/
			void this.conn.disconnect()
		}
		void this.createConnection(config)
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
		this.state.unsubscribeAll()
		if (this.conn) {
			await this.conn.disconnect()
		}
	}
}

runEntrypoint(SoundcraftUiInstance, [upgradeV2x0x0, upgradeLegacyFeedbackToBoolean])
