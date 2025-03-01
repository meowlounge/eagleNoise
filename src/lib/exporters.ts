import { toast } from 'sonner';
import * as THREE from 'three';

export const exportAsPNG = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	sceneRef: React.RefObject<THREE.Scene | null>,
	cameraRef: React.RefObject<THREE.Camera | null>
) => {
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
