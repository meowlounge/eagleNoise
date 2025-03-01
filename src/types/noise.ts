export type NoiseType = 'perlin' | 'simplex' | 'worley' | 'value';

export interface NoiseSettings {
	noiseType: NoiseType;
	colors: string[];
	width: number;
	height: number;
	noiseOpacity: number;
	noiseScale: number;
	animationSpeed: number;
}

export interface SettingsPanelProps {
  settings: NoiseSettings;
  onSettingsChange: (settings: NoiseSettings) => void;
  onExport: () => void;
}