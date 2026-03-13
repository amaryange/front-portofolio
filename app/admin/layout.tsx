export const metadata = {
  title: "Admin — M. Amary",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {children}
    </div>
  );
}
