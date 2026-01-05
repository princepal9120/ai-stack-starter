export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <aside className="w-64 border-r bg-muted/20 p-4 hidden md:block">
                <div className="text-xl font-bold mb-6">Command Center</div>
                <nav className="space-y-2">
                    <a href="/" className="block p-2 rounded hover:bg-muted">Chat</a>
                    <a href="/history" className="block p-2 rounded hover:bg-muted">History</a>
                    <a href="/settings" className="block p-2 rounded hover:bg-muted">Settings</a>
                </nav>
            </aside>
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
