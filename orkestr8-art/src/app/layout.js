import './globals.css';

export const metadata = {
  title: 'Orkestr8.art',
  description: 'AI Art Playground',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
