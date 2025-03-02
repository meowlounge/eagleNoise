import { useCallback, useEffect, useState } from 'react';
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
import NumberFlow, { continuous } from '@number-flow/react';
import { PROFILES } from '@/data/profiles';

export default function SettingsPanel({
	settings,
	onSettingsChange,
	onExport,
}: SettingsPanelProps) {
	const getRandomProfile = () => {
		const randomIndex = Math.floor(Math.random() * PROFILES.length);
		return PROFILES[randomIndex];
	};
	const [localSettings, setLocalSettings] = useState(settings);
	const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

	useEffect(() => {
		const randomProfile = getRandomProfile();
		setLocalSettings(randomProfile.settings);
		setSelectedProfile(randomProfile.name);
	}, []);

	useEffect(() => {
		const handler = setTimeout(() => {
			onSettingsChange(localSettings);
		}, 250);

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

	const applyProfile = (profileName: string) => {
		const profile = PROFILES.find((p) => p.name === profileName);
		if (profile) {
			setLocalSettings(profile.settings);
			setSelectedProfile(profileName);
		}
	};

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
				<Label htmlFor='profile'>Profiles</Label>
				<Select
					value={selectedProfile || ''}
					onValueChange={applyProfile}>
					<SelectTrigger id='profile'>
						<SelectValue placeholder='Select a profile' />
					</SelectTrigger>
					<SelectContent>
						{PROFILES.map((profile) => (
							<SelectItem key={profile.name} value={profile.name}>
								{profile.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

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
								parseInt(e.target.value) || 1024
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
								parseInt(e.target.value) || 512
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
						<NumberFlow
							plugins={[continuous]}
							value={Math.round(localSettings.noiseOpacity * 100)}
							suffix='%'
						/>
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
						<NumberFlow
							plugins={[continuous]}
							value={localSettings.noiseScale}
						/>
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
						<NumberFlow
							plugins={[continuous]}
							value={localSettings.animationSpeed}
						/>
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

			<Button className='w-full mt-4' onClick={onExport}>
				<Download className='mr-2 h-4 w-4' />
				Download
			</Button>
		</div>
	);
}
