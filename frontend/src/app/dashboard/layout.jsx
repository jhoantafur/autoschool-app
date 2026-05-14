"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            AutoSchool
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard/students"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Estudiantes
            </Link>
            <Link
              href="/dashboard/courses"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cursos
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
