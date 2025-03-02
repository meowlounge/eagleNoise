import { toast } from 'sonner';
import * as THREE from 'three';
import GIF from 'gif.js';

/**
 * Exports the current scene rendered by the Three.js renderer as a GIF animation
 * using the gif.js library with progress tracking.
 *
 * @param canvasRef - Reference to the canvas element where the scene is rendered.
 * @param rendererRef - Reference to the Three.js WebGL renderer.
 * @param sceneRef - Reference to the Three.js scene.
 * @param cameraRef - Reference to the Three.js camera used for rendering the scene.
 * @param onProgress - Callback function that receives progress updates (0-100).
 * @param durationInSeconds - Duration of the GIF in seconds (default: 10).
 * @param fps - Frames per second for the GIF (default: 20 FPS).
 *
 * @returns A promise that resolves when the export is complete.
 * @throws {Error} Throws an error if required components are missing or if export fails.
 */
export const exportAsGIF = async (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	sceneRef: React.RefObject<THREE.Scene | null>,
	cameraRef: React.RefObject<THREE.Camera | null>,
	onProgress: (progress: number) => void,
	durationInSeconds = 10,
	fps = 20
): Promise<void> => {
	if (
		!canvasRef.current ||
		!rendererRef.current ||
		!sceneRef.current ||
		!cameraRef.current
	) {
		console.error('Canvas, Renderer, Scene or Camera not found');
		toast.error('Failed to export GIF. Required components not found.');
		return;
	}

	const renderer = rendererRef.current;
	const scene = sceneRef.current;
	const camera = cameraRef.current;
	const canvas = canvasRef.current;
	const width = canvas.width;
	const height = canvas.height;
	const frameCount = durationInSeconds * fps;
	const frameDelay = 1000 / fps;

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = width;
	tempCanvas.height = height;
	const tempCtx = tempCanvas.getContext('2d');

	if (!tempCtx) {
		console.error('Temporary 2D context not available');
		toast.error(
			'Failed to export GIF. Temporary 2D context not available.'
		);
		return;
	}

	const gif = new GIF({
		workers: 4,
		quality: 1,
		width,
		height,
		workerScript: './gif.worker.js',
		dither: false,
	});

	gif.on('progress', (p: number) => {
		const renderingProgress = p * 50;
		onProgress(50 + renderingProgress);
	});

	gif.on('finished', (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `animation-${Date.now()}.gif`;
		link.click();
		URL.revokeObjectURL(url);
		toast.success('GIF exported successfully');
	});

	toast.info(`Capturing frames for ${durationInSeconds}s GIF export...`);

	try {
		const progressIncrement = 50 / frameCount;

		for (let i = 0; i < frameCount; i++) {
			renderer.render(scene, camera);
			tempCtx.clearRect(0, 0, width, height);
			tempCtx.drawImage(canvas, 0, 0, width, height);
			gif.addFrame(tempCtx, { copy: true, delay: frameDelay });

			onProgress(i * progressIncrement);

			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		onProgress(75);
		gif.render();
	} catch (error) {
		console.error('Failed to export GIF:', error);
		toast.error('Failed to export GIF. Please try again.');
	}
};

/**
 * Exports the current scene rendered by the Three.js renderer as a PNG image.
 *
 * @param canvasRef - Reference to the canvas element where the scene is rendered.
 * @param rendererRef - Reference to the Three.js WebGL renderer.
 * @param sceneRef - Reference to the Three.js scene.
 * @param cameraRef - Reference to the Three.js camera used for rendering the scene.
 * @param onProgress - Optional callback function that receives progress updates.
 *
 * @returns A promise that resolves when the export is complete.
 * @throws {Error} Throws an error if required components are missing or if export fails.
 */
export const exportAsPNG = async (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	sceneRef: React.RefObject<THREE.Scene | null>,
	cameraRef: React.RefObject<THREE.Camera | null>,
	onProgress?: (progress: number) => void
): Promise<void> => {
	if (
		!canvasRef.current ||
		!rendererRef.current ||
		!sceneRef.current ||
		!cameraRef.current
	) {
		console.error('Canvas, Renderer, Scene or Camera not found');
		toast.error('Failed to export image. Required components not found.');
		return;
	}

	const renderer = rendererRef.current;
	const scene = sceneRef.current;
	const camera = cameraRef.current;
	if (onProgress) onProgress(50);

	try {
		renderer.render(scene, camera);
		const dataUrl = renderer.domElement.toDataURL('image/png');

		if (onProgress) onProgress(100);

		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = `noise-${Date.now()}.png`;
		link.click();

		toast.success('Image exported successfully');
	} catch (error) {
		console.error('Failed to export PNG:', error);
		toast.error('Failed to export image. Please try again.');
		throw error;
	}
};
