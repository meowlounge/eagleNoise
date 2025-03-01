import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NoiseSettings, NoiseType, SettingsPanelProps } from '@/types';

export default function SettingsPanel({
	settings,
	onSettingsChange,
	onExport,
}: SettingsPanelProps) {
	const [localSettings, setLocalSettings] = useState(settings);

	useEffect(() => {
		const handler = setTimeout(() => {
			onSettingsChange(localSettings);
		}, 200);

		return () => clearTimeout(handler);
	}, [localSettings, onSettingsChange]);

	const updateSetting = useCallback(
		<K extends keyof NoiseSettings>(key: K, value: NoiseSettings[K]) => {
			setLocalSettings((prev) => ({
				...prev,
				[key]: value,
			}));
		},
		[]
	);

	const handleColorChange = (index: number, color: string) => {
		const newColors = [...localSettings.colors];
		newColors[index] = color;
		updateSetting('colors', newColors);
	};

	const getRandomPastelColor = () => {
		const r = Math.floor(Math.random() * 150 + 50);
		const g = Math.floor(Math.random() * 150 + 50);
		const b = Math.floor(Math.random() * 150 + 50);

		return `#${r.toString(16).padStart(2, '0')}${g
			.toString(16)
			.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	};

	const addColor = () => {
		if (localSettings.colors.length < 5) {
			updateSetting('colors', [
				...localSettings.colors,
				getRandomPastelColor(),
			]);
		}
	};

	const removeColor = (index: number) => {
		if (localSettings.colors.length > 0) {
			const newColors = [...localSettings.colors];
			newColors.splice(index, 1);
			updateSetting('colors', newColors);
		}
	};

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<Label htmlFor='noiseType'>Noise Type</Label>
				<Select
					value={localSettings.noiseType}
					onValueChange={(value) =>
						updateSetting('noiseType', value as NoiseType)
					}>
					<SelectTrigger id='noiseType'>
						<SelectValue placeholder='Select noise type' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='perlin'>Perlin Noise</SelectItem>
						<SelectItem value='simplex'>Simplex Noise</SelectItem>
						<SelectItem value='worley'>Worley Noise</SelectItem>
						<SelectItem value='value'>Value Noise</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<Label htmlFor='width'>Width (px)</Label>
					<Input
						id='width'
						type='number'
						min='100'
						max='3000'
						value={localSettings.width}
						onChange={(e) =>
							updateSetting(
								'width',
								parseInt(e.target.value) || 800
							)
						}
					/>
				</div>
				<div className='space-y-2'>
					<Label htmlFor='height'>Height (px)</Label>
					<Input
						id='height'
						type='number'
						min='100'
						max='3000'
						value={localSettings.height}
						onChange={(e) =>
							updateSetting(
								'height',
								parseInt(e.target.value) || 600
							)
						}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<Label>Colors</Label>
				<div className='space-y-3'>
					{localSettings.colors.map((color, index) => (
						<div key={index} className='flex gap-2 items-center'>
							<Input
								type='color'
								value={color}
								onChange={(e) =>
									handleColorChange(index, e.target.value)
								}
								className='w-12 h-8 p-0 overflow-hidden'
							/>
							<Input
								type='text'
								value={color}
								onChange={(e) =>
									handleColorChange(index, e.target.value)
								}
								className='font-mono'
							/>
							{localSettings.colors.length > 0 && (
								<Button
									variant='ghost'
									size='sm'
									onClick={() => removeColor(index)}
									className='h-9 w-9 p-0'>
									✕
								</Button>
							)}
						</div>
					))}
					{localSettings.colors.length < 5 && (
						<Button
							variant='outline'
							size='sm'
							onClick={addColor}
							className='w-full'>
							Add Color
						</Button>
					)}
				</div>
			</div>

			<div className='space-y-2'>
				<div className='flex justify-between'>
					<Label htmlFor='noiseOpacity'>Noise Opacity</Label>
					<span className='text-sm text-neutral-500'>
						{Math.round(localSettings.noiseOpacity * 100)}%
					</span>
				</div>
				<Slider
					id='noiseOpacity'
					min={0}
					max={0.15}
					step={0.01}
					value={[localSettings.noiseOpacity]}
					onValueChange={(value) =>
						updateSetting('noiseOpacity', value[0])
					}
				/>
			</div>

			<div className='space-y-2'>
				<div className='flex justify-between'>
					<Label htmlFor='noiseScale'>Noise Scale</Label>
					<span className='text-sm text-neutral-500'>
						{localSettings.noiseScale.toFixed(2)}
					</span>
				</div>
				<Slider
					id='noiseScale'
					min={0.1}
					max={2}
					step={0.05}
					value={[localSettings.noiseScale]}
					onValueChange={(value) =>
						updateSetting('noiseScale', value[0])
					}
				/>
			</div>

			<div className='space-y-2'>
				<div className='flex justify-between'>
					<Label htmlFor='animationSpeed'>Animation Speed</Label>
					<span className='text-sm text-neutral-500'>
						{localSettings.animationSpeed.toFixed(1)}
					</span>
				</div>
				<Slider
					id='animationSpeed'
					min={0}
					max={4}
					step={0.1}
					value={[localSettings.animationSpeed]}
					onValueChange={(value) =>
						updateSetting('animationSpeed', value[0])
					}
				/>
			</div>

			<Button className='w-full mt-8' onClick={onExport}>
				<Download className='mr-2 h-4 w-4' />
				Export
			</Button>
		</div>
	);
}
