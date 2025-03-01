//! Will be reused when the gif/webp/animated exporter will be implemented
//! Will be reused when the gif/webp/animated exporter will be implemented

// 'use client';

// import { useState } from 'react';
// import type { NoiseSettings } from '@/types';
// import { Button } from '@/components/ui/button';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogDescription,
// } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Loader2 } from 'lucide-react';
// import { exportAsPNG } from '@/lib/exporters';
// import * as THREE from 'three';

// interface ExportDialogProps {
// 	open: boolean;
// 	onOpenChange: (open: boolean) => void;
// 	settings: NoiseSettings;
// 	canvasRef: React.RefObject<HTMLCanvasElement | null>;
// 	rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
// 	sceneRef: React.RefObject<THREE.Scene | null>;
// 	cameraRef: React.RefObject<THREE.Camera | null>;
// }

// export default function ExportDialog({
// 	open,
// 	onOpenChange,
// 	canvasRef,
// 	rendererRef,
// 	sceneRef,
// 	cameraRef,
// }: ExportDialogProps) {
// 	const [exportType, setExportType] = useState<'png'>('png');
// 	const [isExporting, setIsExporting] = useState(false);
// 	const [progress, setProgress] = useState(0);

// 	const handleExport = () => {
// 		if (exportType === 'png') {
// 			setIsExporting(true);
// 			try {
// 				exportAsPNG(canvasRef, rendererRef, sceneRef, cameraRef);
// 				setProgress(100);
// 			} finally {
// 				setTimeout(() => {
// 					setIsExporting(false);
// 					setProgress(0);
// 				}, 1000);
// 			}
// 		}
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent className='sm:max-w-md'>
// 				<DialogHeader>
// 					<DialogTitle>Export Noise</DialogTitle>
// 					<DialogDescription>
// 						Choose your preferred export format
// 					</DialogDescription>
// 				</DialogHeader>

// 				<Tabs
// 					defaultValue='png'
// 					onValueChange={(value) => setExportType(value as 'png')}>
// 					<TabsList className='grid w-full grid-cols-2'>
// 						<TabsTrigger value='png'>Image</TabsTrigger>
// 						<TabsTrigger disabled value='gif'>
// 							Animated (Soon)
// 						</TabsTrigger>
// 					</TabsList>

// 					<TabsContent value='png' className='py-4'>
// 						<p className='text-sm text-neutral-600'>
// 							Export a static PNG image of the current noise
// 							state. This is the fastest option.
// 						</p>
// 					</TabsContent>
// 					{/*
// 					<TabsContent value='gif' className='py-4'>
// 						<p className='text-sm text-neutral-600'>
// 							Export a 5-second GIF animation of the noise. This
// 							may take a moment to generate.
// 						</p>
// 					</TabsContent> */}
// 				</Tabs>

// 				<DialogFooter className='sm:justify-start'>
// 					<Button
// 						type='button'
// 						onClick={handleExport}
// 						disabled={isExporting}
// 						className='w-24'>
// 						{isExporting ? (
// 							<>
// 								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
// 								{progress > 0 ? `${Math.round(progress)}%` : ''}
// 							</>
// 						) : (
// 							'Export'
// 						)}
// 					</Button>
// 				</DialogFooter>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
