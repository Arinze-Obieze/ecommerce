// app/store/dashboard/products/new/layout.jsx
import { WizardProvider } from "@/components/product-wizard/WizardProvider";
import WizardStepper from "@/components/product-wizard/WizardStepper";
import { requireStorePage } from "@/utils/storeAuth";

export default async function NewProductLayout({ children }) {
  const { store } = await requireStorePage();

  return (
    <WizardProvider storeData={store}>
      <div className="max-w-3xl mx-auto space-y-0">
        <WizardStepper />
        {children}
      </div>
    </WizardProvider>
  );
}
