import type { CompanionVariableDefinition } from '@companion-module/base'
import { playerTimeToString, type SoundcraftUI } from 'soundcraft-ui-connection'
import { firstValueFrom, map, Observable } from 'rxjs'

import type { UiVariablesStore } from './variables-store.js'

/** Map -Infinity to -100 for fader level representation */
function mapInfinityToNumber(value: number): number {
	return value === Number.NEGATIVE_INFINITY ? -100 : value
}

/** Convert PAN value to string representation (L 100 .. C .. R 100) */
function panValueToString(value: number): string {
	if (value === 0) {
		return 'L 100'
	} else if (value === 1) {
		return 'R 100'
	} else if (value === 0.5) {
		return 'C'
	} else if (value > 0.5) {
		const right = Math.round((value - 0.5) * 200)
		return `R ${right}`
	} else {
		const left = Math.round((0.5 - value) * 200)
		return `L ${left}`
	}
}

export async function createVariables(
	store: UiVariablesStore,
	conn: SoundcraftUI,
): Promise<CompanionVariableDefinition[]> {
	const variables: CompanionVariableDefinition[] = []

	// Helper to add variable and connect stream. Closure to capture `variables` and `store`
	function addVar(data: { id: string; name: string }, stream: Observable<string | number>) {
		variables.push({ variableId: data.id, name: data.name })
		store.connect(data.id, stream)
	}

	const capabilities = await firstValueFrom(conn.deviceInfo.capabilities$)

	/****** Master ******/
	addVar(
		{ id: 'm_level', name: 'Master: Fader Level (dB)' },
		conn.master.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
	)

	/****** Shows ******/
	addVar({ id: 'show_show', name: 'Shows: Current Show' }, conn.shows.currentShow$)
	addVar({ id: 'show_snapshot', name: 'Shows: Current Snapshot' }, conn.shows.currentSnapshot$)
	addVar({ id: 'show_cue', name: 'Shows: Current Cue' }, conn.shows.currentCue$)

	/****** Player ******/
	addVar({ id: 'player_track', name: 'Player: Track' }, conn.player.track$)

	addVar({ id: 'player_playlist', name: 'Player: Playlist' }, conn.player.playlist$)

	addVar(
		{ id: 'player_elapsed', name: 'Player: Time Elapsed' },
		conn.player.elapsedTime$.pipe(map((v) => playerTimeToString(v))),
	)

	addVar(
		{ id: 'player_length', name: 'Player: Track Length' },
		conn.player.length$.pipe(map((v) => playerTimeToString(v))),
	)

	addVar(
		{ id: 'player_remaining', name: 'Player: Time Remaining' },
		conn.player.remainingTime$.pipe(map((v) => playerTimeToString(v))),
	)

	/****** Multitrack Recording ******/
	if (capabilities.multitrack) {
		addVar({ id: 'mtk_session', name: 'Multitrack: Session' }, conn.recorderMultiTrack.session$)
		addVar(
			{ id: 'mtk_length', name: 'Multitrack: Session Length' },
			conn.recorderMultiTrack.length$.pipe(map((v) => playerTimeToString(v))),
		)
		addVar(
			{ id: 'mtk_elapsed', name: 'Multitrack: Time Elapsed' },
			conn.recorderMultiTrack.elapsedTime$.pipe(map((v) => playerTimeToString(v))),
		)
		addVar(
			{ id: 'mtk_remaining', name: 'Multitrack: Time Remaining' },
			conn.recorderMultiTrack.remainingTime$.pipe(map((v) => playerTimeToString(v))),
		)
		addVar(
			{ id: 'mtk_rectime', name: 'Multitrack: Time Recording' },
			conn.recorderMultiTrack.recordingTime$.pipe(map((v) => playerTimeToString(v))),
		)
	}

	/****** Input Channels ******/
	for (let i = 1; i <= capabilities.input; i++) {
		const channel = conn.master.input(i)
		// Fader Level
		addVar(
			{ id: `m_input${i}_level`, name: `[Master Bus] Input ${i}: Fader Level (dB)` },
			channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_input${i}_name`, name: `[Master Bus] Input ${i}: Name` }, channel.name$)

		// PAN
		addVar(
			{ id: `m_input${i}_pan`, name: `[Master Bus] Input ${i}: PAN` },
			channel.pan$.pipe(map((v) => panValueToString(v))),
		)
	}

	/****** Line Channels ******/
	for (let i = 1; i <= capabilities.line; i++) {
		const channel = conn.master.line(i)
		// Fader Level
		addVar(
			{ id: `m_line${i}_level`, name: `[Master Bus] Line ${i}: Fader Level (dB)` },
			channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_line${i}_name`, name: `[Master Bus] Line ${i}: Name` }, channel.name$)

		// PAN
		addVar(
			{ id: `m_line${i}_pan`, name: `[Master Bus] Line ${i}: PAN` },
			channel.pan$.pipe(map((v) => panValueToString(v))),
		)
	}

	/****** Player Channels ******/
	for (let i = 1; i <= capabilities.player; i++) {
		const channel = conn.master.player(i)
		// Fader Level
		addVar(
			{ id: `m_player${i}_level`, name: `[Master Bus] Player ${i}: Fader Level (dB)` },
			channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_player${i}_name`, name: `[Master Bus] Player ${i}: Name` }, channel.name$)

		// PAN
		addVar(
			{ id: `m_player${i}_pan`, name: `[Master Bus] Player ${i}: PAN` },
			channel.pan$.pipe(map((v) => panValueToString(v))),
		)
	}

	/****** Subgroups ******/
	for (let i = 1; i <= capabilities.sub; i++) {
		const channel = conn.master.sub(i)
		// Fader Level
		addVar(
			{ id: `m_sub${i}_level`, name: `[Master Bus] Subgroup ${i}: Fader Level (dB)` },
			channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_sub${i}_name`, name: `[Master Bus] Subgroup ${i}: Name` }, channel.name$)

		// PAN
		addVar(
			{ id: `m_sub${i}_pan`, name: `[Master Bus] Subgroup ${i}: PAN` },
			channel.pan$.pipe(map((v) => panValueToString(v))),
		)
	}

	/****** VCA ******/
	for (let i = 1; i <= capabilities.vca; i++) {
		// Fader Level
		addVar(
			{ id: `m_vca${i}_level`, name: `[Master Bus] VCA ${i}: Fader Level (dB)` },
			conn.master.vca(i).faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_vca${i}_name`, name: `[Master Bus] VCA ${i}: Name` }, conn.master.vca(i).name$)
	}

	/****** FX Channels/Buses ******/
	for (let fi = 1; fi <= capabilities.fx; fi++) {
		const fx = conn.master.fx(fi)
		// Fader Level
		addVar(
			{ id: `m_fx${fi}_level`, name: `[Master Bus] FX ${fi}: Fader Level (dB)` },
			fx.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_fx${fi}_name`, name: `[Master Bus] FX ${fi}: Name` }, fx.name$)

		// PAN
		addVar({ id: `m_fx${fi}_pan`, name: `[Master Bus] FX ${fi}: PAN` }, fx.pan$.pipe(map((v) => panValueToString(v))))

		// FX BUS CHANNELS
		const fxBus = conn.fx(fi)
		// FX: Input Channels
		for (let i = 1; i <= capabilities.input; i++) {
			const channel = fxBus.input(i)
			addVar(
				{ id: `fx${fi}_input${i}_level`, name: `[FX ${fi}] Input ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)
		}
		// FX: Line Channels
		for (let i = 1; i <= capabilities.line; i++) {
			const channel = fxBus.line(i)
			addVar(
				{ id: `fx${fi}_line${i}_level`, name: `[FX ${fi}] Line ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)
		}
		// FX: Player Channels
		for (let i = 1; i <= capabilities.player; i++) {
			const channel = fxBus.player(i)
			addVar(
				{ id: `fx${fi}_player${i}_level`, name: `[FX ${fi}] Player ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)
		}
		// FX: Subgroups
		for (let i = 1; i <= capabilities.sub; i++) {
			const channel = fxBus.sub(i)
			addVar(
				{ id: `fx${fi}_sub${i}_level`, name: `[FX ${fi}] Subgroup ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)
		}
	}

	/****** AUX channels/buses ******/
	for (let ai = 1; ai <= capabilities.aux; ai++) {
		const aux = conn.master.aux(ai)
		// Fader Level
		addVar(
			{ id: `m_aux${ai}_level`, name: `[Master Bus] AUX ${ai}: Fader Level (dB)` },
			aux.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
		)

		// Channel Name
		addVar({ id: `m_aux${ai}_name`, name: `[Master Bus] AUX ${ai}: Name` }, aux.name$)

		// AUX BUS CHANNELS
		const auxBus = conn.aux(ai)
		// AUX: Input Channels
		for (let i = 1; i <= capabilities.input; i++) {
			const channel = auxBus.input(i)
			// Fader Level
			addVar(
				{ id: `aux${ai}_input${i}_level`, name: `[AUX ${ai}] Input ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)

			// PAN
			addVar(
				{ id: `aux${ai}_input${i}_pan`, name: `[AUX ${ai}] Input ${i}: PAN` },
				channel.pan$.pipe(map((v) => panValueToString(v))),
			)
		}

		// AUX: Line Channels
		for (let i = 1; i <= capabilities.line; i++) {
			const channel = auxBus.line(i)
			// Fader Level
			addVar(
				{ id: `aux${ai}_line${i}_level`, name: `[AUX ${ai}] Line ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)

			// PAN
			addVar(
				{ id: `aux${ai}_line${i}_pan`, name: `[AUX ${ai}] Line ${i}: PAN` },
				channel.pan$.pipe(map((v) => panValueToString(v))),
			)
		}

		// AUX: Player Channels
		for (let i = 1; i <= capabilities.player; i++) {
			const channel = auxBus.player(i)
			// Fader Level
			addVar(
				{ id: `aux${ai}_player${i}_level`, name: `[AUX ${ai}] Player ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)

			// PAN
			addVar(
				{ id: `aux${ai}_player${i}_pan`, name: `[AUX ${ai}] Player ${i}: PAN` },
				channel.pan$.pipe(map((v) => panValueToString(v))),
			)
		}

		// AUX: FX Channels
		for (let i = 1; i <= capabilities.fx; i++) {
			const channel = auxBus.fx(i)
			// Fader Level
			addVar(
				{ id: `aux${ai}_fx${i}_level`, name: `[AUX ${ai}] FX ${i}: Fader Level (dB)` },
				channel.faderLevelDB$.pipe(map((v) => mapInfinityToNumber(v))),
			)

			// PAN
			addVar(
				{ id: `aux${ai}_fx${i}_pan`, name: `[AUX ${ai}] FX ${i}: PAN` },
				channel.pan$.pipe(map((v) => panValueToString(v))),
			)
		}
	}

	return variables
}
