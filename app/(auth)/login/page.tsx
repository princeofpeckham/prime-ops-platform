import { signInWithPassword } from "./actions";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-prime-paper p-6">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-prime-ink">PRIME Ops</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to continue.</p>

        <form action={signInWithPassword} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </label>

          {error ? (
            <p className="text-sm text-status-alert" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
