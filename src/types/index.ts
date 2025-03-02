/**
 * The type representing different noise generation algorithms.
 * The available noise types are:
 * - `perlin`
 * - `simplex`
 * - `worley`
 * - `value`
 */
export type NoiseType = 'perlin' | 'simplex' | 'worley' | 'value';

/**
 * The interface for the settings used in the noise generation.
 * This includes properties like noise type, color settings, dimensions, opacity, and more.
 */
export interface NoiseSettings {
	/**
	 * The type of noise generation to be used. Can be 'perlin', 'simplex', 'worley', or 'value'.
	 */
	noiseType: NoiseType;

	/**
	 * The list of colors used in the noise generation, represented as an array of color strings.
	 */
	colors: string[];

	/**
	 * The width of the noise canvas in pixels.
	 */
	width: number;

	/**
	 * The height of the noise canvas in pixels.
	 */
	height: number;

	/**
	 * The opacity of the noise. A value between 0 and 1.
	 */
	noiseOpacity: number;

	/**
	 * The scale of the noise. Controls the "zoom" level of the noise pattern.
	 */
	noiseScale: number;

	/**
	 * The speed of the animation, affecting how fast the noise changes over time.
	 */
	animationSpeed: number;
}

/**
 * The props for the SettingsPanel component, used to manage and display the noise settings.
 */
export interface SettingsPanelProps {
	/**
	 * The current settings for the noise generation.
	 * These settings control various aspects of how the noise is generated and displayed.
	 */
	settings: NoiseSettings;

	/**
	 * A callback function to update the noise settings.
	 * This function is called when the settings are changed by the user.
	 * @param settings The new settings object.
	 */
	onSettingsChange: (settings: NoiseSettings) => void;

	/**
	 * A callback function to export the generated noise image as a PNG.
	 * This function is typically called when the user clicks an export button.
	 */
	onExport: () => void;
}
