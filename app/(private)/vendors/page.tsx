import { getVendors, getWedding } from "@/lib/queries";
import { VendorsUI } from "@/components/vendors/vendors-ui";

export default async function VendorsPage() {
  const wedding = await getWedding();
  if (!wedding) return <p className="p-8 text-muted">Nema podataka o svadbi.</p>;

  const vendors = await getVendors(wedding.id);

  return (
    <div className="p-6 sm:p-8">
      <VendorsUI weddingId={wedding.id} initialVendors={vendors} />
    </div>
  );
}
