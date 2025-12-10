import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
