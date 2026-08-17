import { getProfiles, getWedding } from "@/lib/queries";
import { SettingsUI } from "@/components/settings/settings-ui";

export default async function SettingsPage() {
  const wedding = await getWedding();
  if (!wedding) return <p className="p-8 text-muted">Nema podataka o svadbi.</p>;

  const profiles = await getProfiles();

  return (
    <div className="p-6 sm:p-8">
      <SettingsUI wedding={wedding} profiles={profiles} />
    </div>
  );
}
