import { Sidebar } from "@/components/admin/sidebar/sidebar";

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 pl-[72px]">{children}</main>
    </div>
  );
}
