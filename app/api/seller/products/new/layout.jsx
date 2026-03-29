// app/seller/products/new/layout.jsx
import { WizardProvider } from "@/components/product-wizard/WizardProvider";
import WizardStepper from "@/components/product-wizard/WizardStepper";

export const metadata = {
  title: "Add Product | Seller Hub",
};

export default function NewProductLayout({ children }) {
  return (
    <WizardProvider>
      <div className="max-w-4xl mx-auto pb-12">
        <WizardStepper />
        {children}
      </div>
    </WizardProvider>
  );
}
