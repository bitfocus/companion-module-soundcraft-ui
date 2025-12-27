import { InstanceBase } from '@companion-module/base'
import { bufferTime, filter, map, mergeMap, Observable, Subject, takeUntil } from 'rxjs'

import { type UiConfig } from './config.js'

export class UiVariablesStore {
	private variableStreams$ = new Subject<{ variableId: string; stream$: Observable<string | number> }>()
	private destroyVariableStreams$ = new Subject<void>()
	private destroy$ = new Subject<void>()

	constructor(private instance: InstanceBase<UiConfig>) {
		// Subscribe to all variable streams and batch update Companion variables
		this.variableStreams$
			.pipe(
				mergeMap(({ variableId, stream$ }) => {
					return stream$.pipe(
						map((value) => ({ variableId, value })),
						takeUntil(this.destroyVariableStreams$),
					)
				}),
				bufferTime(100), // buffer timeframe for batch updates
				filter((updates) => updates.length > 0),
				map((updates) =>
					updates.reduce(
						(acc, curr) => {
							acc[curr.variableId] = curr.value
							return acc
						},
						{} as Record<string, string | number>,
					),
				),
				takeUntil(this.destroy$),
			)
			.subscribe((variableValues) => instance.setVariableValues(variableValues))
	}

	/**
	 * Register a stream of variable values.
	 * @param variableId ID of the variable to update
	 * @param stream$ The observable stream of values for this variable
	 */
	connect(variableId: string, stream$: Observable<string | number>): void {
		this.variableStreams$.next({ variableId, stream$ })
	}

	/**
	 * Unsubscribe all variable streams
	 */
	unsubscribeAll(): void {
		this.instance.log('debug', 'Unsubscribing all variable streams')
		this.destroyVariableStreams$.next()
	}

	/**
	 * Destroy the variables store
	 */
	destroy(): void {
		this.destroy$.next()
	}
}
