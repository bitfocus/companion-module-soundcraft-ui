import InstanceSkel = require('../../../instance_skel');
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { CompanionFeedbackEvent } from '../../../instance_skel_types';
import { UiConfig } from './config';

export class UiFeedbackState {
  private feedbackUnsubscribe$ = new Subject<string>();
  private state: { [feedbackId: string]: any } = {};

  constructor(private instance: InstanceSkel<UiConfig>) {}

  /**
   * Register a stream of feedback values from the mixer.
   * Must be called from the feedback subscribe callback to connect the mixer state with companion.
   * The stream will be subscribed until we call `unsubscribeFeedback` with the internal feedback ID.
   * @param evt The feedback metadata from Companion
   * @param stream$ The observable stream of values for this feedback
   */
  connect(evt: CompanionFeedbackEvent, stream$: Observable<any>): void {
    const unsubscribe$ = this.feedbackUnsubscribe$.pipe(filter(fid => fid === evt.id || !fid));
    stream$.pipe(takeUntil(unsubscribe$)).subscribe(value => this.set(value, evt.id, evt.type));
  }

  /**
   * Set the state value for a feedback.
   * Only used internally after connecting a stream
   * @param value
   * @param feedbackId
   * @param feedbackType
   */
  private set(value: any, feedbackId: string, feedbackType?: string) {
    this.state[feedbackId] = value;
    this.instance.checkFeedbacks(feedbackType);
  }

  /**
   * Remove this feedback
   * @param feedbackId Internal ID of the feedback
   */
  private unset(feedbackId: string) {
    delete this.state[feedbackId];
  }

  /**
   * Get the current value for a given feedback ID
   * @param feedbackId Internal ID of the feedback
   */
  get(feedbackId: string) {
    return this.state[feedbackId];
  }

  /**
   * Unsubscribe the mixer feedback stream for a given feedback ID
   * @param feedbackId Internal ID of the feedback
   */
  unsubscribe(feedbackId: string) {
    this.feedbackUnsubscribe$.next(feedbackId);
    this.unset(feedbackId);
  }

  /**
   * Unsubscribe all mixer feedback streams
   */
  unsubscribeAll() {
    this.feedbackUnsubscribe$.next();
    this.state = {};
  }
}
