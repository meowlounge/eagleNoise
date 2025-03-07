'use client';

import { useEffect, useRef, useState } from 'react';
import NoiseCanvas from '@/components/noise-generator/canvas';
import SettingsPanel from '@/components/noise-generator/settings-panel';
import ExportDialog from '@/components/noise-generator/export-dialog';
import * as THREE from 'three';
import type { NoiseSettings } from '@/types';
import { checkDarkMode } from '@/lib/darkmode';
import Image from 'next/image';

export default function Home() {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [settings, setSettings] = useState<NoiseSettings>({
		noiseType: 'perlin',
		colors: ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#ff8fab', '#fb6f92'],
		width: 1024,
		height: 512,
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
				<h1 className='text-2xl font-bold mb-6'>
					<a
						href='https://elink.vercel.app/prodbyeagle'
						target='_blank'
						rel='noopener noreferrer'>
						<Image
							width={32}
							height={32}
							src='https://kappa.lol/zTb0g'
							alt='Eagle Logo'
							className='inline-block mr-2 hover:scale-115 border duration-300 transition-all rounded-md'
						/>
					</a>
					noisegen
				</h1>

				<SettingsPanel
					settings={settings}
					onSettingsChange={setSettings}
					onExport={() => setIsOpen(true)}
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

			<ExportDialog
				onOpenChange={() => setIsOpen(false)}
				open={isOpen}
				settings={settings}
				canvasRef={canvasRef}
				sceneRef={sceneRef}
				rendererRef={rendererRef}
				cameraRef={cameraRef}
			/>
		</main>
	);
}
