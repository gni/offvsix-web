import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { QueueProvider } from '@/context/queue-context';
import { HeaderActions } from '@/components/header-actions';

export const metadata: Metadata = {
  title: "offvsix web - Offline VSIX Downloader",
  description: "Search and download Visual Studio Code extensions as offline .vsix packages. Use them securely, anywhere.",
  openGraph: {
    title: "offvsix web - Offline VSIX Downloader",
    description: "Browse and download .vsix packages for offline Visual Studio Code use.",
    url: "https://gni.github.io/offvsix-web/",
    siteName: "offvsix",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "offvsix web - Offline VSIX Downloader",
    description: "Easily download VS Code extensions as .vsix packages.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://gni.github.io/offvsix-web/",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", GeistSans.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueueProvider>
            <div vaul-drawer-wrapper="" className="min-h-screen flex flex-col bg-background">
              {/* Header */}
              <header className="w-full bg-background">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                  <a href="/" className="flex items-center gap-2 font-semibold">
                    <Icons.package className="h-6 w-6" />
                    <span className="text-lg">offvsix</span>
                  </a>
                  <HeaderActions />
                </div>
                <div className="h-px w-full border-b border-border"></div>
              </header>

              {/* Main Content */}
              <main className="flex-1">{children}</main>

              {/* Footer */}
              <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p>
                    &copy; {new Date().getFullYear()} offvsix web
                    <span className="sr-only"> - Built by Lucian BLETAN</span>
                  </p>
                  <a
                    href="https://github.com/gni/offvsix-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Icons.github className="h-4 w-4" />
                    <span>GitHub Project</span>
                  </a>
                </div>
              </footer>

            </div>
          </QueueProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
