"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { coursesService } from "@/services/courses.service";

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

const levelLabels = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const courseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  duration_hours: z.coerce
    .number({ invalid_type_error: "La duración debe ser un número" })
    .int("La duración debe ser un número entero")
    .positive("La duración debe ser mayor que 0"),
  price: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número" })
    .min(0, "El precio debe ser mayor o igual a 0"),
  level: z.enum(["basic", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Selecciona un nivel válido" }),
  }),
  is_active: z.boolean(),
});

const defaultFormValues = {
  name: "",
  description: "",
  duration_hours: "",
  price: "",
  level: "basic",
  is_active: true,
};

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: defaultFormValues,
  });

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await coursesService.list();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar los cursos. Verifica la conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccess("");
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() ?? "",
        duration_hours: data.duration_hours,
        price: data.price,
        level: data.level,
        is_active: data.is_active,
      };
      if (editingId) {
        await coursesService.update(editingId, payload);
        setSuccess("Curso actualizado correctamente");
        setEditingId(null);
      } else {
        await coursesService.create(payload);
        setSuccess("Curso creado correctamente");
      }
      reset(defaultFormValues);
      loadCourses();
    } catch (err) {
      const detail = err.response?.data;
      let msg = "Error al guardar el curso.";
      if (typeof detail === "string") msg = detail;
      else if (detail?.detail) msg = detail.detail;
      else if (detail && typeof detail === "object") {
        const first = Object.values(detail)[0];
        if (Array.isArray(first)) msg = first[0];
        else if (typeof first === "string") msg = first;
      }
      setError(msg);
    }
  };

  const startEdit = (course) => {
    setError("");
    setSuccess("");
    setEditingId(course.id);
    reset({
      name: course.name,
      description: course.description ?? "",
      duration_hours: course.duration_hours,
      price: Number(course.price),
      level: course.level,
      is_active: Boolean(course.is_active),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(defaultFormValues);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (course) => {
    const ok = window.confirm(
      `¿Eliminar el curso "${course.name}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      setError("");
      setSuccess("");
      await coursesService.remove(course.id);
      setSuccess("Curso eliminado");
      if (editingId === course.id) cancelEdit();
      loadCourses();
    } catch {
      setError("No se pudo eliminar el curso.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
        <p className="text-gray-500 mt-2">Gestiona los cursos del centro.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar curso" : "Nuevo curso"}</CardTitle>
              <CardDescription>
                {editingId
                  ? "Modifica los datos y guarda los cambios."
                  : "Registra un curso en el sistema."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duración (horas)</Label>
                  <Input id="duration_hours" type="number" min={1} step={1} {...register("duration_hours")} />
                  {errors.duration_hours && (
                    <p className="text-sm text-red-500">{errors.duration_hours.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" type="number" min={0} step="0.01" {...register("price")} />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <select
                    id="level"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    {...register("level")}
                  >
                    <option value="basic">{levelLabels.basic}</option>
                    <option value="intermediate">{levelLabels.intermediate}</option>
                    <option value="advanced">{levelLabels.advanced}</option>
                  </select>
                  {errors.level && (
                    <p className="text-sm text-red-500">{errors.level.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_active" type="checkbox" className="h-4 w-4 rounded border" {...register("is_active")} />
                  <Label htmlFor="is_active" className="font-normal">
                    Activo
                  </Label>
                </div>
                {errors.is_active && (
                  <p className="text-sm text-red-500">{errors.is_active.message}</p>
                )}

                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : editingId ? "Actualizar curso" : "Crear curso"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" className="w-full" onClick={cancelEdit}>
                      Cancelar edición
                    </Button>
                  )}
                </div>
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
              <CardTitle>Listado de cursos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">Cargando cursos...</p>
              ) : courses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay cursos registrados.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={course.description}>
                            {course.description || "—"}
                          </TableCell>
                          <TableCell>{course.duration_hours} h</TableCell>
                          <TableCell>{formatPrice(course.price)}</TableCell>
                          <TableCell>{levelLabels[course.level] || course.level}</TableCell>
                          <TableCell>{course.is_active ? "Activo" : "Inactivo"}</TableCell>
                          <TableCell className="text-right space-x-2 whitespace-nowrap">
                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(course)}>
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(course)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
