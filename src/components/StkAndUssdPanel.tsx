import React, { useState } from 'react';
import {
  STK_MENU_TREE,
  SECRET_CODES,
  SimSlotConfig,
  StkMenuNode,
  SecretCodeItem
} from '../data/vivoSimData';
import {
  Terminal,
  PhoneCall,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Search,
  Send
} from 'lucide-react';

interface StkAndUssdPanelProps {
  slots: SimSlotConfig[];
  activeSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  onToggleStkFirewall: (slot: 1 | 2) => void;
}

export const StkAndUssdPanel: React.FC<StkAndUssdPanelProps> = ({
  slots,
  activeSlot,
  onSelectSlot,
  onToggleStkFirewall
}) => {
  const currentSlot = slots.find(s => s.slotId === activeSlot) || slots[0];
  const stkNodes = STK_MENU_TREE[activeSlot];

  const [selectedStkNode, setSelectedStkNode] = useState<StkMenuNode>(stkNodes[0]);
  const [stkInput, setStkInput] = useState('');
  const [stkConsoleLines, setStkConsoleLines] = useState<string[]>([
    `Session STK initialisée sur SIM ${activeSlot} (${currentSlot.carrierName})`,
    `Package : com.android.stk · Protocole ISO/IEC 7816-4 T=0`,
    `Sélectionnez un service opérateur ou exécutez un code USSD/MMI.`
  ]);

  const [codeFilter, setCodeFilter] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customUssd, setCustomUssd] = useState<string>('*#*#4636#*#*');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'Tous',
    'Vivo Funtouch OS 3.0',
    'Qualcomm MSM8937 / Android 6.0.1',
    'Contrôle GSM & Renvois'
  ];

  const filteredCodes = SECRET_CODES.filter(item => {
    const matchesCat = codeFilter === 'Tous' || item.category === codeFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRunStkService = (node: StkMenuNode) => {
    setSelectedStkNode(node);
    const value = stkInput.trim() || '06 12 34 56 78';
    const response = node.responseTemplate.replace('{{INPUT}}', value);
    setStkConsoleLines([
      `> APDU ENVELOPE (MENU_SELECTION) -> ${node.title}`,
      `> Équivalent USSD/OTA : ${node.ussdEquivalent} (SIM ${activeSlot} · ${currentSlot.carrierName})`,
      response
    ]);
  };

  const handleRunSecretCode = (item: SecretCodeItem) => {
    setCustomUssd(item.code);
    setStkConsoleLines([
      `> Exécution MMI/USSD sur Vivo Y66 (PD1621) : ${item.code}`,
      `> Chemin Funtouch OS 3.0 : ${item.funtouchPath}`,
      ...item.simulatedOutput
    ]);
  };

  const handleRunCustomUssd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customUssd.trim();
    if (!cleaned) return;

    const matched = SECRET_CODES.find(c => c.code === cleaned);
    if (matched) {
      handleRunSecretCode(matched);
      return;
    }

    setStkConsoleLines([
      `> Envoi requête USSD "${cleaned}" sur SIM ${activeSlot} (${currentSlot.carrierName})...`,
      `> Modem Qualcomm X6 LTE (MSM8937) : Canal de signalisation SS/USSD ouvert`,
      `Réponse réseau (${currentSlot.carrierName} MCC ${currentSlot.mcc}/${currentSlot.mnc}) : Requête "${cleaned}" traitée avec succès.`
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top STK & Console Dual-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Menu STK (com.android.stk) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Boîte à Outils SIM (Menu STK Opérateur)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Application système <code className="text-slate-300">com.android.stk</code> · Android 6.0.1 API 23
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSlot(1);
                    setSelectedStkNode(STK_MENU_TREE[1][0]);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                    activeSlot === 1
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  STK SIM 1 ({slots[0].carrierName})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSlot(2);
                    setSelectedStkNode(STK_MENU_TREE[2][0]);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                    activeSlot === 2
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  STK SIM 2 ({slots[1].carrierName})
                </button>
              </div>
            </div>

            {/* STK Menu List */}
            <div className="mt-4 space-y-2">
              {stkNodes.map(node => {
                const isSelected = selectedStkNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-slate-950 border-sky-500/70'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100 truncate">
                          {node.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          <span>Commande : {node.ussdEquivalent}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{node.description}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRunStkService(node)}
                        className="px-3 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Exécuter</span>
                      </button>
                    </div>

                    {node.requiresInput && isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <input
                          type="text"
                          value={stkInput}
                          onChange={e => setStkInput(e.target.value)}
                          placeholder={node.inputPlaceholder}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRunStkService(node)}
                          className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg whitespace-nowrap shrink-0 min-h-[38px]"
                        >
                          Valider Paramètre
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funtouch OS 3.0 Flash SMS / STK Popup Blocker Toggle */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pare-feu Popups STK &amp; Flash SMS (Classe 0)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Empêche <code className="text-slate-300">com.android.stk</code> de réveiller l&apos;écran du Vivo Y66 en veille (économie RAM &amp; batterie).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleStkFirewall(activeSlot)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                currentSlot.stkPushDisabled
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              {currentSlot.stkPushDisabled ? 'Protection Active' : 'Protection Désactivée'}
            </button>
          </div>
        </div>

        {/* Right: Interactive USSD / MMI Dialer & Output Terminal */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Exécuteur USSD / MMI &amp; Réponse Baseband
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Testeur de commandes et lanceur d&apos;appels directs pour Funtouch OS 3.0
                </p>
              </div>
              <Terminal className="w-5 h-5 text-sky-400 shrink-0" />
            </div>

            {/* Custom USSD Input Bar */}
            <form onSubmit={handleRunCustomUssd} className="mt-4 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                value={customUssd}
                onChange={e => setCustomUssd(e.target.value)}
                placeholder="Saisir un code USSD ou MMI (ex: *#*#4636#*#* ou #123#)"
                className="w-full sm:flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[42px] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simuler Réponse</span>
              </button>
              <a
                href={`tel:${encodeURIComponent(customUssd)}`}
                className="px-3.5 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[42px]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Composer</span>
              </a>
            </form>

            {/* Terminal Response Output */}
            <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 min-h-[210px]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
                <span>SORTIE RIL QUALCOMM MSM8937 (SUB_{activeSlot - 1})</span>
                <span className="tabular-nums">PD1621_A_1.13.15</span>
              </div>
              {stkConsoleLines.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.startsWith('>')
                      ? 'text-sky-300'
                      : line.startsWith('===')
                      ? 'text-amber-300 font-semibold pt-1'
                      : 'text-slate-200 leading-relaxed'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Astuce Vivo Y66 : Si <code className="text-slate-200">*#*#4636#*#*</code> ne s&apos;ouvre pas, utilisez <code className="text-slate-200">*#*#4838#*#*</code></span>
            <button
              type="button"
              onClick={() => handleCopy(customUssd, 'custom-ussd')}
              className="text-sky-400 hover:text-sky-300 font-medium whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedId === 'custom-ussd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'custom-ussd' ? 'Copié' : 'Copier le code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Directory of Vivo Y66 & Android 6.0.1 Secret Codes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Répertoire des Codes Ingénieur Vivo PD1621 &amp; Commandes Réseau GSM
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Codes validés pour Funtouch OS 3.0 (<code className="text-slate-300">pd1621_a_1.13.15</code>) et processeur Snapdragon MSM8937
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un code (ex: 4636, IMEI...)"
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 min-h-[36px]"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCodeFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer ${
                codeFilter === cat
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredCodes.map(item => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono font-semibold text-amber-300 tabular-nums">
                    {item.code}
                  </code>
                  <span className="text-xs text-slate-400">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mt-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 truncate">
                  {item.funtouchPath}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.code, item.id)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunSecretCode(item)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
                  >
                    Tester
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
