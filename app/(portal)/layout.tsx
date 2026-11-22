import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.must_change_password) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (pathname !== "/profile") redirect("/profile?change=required");
  }
  const unread = unreadNotificationCount(user.id);
  return (
    <AppShell
      user={{
        id: user.id,
        staffId: user.staff_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        departmentName: user.department_name,
      }}
      unread={unread}
    >
      {children}
    </AppShell>
  );
}
