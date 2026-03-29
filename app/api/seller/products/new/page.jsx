// app/seller/products/new/page.jsx
import { redirect } from "next/navigation";

export default function NewProductIndex() {
  redirect("/seller/products/new/step-1");
}
