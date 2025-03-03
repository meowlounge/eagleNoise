import { toast } from 'sonner';
import * as THREE from 'three';
import GIF from 'gif.js';
import tsWhammy from 'ts-whammy';

/**
 * Exports the current scene rendered by the Three.js renderer as a GIF animation
 * using the gif.js library with progress tracking and optimized performance.
 *
 * @param canvasRef - Reference to the canvas element where the scene is rendered.
 * @param rendererRef - Reference to the Three.js WebGL renderer.
 * @param sceneRef - Reference to the Three.js scene.
 * @param cameraRef - Reference to the Three.js camera used for rendering the scene.
 * @param onProgress - Callback function that receives progress updates (0-100).
 * @param durationInSeconds - Duration of the GIF in seconds (default: 10).
 * @param fps - Frames per second for the GIF (default: 20 FPS).
 * @param options - Optional additional configuration for GIF export.
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
	fps = 20,
	options?: {
		quality?: number;
		workers?: number;
		width?: number;
		height?: number;
	}
): Promise<void> => {
	const {
		quality = 5,
		workers = 4,
		width: customWidth,
		height: customHeight,
	} = options || {};

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

	const width = customWidth || canvas.width;
	const height = customHeight || canvas.height;

	const downscaleFactor = Math.min(1, 640 / Math.max(width, height));
	const gifWidth = Math.floor(width * downscaleFactor);
	const gifHeight = Math.floor(height * downscaleFactor);

	const frameCount = durationInSeconds * fps;
	const frameDelay = 1000 / fps;

	const gif = new GIF({
		workers: workers,
		quality: quality,
		width: gifWidth,
		height: gifHeight,
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

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = gifWidth;
	tempCanvas.height = gifHeight;
	const tempCtx = tempCanvas.getContext('2d', { alpha: false });

	if (!tempCtx) {
		console.error('Temporary 2D context not available');
		toast.error(
			'Failed to export GIF. Temporary 2D context not available.'
		);
		return;
	}

	toast.info(`Capturing frames for ${durationInSeconds}s GIF export...`);

	try {
		const progressIncrement = 50 / frameCount;
		const frames = [];

		for (let i = 0; i < frameCount; i++) {
			renderer.render(scene, camera);
			tempCtx.drawImage(
				canvas,
				0,
				0,
				width,
				height,
				0,
				0,
				gifWidth,
				gifHeight
			);

			const imageData = tempCtx.getImageData(0, 0, gifWidth, gifHeight);
			frames.push(imageData);

			onProgress(i * progressIncrement);

			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		frames.forEach((frameData, index) => {
			tempCtx.putImageData(frameData, 0, 0);
			gif.addFrame(tempCtx, { copy: true, delay: frameDelay });
			if (index % 5 === 0) {
				onProgress(50 + (index / frames.length) * 25);
			}
		});

		onProgress(75);

		gif.render();
	} catch (error) {
		console.error('Failed to export GIF:', error);
		toast.error('Failed to export GIF. Please try again.');
	}
};

/**
 * Exports the current scene rendered by the Three.js renderer as a WebP animation
 * using the ts-whammy library with progress tracking.
 *
 * @param canvasRef - Reference to the canvas element where the scene is rendered.
 * @param rendererRef - Reference to the Three.js WebGL renderer.
 * @param sceneRef - Reference to the Three.js scene.
 * @param cameraRef - Reference to the Three.js camera used for rendering the scene.
 * @param onProgress - Callback function that receives progress updates (0-100).
 * @param durationInSeconds - Duration of the animation in seconds (default: 10).
 * @param fps - Frames per second for the animation (default: 24 FPS).
 * @param options - Optional additional configuration for WebP export.
 *
 * @returns A promise that resolves when the export is complete.
 * @throws {Error} Throws an error if required components are missing or if export fails.
 */
export const exportAsWebP = async (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	sceneRef: React.RefObject<THREE.Scene | null>,
	cameraRef: React.RefObject<THREE.Camera | null>,
	onProgress: (progress: number) => void,
	durationInSeconds = 10,
	fps = 24,
	options?: {
		width?: number;
		height?: number;
		quality?: number;
		useDuration?: boolean;
	}
): Promise<void> => {
	const {
		width: customWidth,
		height: customHeight,
		quality = 0.9,
		useDuration = true,
	} = options || {};

	if (
		!canvasRef.current ||
		!rendererRef.current ||
		!sceneRef.current ||
		!cameraRef.current
	) {
		console.error('Canvas, Renderer, Scene or Camera not found');
		toast.error('Failed to export WebP. Required components not found.');
		return;
	}

	const renderer = rendererRef.current;
	const scene = sceneRef.current;
	const camera = cameraRef.current;
	const canvas = canvasRef.current;

	const width = customWidth || canvas.width;
	const height = customHeight || canvas.height;

	const downscaleFactor = Math.min(1, 1280 / Math.max(width, height));
	const videoWidth = Math.floor(width * downscaleFactor);
	const videoHeight = Math.floor(height * downscaleFactor);

	const frameCount = durationInSeconds * fps;

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = videoWidth;
	tempCanvas.height = videoHeight;
	const tempCtx = tempCanvas.getContext('2d', { alpha: false });

	if (!tempCtx) {
		console.error('Temporary 2D context not available');
		toast.error(
			'Failed to export WebP. Temporary 2D context not available.'
		);
		return;
	}

	toast.info(`Capturing frames for ${durationInSeconds}s WebP export...`);

	try {
		const images: string[] = [];
		const progressIncrement = 80 / frameCount;

		for (let i = 0; i < frameCount; i++) {
			renderer.render(scene, camera);

			tempCtx.clearRect(0, 0, videoWidth, videoHeight);
			tempCtx.drawImage(
				canvas,
				0,
				0,
				width,
				height,
				0,
				0,
				videoWidth,
				videoHeight
			);

			const imageData = tempCanvas.toDataURL('image/webp', quality);
			images.push(imageData);

			onProgress(i * progressIncrement);

			await new Promise((resolve) => setTimeout(resolve, 0));
		}
		onProgress(80);

		let result: Blob | Uint8Array;
		if (useDuration) {
			result = tsWhammy.fromImageArrayWithOptions(images, {
				duration: durationInSeconds,
				outputAsArray: false,
			});
		} else {
			result = tsWhammy.fromImageArray(images, fps, false);
		}

		let blob: Blob;
		if (result instanceof Blob) {
			blob = result;
		} else {
			blob = new Blob([result], { type: 'video/webm' });
		}

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `animation-${Date.now()}.webm`;
		link.click();
		URL.revokeObjectURL(url);

		onProgress(100);
		toast.success('WebP animation exported successfully');
	} catch (error) {
		console.error('Failed to export WebP:', error);
		toast.error('Failed to export WebP. Please try again.');
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
