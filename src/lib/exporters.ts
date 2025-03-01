import { toast } from 'sonner';
import * as THREE from 'three';

/**
 * Exports the current scene rendered by the Three.js renderer as a PNG image.
 * This function retrieves the necessary components (canvas, renderer, scene, camera)
 * and triggers the export by rendering the scene and downloading the image.
 *
 * @param canvasRef - Reference to the canvas element where the scene is rendered.
 * @param rendererRef - Reference to the Three.js WebGL renderer.
 * @param sceneRef - Reference to the Three.js scene.
 * @param cameraRef - Reference to the Three.js camera used for rendering the scene.
 *
 * @throws {Error} Throws an error if the canvas, renderer, scene, or camera are missing or if an error occurs during the export process.
 */
export const exportAsPNG = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	sceneRef: React.RefObject<THREE.Scene | null>,
	cameraRef: React.RefObject<THREE.Camera | null>
): void => {
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

	try {
		renderer.render(scene, camera);
		const dataUrl = renderer.domElement.toDataURL('image/png');

		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = `noise-${Date.now()}.png`;
		link.click();

		toast.success('Image exported successfully');
	} catch (error) {
		console.error('Failed to export PNG:', error);
		toast.error('Failed to export image. Please try again.');
	}
};
