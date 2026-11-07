import { Suspense } from "react";
import LoginForm from "./LoginForm";

type SearchParams = Promise<{ confirmed?: string; error?: string }>;

// searchParams yahan padhe jaate hain, isliye ye alag component me hai
// aur neeche Suspense ke andar rakha gaya hai.
async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <LoginForm
      confirmed={params.confirmed === "1"}
      confirmFailed={params.error === "confirm_failed"}
    />
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={null}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}