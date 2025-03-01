/**
 * Checks the user's preferred color scheme (Dark or Light mode) and applies the corresponding class to the `body` element.
 * This function also listens for changes in the system's color scheme preference and updates the theme dynamically.
 *
 * @remarks
 * This function checks if `window.matchMedia` is available (i.e., runs only on the client-side), and if so,
 * it will add or remove the `dark` class based on the user's system preference.
 * It also adds an event listener to handle changes in the user's color scheme preference.
 *
 * @throws {Error} Throws an error if `window.matchMedia` is not available (e.g., during SSR).
 */
export const checkDarkMode = () => {
	if (typeof window === 'undefined' || !window.matchMedia) {
		console.error(
			'window.matchMedia is not available in this environment.'
		);
		return;
	}

	try {
		const isDarkMode = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches;

		if (isDarkMode) {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', (e) => {
				if (e.matches) {
					document.body.classList.add('dark');
				} else {
					document.body.classList.remove('dark');
				}
			});
	} catch (error) {
		console.error('Error while checking or applying dark mode:', error);
	}
};
