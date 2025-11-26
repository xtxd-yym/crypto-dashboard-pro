export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your crypto portfolio and market trends.</p>
      </div>

      {/* Placeholder Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* We will fill these later */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl h-40 flex items-center justify-center text-slate-500">
          Widget A
        </div>
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl h-40 flex items-center justify-center text-slate-500">
          Widget B
        </div>
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl h-40 flex items-center justify-center text-slate-500">
          Widget C
        </div>
      </div>
    </div>
  );
};