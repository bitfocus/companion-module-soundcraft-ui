import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const baseConfig = await generateEslintConfig({
	enableTypescript: true,
})

const customConfig = [
	...baseConfig,
	{
		rules: {
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'n/no-missing-import': 'off',
		},
	},
]

export default customConfig
