import { redirect } from "next/navigation";

export default function LegacyStep8Redirect() {
  redirect("/store/dashboard/products/new/step-6");
}
