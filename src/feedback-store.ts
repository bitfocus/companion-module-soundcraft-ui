import { InstanceBase } from '@companion-module/base'
import { Subject, Observable, takeUntil, filter } from 'rxjs'

import type { UiSchema } from './schema.js'

export class UiFeedbackStore {
	private feedbackUnsubscribe$ = new Subject<string | void>()

	/** Latest value per stream */
	private streamStates = new Map<string, unknown>()

	/** Which feedback unique IDs use each stream (for checkFeedbacksById) */
	private streamFeedbackIds = new Map<string, Set<string>>()

	/** Reverse lookup: feedback unique ID => stream ID (for unsubscribe) */
	private feedbackStreamMap = new Map<string, string>()

	constructor(private instance: InstanceBase<UiSchema>) {}

	/**
	 * Register a stream of feedback values from the mixer.
	 * Must be called from the feedback callback to connect the mixer state with companion.
	 * The stream will be subscribed until we call `unsubscribe` with the feedback ID.
	 * @param feedbackId The unique feedback ID from Companion
	 * @param stream$ The observable stream of values for this feedback
	 * @param streamId Internal identifier for the stream. Used to group multiple subscriptions to the same stream
	 */
	ensureSubscription(feedbackId: string, stream$: Observable<unknown>, streamId: string): void {
		// feedback is already connected to this stream, nothing to do
		if (this.feedbackStreamMap.get(feedbackId) === streamId) {
			return
		}

		// Stream changed (e.g. options were updated):
		// unsubscribe the old stream before re-connecting.
		// No-op if this is the first connect.
		this.unsubscribe(feedbackId)

		// register feedback in tracking maps
		this.feedbackStreamMap.set(feedbackId, streamId)

		let feedbackIds = this.streamFeedbackIds.get(streamId)
		if (!feedbackIds) {
			feedbackIds = new Set<string>()
			this.streamFeedbackIds.set(streamId, feedbackIds)
		}
		feedbackIds.add(feedbackId)

		// subscribe to stream if not yet subscribed
		if (!this.streamStates.has(streamId)) {
			this.streamStates.set(streamId, undefined)

			const unsubscribe$ = this.feedbackUnsubscribe$.pipe(filter((sid) => sid === streamId || !sid))
			stream$.pipe(takeUntil(unsubscribe$)).subscribe((state) => this.handleStateUpdate(streamId, state))
		}
	}

	/**
	 * Get the current state for a given stream ID.
	 * @param streamId Internal identifier of the stream
	 */
	getState<T = unknown>(streamId: string): T | undefined {
		return this.streamStates.get(streamId) as T | undefined
	}

	/**
	 * Get the current state for a given stream ID as a boolean.
	 * @param streamId Internal identifier of the stream
	 */
	getBooleanState(streamId: string): boolean {
		return !!this.getState(streamId)
	}

	/**
	 * Unsubscribe the mixer feedback stream for a given feedback ID
	 * @param feedbackId Internal unique ID of the feedback
	 */
	unsubscribe(feedbackId: string): void {
		const streamId = this.feedbackStreamMap.get(feedbackId)
		if (!streamId) {
			return
		}

		this.feedbackStreamMap.delete(feedbackId)

		const feedbackIds = this.streamFeedbackIds.get(streamId)
		if (feedbackIds) {
			feedbackIds.delete(feedbackId)
			// if no feedback uses the stream anymore, unsubscribe from the stream completely
			if (feedbackIds.size === 0) {
				this.feedbackUnsubscribe$.next(streamId)
				this.streamStates.delete(streamId)
				this.streamFeedbackIds.delete(streamId)
			}
		}
	}

	/**
	 * Unsubscribe all mixer feedback streams
	 */
	unsubscribeAll(): void {
		this.feedbackUnsubscribe$.next()
		this.streamStates.clear()
		this.streamFeedbackIds.clear()
		this.feedbackStreamMap.clear()
		this.instance.log('debug', 'Unsubscribing all feedback streams')
	}

	/**
	 * Handle updated state values from the subscribed streams
	 * @param streamId
	 * @param value the new state value
	 */
	private handleStateUpdate(streamId: string, value: unknown): void {
		// only update if the value has actually changed
		if (this.streamStates.get(streamId) === value) {
			return
		}

		this.streamStates.set(streamId, value)

		const feedbackIds = this.streamFeedbackIds.get(streamId)
		if (feedbackIds) {
			this.instance.checkFeedbacksById(...feedbackIds)
		}
	}
}
