'use client';
import { useState } from 'react';
import type { NoiseSettings } from '@/types';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { exportAsPNG, exportAsGIF } from '@/lib/exporters';
import * as THREE from 'three';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import NumberFlow from '@number-flow/react';

interface ExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	settings: NoiseSettings;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
	sceneRef: React.RefObject<THREE.Scene | null>;
	cameraRef: React.RefObject<THREE.Camera | null>;
}

export default function ExportDialog({
	open,
	onOpenChange,
	canvasRef,
	rendererRef,
	sceneRef,
	cameraRef,
}: ExportDialogProps) {
	const [exportType, setExportType] = useState<'png' | 'gif'>('png');
	const [isExporting, setIsExporting] = useState(false);
	const [progress, setProgress] = useState(0);
	const [gifDuration, setGifDuration] = useState(10);

	const handleExport = async () => {
		setIsExporting(true);
		setProgress(0);
		try {
			if (exportType === 'png') {
				exportAsPNG(
					canvasRef,
					rendererRef,
					sceneRef,
					cameraRef,
					setProgress
				);
			} else {
				await exportAsGIF(
					canvasRef,
					rendererRef,
					sceneRef,
					cameraRef,
					setProgress,
					gifDuration
				);
			}
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			setTimeout(() => {
				setIsExporting(false);
				setProgress(0);
			}, 1000);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Export Noise</DialogTitle>
					<DialogDescription>
						Choose your preferred export format
					</DialogDescription>
				</DialogHeader>
				<Tabs
					defaultValue='png'
					value={exportType}
					onValueChange={(value) =>
						setExportType(value as 'png' | 'gif')
					}>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='png'>Static (PNG)</TabsTrigger>
						<TabsTrigger value='gif'>Animated (GIF)</TabsTrigger>
					</TabsList>
					<TabsContent value='png' className='py-4'>
						<p className='text-sm text-neutral-600'>
							Export a static PNG image of the current noise
							state. This is the fastest option.
						</p>
					</TabsContent>
					<TabsContent value='gif' className='py-4'>
						<div className='space-y-4'>
							<p className='text-sm text-neutral-500'>
								Export a GIF animation of the noise.
							</p>
							<div className='space-y-2'>
								<div className='flex justify-between items-center'>
									<span className='text-xs text-neutral-500'>
										Duration
									</span>
									<NumberFlow
										suffix='s'
										value={gifDuration}
										className='text-xs font-medium text-neutral-300'></NumberFlow>
								</div>
								<Slider
									value={[gifDuration]}
									min={3}
									max={20}
									step={1}
									onValueChange={(value) =>
										setGifDuration(value[0])
									}
									disabled={isExporting}
									className='w-full'
								/>
								<div className='flex justify-between text-xs text-neutral-400'>
									<span>3s</span>
									<span>20s</span>
								</div>
							</div>
							<div className='mt-3 p-3 dark:bg-red-900 bg-red-100 border border-red-200 dark:border-red-800 rounded-md flex items-start'>
								<span className='dark:text-red-200 text-red-400 mr-2 mt-0.5'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'>
										<path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
										<line
											x1='12'
											y1='9'
											x2='12'
											y2='13'></line>
										<line
											x1='12'
											y1='17'
											x2='12.01'
											y2='17'></line>
									</svg>
								</span>
								<p className='text-xs dark:text-red-200 text-red-400'>
									Larger canvases may take up to a minute to
									process. Please be patient during export.
								</p>
							</div>
						</div>
					</TabsContent>
				</Tabs>
				{isExporting && (
					<div className='w-full'>
						<Progress value={progress} className='h-2' />
						<p className='text-xs text-neutral-500 text-right'>
							{Math.round(progress)}%
						</p>
					</div>
				)}
				<DialogFooter className='sm:justify-start'>
					<Button
						type='button'
						onClick={handleExport}
						disabled={isExporting}
						className='w-24'>
						{isExporting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Exporting
							</>
						) : (
							'Export'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
