export default function ReportCompareePage({ params }: { params: { bookingId: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Compare Reports</h1>
      <p className="mt-2 text-sm text-neutral-500">Booking: {params.bookingId}</p>
    </main>
  );
}
