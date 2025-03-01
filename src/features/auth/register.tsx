import { Link, motion, useNavigate } from "../../lib/vendors";

import { Icons } from "assets/icons";
import { navigateTo } from "utils/navigation/navigate";
import { registerSchema } from "lib/schemas";
import { useState } from "react";

export function RegisterRoute() {
  const navigate = useNavigate();
  const { formErrors, isSubmitting, passwordStrength } = store.form();
  const auth = store.auth();

  // Local state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    store.form.set({ value: { isSubmitting: true, formErrors: {} } });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      // Validate form data
      registerSchema.parse(data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update auth state
      store.auth.set({
        user: { id: "1", email: data.email, name: data.name },
        isAuthenticated: true,
      });

      // Redirect to login
      navigate({ to: "/auth/login" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        store.form.set({
          value: {
            formErrors: { form: [err.message] },
            isSubmitting: false,
          },
        });
      } else {
        // When the type is not known, use unknown
        const zodError = err as unknown;
        if (typeof zodError === "object" && zodError !== null && "errors" in zodError) {
          const validationErrors: Record<string, string[]> = {};
          const errors = (zodError as { errors: Array<{ path: string[]; message: string }> }).errors;
          errors.forEach((error) => {
            const path = error.path.join(".");
            if (!validationErrors[path]) {
              validationErrors[path] = [];
            }
            validationErrors[path].push(error.message);
          });
          store.form.set({
            value: {
              formErrors: validationErrors,
              isSubmitting: false,
            },
          });
        } else {
          store.form.set({
            value: {
              formErrors: { form: ["An unknown error occurred"] },
              isSubmitting: false,
            },
          });
        }
      }
    }
  }

  // Password strength calculation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    store.form.set({
      value: {
        ...store.form.get().value,
        passwordStrength: strength,
      },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {formErrors.form && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{formErrors.form.join(", ")}</div>
          </div>
        )}

        <div className="rounded-md shadow-sm -space-y-px">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="sr-only">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name.join(", ")}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email.join(", ")}</p>}
          </div>

          {/* Password Field */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="flex">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Icons.EyeSlash /> : <Icons.Eye />}
              </button>
            </div>
            {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password.join(", ")}</p>}
            {/* Password Strength Indicator */}
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 w-full rounded-full ${
                    level <= passwordStrength
                      ? level <= 2
                        ? "bg-red-500"
                        : level <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <div className="flex">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Icons.EyeSlash /> : <Icons.Eye />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword.join(", ")}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icons.Lock />
            </span>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </div>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
