const tseslint = require('typescript-eslint');
const jsxA11y = require('eslint-plugin-jsx-a11y');

module.exports = tseslint.config(
	{
		ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'coverage/**'],
	},
	{
		files: ['**/*.{ts,tsx,mts,cts}'],
		extends: [...tseslint.configs.recommended],
	},
	{
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		// "strict" en vez de "recommended": mismo plugin/languageOptions, pero
		// con los defaults más estrictos en las reglas que los soportan
		// (ej. no-static-element-interactions, no-interactive-element-to-
		// noninteractive-role sin las excepciones que trae "recommended").
		...jsxA11y.flatConfigs.strict,
		rules: {
			...jsxA11y.flatConfigs.strict.rules,
			// Reglas del plugin que ni "recommended" ni "strict" activan por
			// defecto, pero que sí aportan valor real:
			'jsx-a11y/control-has-associated-label': 'error',
			'jsx-a11y/no-aria-hidden-on-focusable': 'error',
			'jsx-a11y/lang': 'error',
			'jsx-a11y/prefer-tag-over-role': 'warn',
		},
		settings: {
			// Sin este mapeo, las reglas de jsx-a11y nunca disparan en este
			// proyecto: por defecto solo reconocen tags HTML en minúscula
			// (img, a, input...), y los componentes de React Native son
			// PascalCase. Se mapean a su equivalente web más cercano para
			// que las reglas relevantes (alt-text, etc.) tengan efecto real.
			'jsx-a11y': {
				components: {
					Image: 'img',
					Pressable: 'button',
					TouchableOpacity: 'button',
					TouchableHighlight: 'button',
					TouchableWithoutFeedback: 'button',
					TextInput: 'input',
				},
			},
		},
	}
);
