import { type CompanionFeedbackInfo, InstanceBase } from '@companion-module/base'
import { Subject, Observable, takeUntil, filter } from 'rxjs'

import type { UiSchema } from './schema.js'
import type { UiFeedbackSchemas } from './feedback.js'

interface UiFeedbackSubscription {
	state: unknown
	feedbacks: Map<string, string>
}

export class UiFeedbackStore {
	private feedbackUnsubscribe$ = new Subject<string | void>()

	/** Internal map of all subscriptions, current state and connected feedbacks */
	private subscriptions = new Map<string, UiFeedbackSubscription>()

	/** Simple inverted map of feedback IDs to stream IDs for faster lookup */
	private feedbackStreamMap = new Map<string, string>() // <FeedbackId, StreamId>

	constructor(private instance: InstanceBase<UiSchema>) {}

	/**
	 * Register a stream of feedback values from the mixer.
	 * Must be called from the feedback callback to connect the mixer state with companion.
	 * The stream will be subscribed until we call `unsubscribeFeedback` with the internal feedback ID.
	 * @param evt The feedback metadata from Companion
	 * @param stream$ The observable stream of values for this feedback
	 * @param streamId Internal identifier for the stream. Used to group multiple subscriptions to the same stream
	 */
	connect(evt: CompanionFeedbackInfo, stream$: Observable<unknown>, streamId: string): void {
		// already subscribed to this stream, nothing to do
		if (this.feedbackStreamMap.get(evt.id) === streamId) {
			return
		}

		// Stream changed (e.g. options were updated): unsubscribe the old stream
		// before re-connecting. No-op if this is the first connect.
		this.unsubscribe(evt.id)

		// if there is NO subscription to this observable yet,
		// create an entry and subscribe the stream
		if (!this.subscriptions.get(streamId)) {
			const sub = {
				state: null,
				feedbacks: new Map<string, string>(),
			}
			this.subscriptions.set(streamId, sub)

			const unsubscribe$ = this.feedbackUnsubscribe$.pipe(filter((sid) => sid === streamId || !sid))
			stream$.pipe(takeUntil(unsubscribe$)).subscribe((state) => this.handleStateUpdate(streamId, state))
		}

		// register new feedback subscription
		this.addFeedbackSubscription(streamId, evt.id, evt.feedbackId)
	}

	/**
	 * Get the current value for a given feedback ID
	 * @param feedbackId Internal ID of the feedback
	 */
	get(feedbackId: string): unknown {
		const streamId = this.feedbackStreamMap.get(feedbackId)
		return streamId && this.subscriptions.get(streamId)?.state
	}

	/**
	 * Unsubscribe the mixer feedback stream for a given feedback ID
	 * @param feedbackId Internal ID of the feedback
	 */
	unsubscribe(feedbackId: string): void {
		const streamId = this.feedbackStreamMap.get(feedbackId)
		if (!streamId) {
			return
		}

		const sub = this.subscriptions.get(streamId)
		if (!sub) {
			return
		}
		// remove feedback entry
		sub.feedbacks.delete(feedbackId)
		this.feedbackStreamMap.delete(feedbackId)

		// if no entries left, remove whole subscription
		if (sub.feedbacks.size === 0) {
			this.feedbackUnsubscribe$.next(streamId)
			this.subscriptions.delete(streamId)
		}
	}

	/**
	 * Unsubscribe all mixer feedback streams
	 */
	unsubscribeAll(): void {
		this.feedbackUnsubscribe$.next()
		this.subscriptions.clear()
		this.feedbackStreamMap.clear()
		this.instance.log('debug', 'Unsubscribing all feedback streams')
	}

	/**
	 * Handle updated state values from the subscribed streams
	 * @param streamId
	 * @param value the new state value
	 */
	private handleStateUpdate(streamId: string, value: unknown): void {
		// change state value
		this.setState(streamId, value)

		// get distinct feedback types for this streamId and refresh them
		this.getFeedbackIds(streamId).forEach((fb) => {
			this.instance.checkFeedbacks(fb as keyof UiFeedbackSchemas)
		})
	}

	/**
	 * Get distinct list of all feedback types for a given stream ID.
	 * Used to update feedbacks accordingly when the state changes.
	 * @param streamId
	 */
	private getFeedbackIds(streamId: string): string[] {
		const feedbacks = this.subscriptions.get(streamId)?.feedbacks
		if (!feedbacks) {
			return []
		}

		return Array.from(new Set(feedbacks.values()))
	}

	/**
	 * Set the state for a given stream ID, assuming that the subscription entry already exists
	 * @param streamId
	 */
	private setState(streamId: string, state: unknown): void {
		const sub = this.subscriptions.get(streamId)
		if (!sub) {
			return
		}

		sub.state = state
	}

	/**
	 * Add one feedback subscription to the map, assuming that the general subscription entry already exists
	 * @param streamId
	 * @param feedbackUniqueId
	 * @param feedbackId
	 */
	private addFeedbackSubscription(streamId: string, feedbackUniqueId: string, feedbackId: string): void {
		const sub = this.subscriptions.get(streamId)
		if (!sub) {
			return
		}

		sub.feedbacks.set(feedbackUniqueId, feedbackId)
		this.feedbackStreamMap.set(feedbackUniqueId, streamId)
	}
}
