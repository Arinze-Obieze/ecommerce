// app/store/dashboard/products/new/page.js
import { redirect } from "next/navigation";

export default function NewProductIndex() {
  redirect("./step-1");
}
