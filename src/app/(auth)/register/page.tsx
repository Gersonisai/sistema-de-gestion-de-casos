// This page is no longer used as public registration is disabled.
// Users are created by administrators via the /users/new page.
// You can delete this file.

/*
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <RegisterForm />
    </main>
  );
}
*/

export default function RegisterPageDisabled() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-semibold mb-4">Registro Deshabilitado</h1>
      <p className="text-muted-foreground">
        El registro público de usuarios ha sido deshabilitado.
      </p>
      <p className="text-muted-foreground mt-2">
        Las cuentas de usuario son creadas por los administradores del sistema.
      </p>
    </div>
  );
}
