// app/store/dashboard/products/new/layout.jsx
import { WizardProvider } from "@/components/product-wizard/WizardProvider";
import WizardStepper from "@/components/product-wizard/WizardStepper";
import { requireStorePage } from "@/utils/store/auth";
import { getWizardDraftBootstrap } from "./_lib/draft.server";

export default async function NewProductLayout({ children }) {
  const { store, user, membership, adminClient } = await requireStorePage();

  const draftBootstrap = await getWizardDraftBootstrap({
    adminClient,
    storeId: membership.store_id,
    userId: user.id,
  });

  return (
    <WizardProvider
      storeData={store}
      initialDraft={draftBootstrap.draft}
      initialDraftStorageReady={draftBootstrap.storageReady}
      initialDraftStatus={draftBootstrap.status}
    >
      <div className="w-full space-y-0">
        <WizardStepper />
        {children}
      </div>
    </WizardProvider>
  );
}
