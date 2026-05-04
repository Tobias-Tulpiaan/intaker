import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ error?: string }>;

async function loginAction(formData: FormData) {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/login?error=invalid");
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-tulpiaan-wit border border-black/[0.08] rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart mb-1">
          Tulpiaan Intaker
        </h1>
        <p className="text-sm text-tulpiaan-grijs mb-6">Inloggen</p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            E-mail of wachtwoord onjuist.
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-tulpiaan-zwart mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-tulpiaan-zwart mb-1"
            >
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors"
          >
            Inloggen
          </button>
        </form>
      </div>
    </main>
  );
}
