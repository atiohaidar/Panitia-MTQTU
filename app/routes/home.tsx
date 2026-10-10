import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return { message: "Hello from Cloudflare" };
}

export default function Home({ loaderData }: { loaderData?: { message: string } }) {
  return <Welcome message={loaderData?.message || ""} />;
}

