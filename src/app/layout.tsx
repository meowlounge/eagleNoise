import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: '🦅 Noise | by @prodbyeagle',
	description: 'Create Fast and Easy Noisy Gradients.',
	icons: 'https://kappa.lol/Lom0v',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${geistSans.className} antialiased`}>
				{children}
				<Toaster richColors />
			</body>
		</html>
	);
}
