import { Anchor } from "lucide-react";

export default function InstitutionalHeader() {
  return (
    <header className="nav-header text-[var(--papem-text)] py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--papem-header)] via-[var(--papem-header)] to-[var(--papem-header)] opacity-95"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--papem-gold)] via-[var(--papem-gold)] to-[var(--papem-gold)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-center space-x-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--papem-gold)] to-[var(--papem-gold)] rounded-full w-20 h-20 blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-white p-3 rounded-full shadow-xl border-2 border-[var(--papem-gold)]">
              <img 
                src="/attached_assets/PAPEM - BRASÃO_1752587523720.png" 
                alt="Brasão PAPEM-35" 
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              PAPEM-35
            </h1>
            <p className="text-sm opacity-90 font-medium">Programa de Adestramento do Pessoal Especializado da Marinha</p>
            <div className="w-24 h-1 bg-gradient-to-r from-[var(--papem-gold)] to-[var(--papem-gold)] mx-auto mt-2"></div>
          </div>
        </div>
      </div>
    </header>
  );
}