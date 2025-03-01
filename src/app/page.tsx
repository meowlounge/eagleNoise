'use client';

import { useState, useRef, useEffect } from 'react';
import NoiseCanvas from '@/components/noise-generator/canvas';
import SettingsPanel from '@/components/noise-generator/settings-panel';
import * as THREE from 'three';
import { exportAsPNG } from '@/lib/exporters';
import type { NoiseSettings } from '@/types';
import { checkDarkMode } from '@/lib/darkmode';

export default function Home() {
	const [settings, setSettings] = useState<NoiseSettings>({
		noiseType: 'perlin',
		colors: ['#f54ba5', '#89296c', '#f11d77', '#ffd22a', '#95f96a'],
		width: 1000,
		height: 600,
		noiseOpacity: 0.08,
		noiseScale: 0.75,
		animationSpeed: 2,
	});

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const cameraRef = useRef<THREE.Camera | null>(null);
	const materialRef = useRef<THREE.ShaderMaterial | null>(null);

	useEffect(() => {
		checkDarkMode();
	}, []);

	return (
		<main className='flex min-h-screen flex-col lg:flex-row'>
			<div className='w-full lg:w-80 lg:border-r border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50 dark:text-neutral-100 dark:bg-neutral-950 flex-shrink-0'>
				<h1 className='text-2xl font-bold mb-6'>🦅 Noise</h1>
				<SettingsPanel
					settings={settings}
					onSettingsChange={setSettings}
					onExport={() =>
						exportAsPNG(canvasRef, rendererRef, sceneRef, cameraRef)
					}
				/>
			</div>

			<div className='flex-1 flex items-center justify-center bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-950 p-4 sm:p-8'>
				<div
					className='relative shadow-lg rounded-lg overflow-hidden flex items-center justify-center'
					style={{
						width: '100%',
						height: '100%',
						maxWidth: `${Math.min(settings.width, 1200)}px`,
						maxHeight: `${Math.min(settings.height, 800)}px`,
						aspectRatio: `${settings.width} / ${settings.height}`,
					}}>
					<NoiseCanvas
						settings={settings}
						canvasRef={canvasRef}
						sceneRef={sceneRef}
						rendererRef={rendererRef}
						cameraRef={cameraRef}
						materialRef={materialRef}
					/>
				</div>
			</div>
		</main>
	);
}
