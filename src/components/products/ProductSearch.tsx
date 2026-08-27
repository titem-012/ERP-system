'use client';

export default function ProductSearch({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (val: string) => void }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search by name or SKU..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:w-96 border rounded-lg px-4 py-2"
      />
    </div>
  );
}