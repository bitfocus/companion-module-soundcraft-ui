import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList } from './actions';
import { GetConfigFields, UiConfig } from './config';
import { GetFeedbacksList } from './feedback';
import { UiFeedbackState } from './state';

/**
 * Companion instance class for the Soundcraft Ui Mixers.
 */
class SoundcraftUiInstance extends InstanceSkel<UiConfig> {

  state = new UiFeedbackState(this);

  constructor(system: CompanionSystem, id: string, config: UiConfig) {
    super(system, id, config);
    this.init();
  }


  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public init(): void {
    this.setActions(GetActionsList(this));
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.state));
    this.subscribeFeedbacks();
  }

  /**
   * Process an updated configuration array.
   */
  public updateConfig(config: UiConfig): void {
    this.config = config;
  }

  /**
   * Creates the configuration fields for web config.
   */
  // eslint-disable-next-line @typescript-eslint/camelcase
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields(this)
  }

  /**
   * Clean up the instance before it is destroyed.
   */
  public destroy(): void {
    
  }

 


}

export = SoundcraftUiInstance
