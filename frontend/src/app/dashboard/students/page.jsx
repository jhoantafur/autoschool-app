"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { studentsService } from "@/services/students.service";
import { UploadPictureModal } from "@/components/students/UploadPictureModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const studentSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
});

function profilePictureSrc(profilePicture) {
  if (!profilePicture) return null;
  const v = String(profilePicture);
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const origin = api.replace(/\/api\/?$/, "");
  return v.startsWith("/") ? `${origin}${v}` : `${origin}/${v}`;
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pictureModalOpen, setPictureModalOpen] = useState(false);
  const [pictureStudent, setPictureStudent] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentsService.getStudents();
      setStudents(data);
    } catch (err) {
      setError("Error al cargar los estudiantes. Verifica la conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccess("");
      await studentsService.createStudent(data);
      setSuccess("Estudiante creado exitosamente");
      reset();
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear el estudiante. Es posible que el correo ya exista.");
    }
  };

  const openPictureModal = (student) => {
    setPictureStudent(student);
    setPictureModalOpen(true);
  };

  const closePictureModal = () => {
    setPictureModalOpen(false);
    setPictureStudent(null);
  };

  const handlePictureSaved = (updated) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="space-y-6">
      <UploadPictureModal
        open={pictureModalOpen}
        student={pictureStudent}
        onClose={closePictureModal}
        onSaved={handlePictureSaved}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
        <p className="text-gray-500 mt-2">Gestiona el registro de estudiantes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Registrar nuevo</CardTitle>
              <CardDescription>Añade un nuevo estudiante al sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" {...register("first_name")} />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" {...register("last_name")} />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">{errors.last_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Estudiante"}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 border-green-500 text-green-700">
                  <CheckCircle2 className="h-4 w-4" color="green" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">Cargando estudiantes...</p>
              ) : students.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay estudiantes registrados.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Foto</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const pic = profilePictureSrc(student.profile_picture);
                        return (
                        <TableRow key={student.id}>
                          <TableCell className="w-16">
                            {pic ? (
                              <img
                                src={pic}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover border"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>
                            {new Date(student.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openPictureModal(student)}
                            >
                              Foto
                            </Button>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
