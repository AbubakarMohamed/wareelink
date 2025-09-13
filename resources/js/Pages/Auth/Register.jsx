import { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import AuthService from "@/Services/AuthService";

export default function Register() {
  const [selectedRole, setSelectedRole] = useState(null);

  const { data, setData, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const response = await AuthService.register(data);

      console.log("✅ Registration successful:", response.data);

      // Reset passwords
      reset("password", "password_confirmation");

      // Role-based redirect
      let redirectUrl = "/dashboard"; // fallback
      if (data.role === "admin") redirectUrl = "/admin/dashboard";
      else if (data.role === "company") redirectUrl = "/company/dashboard";
      else if (data.role === "shop") redirectUrl = "/shop/dashboard";
      else if (data.role === "warehouse_admin") redirectUrl = "/warehouse/dashboard";

      router.visit(redirectUrl);

    } catch (error) {
      console.error("❌ Registration failed:", error.response?.data);

      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          errors[field] = error.response.data.errors[field][0];
        });
      }
    }
  };

  // Role selection UI
  if (!selectedRole) {
    return (
      <GuestLayout>
        <Head title="Register" />
        <div className="max-w-md mx-auto mt-10 text-center">
          <h2 className="text-xl font-semibold mb-6">
            Choose Registration Type
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedRole("shop");
                setData("role", "shop");
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Register as Shop
            </button>
            <button
              onClick={() => {
                setSelectedRole("company");
                setData("role", "company");
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Register as Company
            </button>
            <button
              onClick={() => {
                setSelectedRole("admin");
                setData("role", "admin");
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Register as Admin
            </button>
          </div>
        </div>
      </GuestLayout>
    );
  }

  // Registration form
  return (
    <GuestLayout>
      <Head title={`Register as ${selectedRole}`} />

      <form onSubmit={submit}>
        <div>
          <InputLabel htmlFor="name" value="Name" />
          <TextInput
            id="name"
            name="name"
            value={data.name}
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused
            onChange={(e) => setData("name", e.target.value)}
            required
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            onChange={(e) => setData("email", e.target.value)}
            required
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => setData("password", e.target.value)}
            required
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => setData("password_confirmation", e.target.value)}
            required
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        {/* Hidden role field */}
        <input type="hidden" name="role" value={data.role} />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="text-sm text-gray-600 underline"
          >
            ← Back
          </button>

          <div>
            <Link
              href={route("login")}
              className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 mr-4"
            >
              Already registered?
            </Link>

            <PrimaryButton disabled={processing}>
              Register as {selectedRole}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </GuestLayout>
  );
}
