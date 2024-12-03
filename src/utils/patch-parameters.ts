import type { DropdownChoice } from '@companion-module/base'
import { createRangeArray } from './utils.js'

/** PATCH SOURCES */
export const patchSources: DropdownChoice[] = [
	{ id: 'none', label: 'None' },

	// HW INS
	...createRangeArray(20, (i) => ({ id: `hw.${i}`, label: `HW INS: ${i + 1}` })),
	{ id: 'li.0', label: 'HW INS: LI L' },
	{ id: 'li.1', label: 'HW INS: LI R' },

	// USB-A
	...createRangeArray(22, (i) => ({ id: `ua.${i}`, label: `USB-A: ${i + 1}` })),

	// USB-DAW
	...createRangeArray(32, (i) => ({ id: `ub.${i}`, label: `USB-DAW: ${i + 1}` })),

	// CASCADE INS
	...createRangeArray(32, (i) => ({ id: `cs.${i}`, label: `CASCADE INS: ${i + 1}` })),

	// MASTERS
	{ id: 'm.0', label: 'MASTERS: ML' },
	{ id: 'm.1', label: 'MASTERS: MR' },
	...createRangeArray(10, (i) => ({ id: `a.${i}`, label: `MASTERS: A${i + 1}` })),
	{ id: 'hp.0', label: 'MASTERS: HD1L' },
	{ id: 'hp.1', label: 'MASTERS: HD1R' },
	{ id: 'hp.2', label: 'MASTERS: HD2L' },
	{ id: 'hp.3', label: 'MASTERS: HD2R' },
]

/** PATCH DESTINATIONS */
export const patchDestinations: DropdownChoice[] = [
	// CHANNELS
	...createRangeArray(24, (i) => ({ id: `i.${i}.src`, label: `CHANNELS: ${i + 1}` })),
	{ id: 'l.0.src', label: 'CHANNELS: LINE IN L' },
	{ id: 'l.1.src', label: 'CHANNELS: LINE IN R' },

	// HW OUTS
	{ id: 'hwoutm.0.src', label: 'HW OUTS: MASTER L' },
	{ id: 'hwoutm.1.src', label: 'HW OUTS: MASTER R' },
	...createRangeArray(8, (i) => ({ id: `hwoutaux.${i}.src`, label: `HW OUTS: AUX ${i + 1}` })),
	{ id: 'hwouthp.0.src', label: 'HW OUTS: H1L' },
	{ id: 'hwouthp.1.src', label: 'HW OUTS: H1R' },
	{ id: 'hwouthp.2.src', label: 'HW OUTS: H2L' },
	{ id: 'hwouthp.3.src', label: 'HW OUTS: H2R' },

	// CASCADE OUTS
	...createRangeArray(32, (i) => ({ id: `casc.${i}.src`, label: `CASCADE OUTS: SLOT ${i + 1}` })),

	// SOUNDCHECK
	...createRangeArray(24, (i) => ({ id: `i.${i}.scsrc`, label: `SOUNDCHECK: CH ${i + 1}` })),
	{ id: 'l.0.scsrc', label: 'SOUNDCHECK: LINE IN L' },
	{ id: 'l.1.scsrc', label: 'SOUNDCHECK: LINE IN R' },
]
