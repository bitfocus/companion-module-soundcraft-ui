import InstanceSkel = require('../../../instance_skel');
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types';
import { SoundcraftUI } from 'soundcraft-ui-connection';
import { GetActionsList } from './actions';
import { GetConfigFields, UiConfig } from './config';
import { GetFeedbacksList } from './feedback';
import { UiFeedbackState } from './state';

/**
 * Companion instance class for the Soundcraft Ui Mixers.
 */
class SoundcraftUiInstance extends InstanceSkel<UiConfig> {
  state = new UiFeedbackState(this);
  conn!: SoundcraftUI;

  constructor(system: CompanionSystem, id: string, config: UiConfig) {
    super(system, id, config);
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public init(): void {
    if (this.config.host) {
      this.conn = new SoundcraftUI(this.config.host);
      this.conn.connect();
      console.log('CONNECT!!');
      this.updateCompanionBits();
    }
  }

  private updateCompanionBits(): void {
    this.setActions(GetActionsList(this.conn));
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.state, this.conn));
    this.subscribeFeedbacks();
  }

  /**
   * Process an updated configuration array.
   */
  public updateConfig(config: UiConfig): void {
    // if host has changed, reconnect
    if (this.config.host !== config.host) {
      this.conn.disconnect();
      this.conn = new SoundcraftUI(config.host);
      this.conn.connect();
      this.updateCompanionBits();
    }

    this.config = config;
  }

  /**
   * Creates the configuration fields for web config.
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

    if (this.conn) {
      this.conn.disconnect();
    }
  }
}

export = SoundcraftUiInstance;
