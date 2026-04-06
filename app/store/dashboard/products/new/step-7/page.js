import { redirect } from "next/navigation";

export default function LegacyStep7Redirect() {
  redirect("/store/dashboard/products/new/step-6");
}
