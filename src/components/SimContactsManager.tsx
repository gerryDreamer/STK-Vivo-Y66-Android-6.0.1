import React, { useState } from 'react';
import { SimContact, SimSlotConfig } from '../data/vivoSimData';
import {
  UserPlus,
  Download,
  Upload,
  Trash2,
  Search,
  Sparkles,
  Phone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface SimContactsManagerProps {
  contacts: SimContact[];
  slots: SimSlotConfig[];
  activeSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  onAddContact: (contact: Omit<SimContact, 'id' | 'index'>) => void;
  onDeleteContact: (id: string) => void;
  onNormalizeAllNames: (slotId: 1 | 2) => void;
  onImportContacts: (newContacts: Omit<SimContact, 'id' | 'index'>[]) => void;
}

// Helper to detect non-GSM7 / accented characters that trigger UCS-2 6-char limit on SIM EF_ADN
const hasNonAsciiChars = (str: string): boolean => {
  return /[^\x20-\x7E]/.test(str);
};

export const SimContactsManager: React.FC<SimContactsManagerProps> = ({
  contacts,
  slots,
  activeSlot,
  onSelectSlot,
  onAddContact,
  onDeleteContact,
  onNormalizeAllNames,
  onImportContacts
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState<SimContact['category']>('ADN (Répertoire SIM)');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const currentSlot = slots.find(s => s.slotId === activeSlot) || slots[0];
  const slotContacts = contacts.filter(c => c.slotId === activeSlot);

  const filteredContacts = slotContacts.filter(c => {
    const matchesCat = categoryFilter === 'Tous' || c.category === categoryFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.number.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const isUcs2 = hasNonAsciiChars(newName);
  const maxAllowedChars = isUcs2 ? 6 : 14;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    onAddContact({
      slotId: activeSlot,
      name: newName.trim().slice(0, 14).toUpperCase(),
      number: newNumber.trim(),
      category: newCategory
    });
    setNewName('');
    setNewNumber('');
    setStatusBanner(`Contact enregistré dans l'emplacement EF_ADN de SIM ${activeSlot}.`);
    setTimeout(() => setStatusBanner(null), 3000);
  };

  const handleExportVcf = () => {
    const vcfLines: string[] = [];
    slotContacts.forEach(c => {
      vcfLines.push('BEGIN:VCARD');
      vcfLines.push('VERSION:2.1');
      vcfLines.push(`N:;${c.name};;;`);
      vcfLines.push(`FN:${c.name}`);
      vcfLines.push(`TEL;CELL:${c.number}`);
      vcfLines.push(`X-SIM-SLOT:SIM_${c.slotId}`);
      vcfLines.push('END:VCARD');
    });

    const blob = new Blob([vcfLines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vivo_y66_sim${activeSlot}_contacts.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusBanner(`Fichier vivo_y66_sim${activeSlot}_contacts.vcf généré (${slotContacts.length} contacts).`);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleExportCsv = () => {
    const header = 'Index_EF_ADN,Slot_SIM,Nom_SIM,Numero,Fichier_SIM\n';
    const rows = slotContacts
      .map(c => `${c.index},SIM_${c.slotId},"${c.name}","${c.number}","${c.category}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vivo_y66_sim${activeSlot}_repertoire.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusBanner(`Export CSV terminé (${slotContacts.length} entrées SIM ${activeSlot}).`);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = String(event.target?.result || '');
      const imported: Omit<SimContact, 'id' | 'index'>[] = [];

      if (file.name.endsWith('.vcf')) {
        const cards = content.split(/BEGIN:VCARD/i).slice(1);
        cards.forEach(card => {
          const fnMatch = card.match(/FN:(.*)/i);
          const telMatch = card.match(/TEL[^:]*:(.*)/i);
          if (fnMatch && telMatch) {
            const rawName = fnMatch[1].trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 14).toUpperCase();
            const rawNum = telMatch[1].trim();
            if (rawName && rawNum) {
              imported.push({
                slotId: activeSlot,
                name: rawName,
                number: rawNum,
                category: 'ADN (Répertoire SIM)'
              });
            }
          }
        });
      } else {
        const lines = content.split(/\r?\n/).filter(Boolean);
        lines.slice(1).forEach(line => {
          const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2) {
            const nameCandidate = (parts[2] || parts[0]).slice(0, 14).toUpperCase();
            const numCandidate = parts[3] || parts[1];
            if (nameCandidate && numCandidate) {
              imported.push({
                slotId: activeSlot,
                name: nameCandidate,
                number: numCandidate,
                category: 'ADN (Répertoire SIM)'
              });
            }
          }
        });
      }

      if (imported.length > 0) {
        onImportContacts(imported);
        setStatusBanner(`${imported.length} contact(s) importés et adaptés au format USIM 14 caractères.`);
      } else {
        setStatusBanner('Aucun contact valide détecté dans le fichier sélectionné.');
      }
      setTimeout(() => setStatusBanner(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header & Slot Capacity Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Répertoire Élémentaire Carte SIM (EF_ADN · EF_FDN · EF_SDN)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Stockage physique sur puce USIM · Compatible avec l&apos;application Contacts de Funtouch OS 3.0 (.vcf)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => onSelectSlot(1)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
                  activeSlot === 1
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SIM 1 ({slots[0].carrierName})
              </button>
              <button
                type="button"
                onClick={() => onSelectSlot(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
                  activeSlot === 2
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SIM 2 ({slots[1].carrierName})
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportVcf}
              className="px-3.5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter .VCF (Vivo)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <label className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importer .VCF/CSV</span>
              <input
                type="file"
                accept=".vcf,.csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Capacity & Encoding Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400">Occupation Mémoire EF_ADN (SIM {activeSlot})</div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums mt-1">
              {slotContacts.length} / {currentSlot.adnCapacity}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>{currentSlot.adnCapacity - slotContacts.length} emplacements libres</span>
              <span aria-hidden="true"> · </span>
              <span>USIM 128K</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400">Encodage Alpha Tag (Android 6.0.1)</div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums mt-1">
              GSM 7-bit (14 car.)
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Accents UCS-2 réduisent la taille à 6 car.</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400">Optimisation Noms SIM (Sans Accents)</div>
              <p className="text-xs text-slate-300 mt-1">
                Convertit les caractères accentués en majuscules ASCII 7-bit pour éviter la troncature sur Vivo Y66.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onNormalizeAllNames(activeSlot);
                setStatusBanner(`Tous les noms de SIM ${activeSlot} ont été convertis en GSM 7-bit (14 caractères max).`);
                setTimeout(() => setStatusBanner(null), 3000);
              }}
              className="mt-2 self-start px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Normaliser les noms en ASCII</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}
      </div>

      {/* Add Contact Form + Contact Table Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Add Contact Form */}
        <form
          onSubmit={handleCreate}
          className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Inscrire une entrée sur SIM {activeSlot}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vérification en temps réel de la longueur d&apos;enregistrement EF_ADN
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="sim-contact-name" className="text-slate-300 font-medium">
                Nom sur la carte SIM
              </label>
              <span className={`font-mono tabular-nums ${newName.length > maxAllowedChars ? 'text-amber-400' : 'text-slate-400'}`}>
                {newName.length}/{maxAllowedChars} car. ({isUcs2 ? 'UCS-2' : 'GSM-7'})
              </span>
            </div>
            <input
              id="sim-contact-name"
              type="text"
              maxLength={14}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: DOCTEUR CABINET"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
            {isUcs2 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Caractère accentué détecté : Android 6.0.1 limitera ce nom à 6 caractères sur la SIM.</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="sim-contact-number" className="block text-xs text-slate-300 font-medium mb-1.5">
              Numéro de téléphone / USSD
            </label>
            <input
              id="sim-contact-number"
              type="text"
              maxLength={20}
              value={newNumber}
              onChange={e => setNewNumber(e.target.value)}
              placeholder="Ex: +33612345678"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label htmlFor="sim-contact-cat" className="block text-xs text-slate-300 font-medium mb-1.5">
              Fichier élémentaire cible
            </label>
            <select
              id="sim-contact-cat"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as SimContact['category'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="ADN (Répertoire SIM)">ADN (Répertoire SIM standard)</option>
              <option value="FDN (Numéros Fixés PIN2)">FDN (Numéros autorisés PIN2)</option>
              <option value="SDN (Services Opérateur)">SDN (Services Opérateur)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enregistrer dans l&apos;emplacement SIM {activeSlot}</span>
          </button>
        </form>

        {/* Right: Contacts Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {['Tous', 'ADN (Répertoire SIM)', 'FDN (Numéros Fixés PIN2)', 'SDN (Services Opérateur)'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat === 'Tous' ? 'Tous les fichiers' : cat.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrer par nom ou numéro..."
                className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 min-h-[36px]"
              />
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-300 font-medium">
                Aucune entrée correspondante sur la carte SIM {activeSlot}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Utilisez le formulaire ci-contre pour inscrire un nouveau numéro dans EF_ADN.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                    <th className="py-2.5 px-3">Index</th>
                    <th className="py-2.5 px-3">Nom Alpha (GSM-7)</th>
                    <th className="py-2.5 px-3">Numéro BCD</th>
                    <th className="py-2.5 px-3">Fichier SIM</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-400">
                        #{String(contact.index).padStart(3, '0')}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-100">
                        {contact.name}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-sky-300">
                        {contact.number}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {contact.category.split(' ')[0]}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`tel:${encodeURIComponent(contact.number)}`}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title={`Appeler ${contact.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onDeleteContact(contact.id)}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-red-950/50 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-300 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                            title="Effacer de la carte SIM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
