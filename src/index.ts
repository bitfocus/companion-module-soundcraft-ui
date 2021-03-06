import InstanceSkel = require('../../../instance_skel');
import { CompanionConfigField, CompanionStaticUpgradeScript, CompanionSystem } from '../../../instance_skel_types';
import { SoundcraftUI, ConnectionStatus, ConnectionErrorEvent } from 'soundcraft-ui-connection';
import { GetActionsList } from './actions';
import { GetConfigFields, UiConfig } from './config';
import { GetFeedbacksList } from './feedback';
import { UiFeedbackState } from './state';
import { upgradeV2x0x0 } from './upgrades';

/**
 * Companion instance class for the Soundcraft Ui Mixers.
 */
class SoundcraftUiInstance extends InstanceSkel<UiConfig> {
  state = new UiFeedbackState(this);
  conn!: SoundcraftUI;

  constructor(system: CompanionSystem, id: string, config: UiConfig) {
    super(system, id, config);
  }

  static GetUpgradeScripts(): CompanionStaticUpgradeScript[] {
    return [upgradeV2x0x0];
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public init(): void {
    this.status(this.STATUS_UNKNOWN);
    this.createConnection();
  }

  /**
   * Create new mixer connection object,
   * start connection and set things up
   */
  private createConnection(): void {
    if (this.config.host) {
      this.conn = new SoundcraftUI(this.config.host);
      this.conn.connect();

      this.subscribeConnectionStatus();
      this.updateCompanionBits();
    }
  }

  /**
   * Consume the status of the connection and map it to companion status flags
   */
  private subscribeConnectionStatus(): void {
    if (!this.conn) {
      return;
    }

    this.conn.status$.subscribe(status => {
      switch (status.type) {
        case ConnectionStatus.Opening:
          this.status(this.STATUS_WARNING, 'Connecting');
          break;
        case ConnectionStatus.Error:
          this.status(this.STATUS_ERROR, (status as ConnectionErrorEvent).payload.message);
          break;
        case ConnectionStatus.Open:
          this.status(this.STATUS_OK);
          break;
        case ConnectionStatus.Close:
          this.status(this.STATUS_ERROR, 'Disconnected');
          break;
      }
    });
  }

  /**
   * set up all companion specific things for this module
   * such as actions, feedback and presets.
   */
  private updateCompanionBits(): void {
    this.setActions(GetActionsList(this, this.conn));
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.state, this.conn));
    this.subscribeFeedbacks();
  }

  /**
   * Process an updated configuration array.
   */
  public updateConfig(config: UiConfig): void {
    const oldConfig = this.config;
    this.config = config;

    // if host has changed, reconnect
    if (config.host && oldConfig.host !== config.host) {
      this.conn && this.conn.disconnect();
      this.createConnection();
    }
  }

  /**
   * Create the configuration fields for web config.
   */
  // eslint-disable-next-line @typescript-eslint/camelcase
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields(this);
  }

  /**
   * Clean up the instance before it is destroyed.
   */
  public destroy(): void {
    this.state.unsubscribeAll();

    this.conn && this.conn.disconnect();
  }
}

export = SoundcraftUiInstance;
