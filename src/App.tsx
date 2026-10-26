import React, { useState } from 'react';
import {
  INITIAL_SIM_SLOTS,
  INITIAL_SIM_CONTACTS,
  VIVO_Y66_HARDWARE_SPECS,
  SimSlotConfig,
  SimContact,
  ApnProfile
} from './data/vivoSimData';
import { SimTraySchematic } from './components/SimTraySchematic';
import { StkAndUssdPanel } from './components/StkAndUssdPanel';
import { MpesaStkSimulator } from './components/MpesaStkSimulator';
import { SimContactsManager } from './components/SimContactsManager';
import { ApnAndSecurityPanel } from './components/ApnAndSecurityPanel';
import {
  Smartphone,
  Terminal,
  BookUser,
  Sliders,
  RefreshCw,
  Download,
  CheckCircle2,
  DollarSign,
  Zap,
  CreditCard
} from 'lucide-react';

type ActiveSection = 'mpesa-stk' | 'dashboard' | 'stk-ussd' | 'contacts' | 'apn-security';

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('mpesa-stk');
  const [slots, setSlots] = useState<SimSlotConfig[]>(INITIAL_SIM_SLOTS);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [hybridMode, setHybridMode] = useState<'dual-sim' | 'sim-plus-sd'>('dual-sim');
  const [contacts, setContacts] = useState<SimContact[]>(INITIAL_SIM_CONTACTS);

  // Funtouch OS 3.0 Dual-SIM Default Routing
  const [defaultDataSlot, setDefaultDataSlot] = useState<1 | 2>(1);
  const [defaultVoiceSlot, setDefaultVoiceSlot] = useState<'1' | '2' | 'ask'>('ask');
  const [diagnosticToast, setDiagnosticToast] = useState<string | null>(null);

  const currentSlot = slots.find(s => s.slotId === activeSlot) || slots[0];

  const handleToggleHybridMode = (mode: 'dual-sim' | 'sim-plus-sd') => {
    setHybridMode(mode);
    setSlots(prev =>
      prev.map(s => (s.slotId === 2 ? { ...s, enabled: mode === 'dual-sim' } : s))
    );
    if (mode === 'sim-plus-sd' && activeSlot === 2) {
      setActiveSlot(1);
      setDefaultDataSlot(1);
    }
  };

  const handleNetworkModeChange = (slotId: 1 | 2, mode: SimSlotConfig['networkMode']) => {
    setSlots(prev =>
      prev.map(s => {
        if (s.slotId !== slotId) return s;
        const activeBand =
          mode === 'LTE Only (4G Forcé)'
            ? 'LTE Band 3 (1800 MHz · Verrouillé MSM8937)'
            : mode === 'GSM Only (2G Éco)'
            ? 'GSM 900 MHz (ARFCN 42 · Éco Batterie)'
            : mode === 'WCDMA Preferred (3G+)'
            ? 'WCDMA Band 1 (2100 MHz · HSPA+)'
            : 'LTE Band 3 (1800 MHz · Auto PRL)';
        return { ...s, networkMode: mode, activeBand };
      })
    );
    setDiagnosticToast(`Mode réseau SIM ${slotId} mis à jour sur "${mode}".`);
    setTimeout(() => setDiagnosticToast(null), 3000);
  };

  const handleToggleSimEnabled = (slotId: 1 | 2) => {
    if (slotId === 2 && hybridMode === 'sim-plus-sd') return;
    setSlots(prev =>
      prev.map(s => (s.slotId === slotId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleToggleStkFirewall = (slotId: 1 | 2) => {
    setSlots(prev =>
      prev.map(s =>
        s.slotId === slotId ? { ...s, stkPushDisabled: !s.stkPushDisabled } : s
      )
    );
  };

  const handleRefreshRadioSignal = () => {
    setSlots(prev =>
      prev.map(s => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const newDbm = Math.max(-105, Math.min(-69, s.signalDbm + delta));
        const newAsu = Math.max(12, Math.min(72, Math.round((newDbm + 140) * 1.0)));
        return { ...s, signalDbm: newDbm, signalAsu: newAsu };
      })
    );
    setDiagnosticToast('Mesures RF Qualcomm X6 LTE (dBm / ASU) actualisées.');
    setTimeout(() => setDiagnosticToast(null), 2500);
  };

  const handleAddContact = (newEntry: Omit<SimContact, 'id' | 'index'>) => {
    setContacts(prev => {
      const slotItems = prev.filter(c => c.slotId === newEntry.slotId);
      const nextIndex = slotItems.length > 0 ? Math.max(...slotItems.map(i => i.index)) + 1 : 1;
      const created: SimContact = {
        ...newEntry,
        id: `sim-c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        index: nextIndex
      };
      return [...prev, created];
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleNormalizeAllNames = (slotId: 1 | 2) => {
    setContacts(prev =>
      prev.map(c => {
        if (c.slotId !== slotId) return c;
        const ascii = c.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9 +*#-]/g, '')
          .slice(0, 14)
          .toUpperCase();
        return { ...c, name: ascii || 'CONTACT SIM' };
      })
    );
  };

  const handleImportContacts = (newContacts: Omit<SimContact, 'id' | 'index'>[]) => {
    setContacts(prev => {
      let currentMax =
        prev
          .filter(c => c.slotId === activeSlot)
          .reduce((acc, item) => Math.max(acc, item.index), 0) || 0;
      const mapped: SimContact[] = newContacts.map((item, idx) => {
        currentMax += 1;
        return {
          ...item,
          id: `imp-${Date.now()}-${idx}`,
          index: currentMax
        };
      });
      return [...prev, ...mapped];
    });
  };

  const handleApplyApnToSlot = (slotId: 1 | 2, apn: ApnProfile) => {
    setSlots(prev =>
      prev.map(s =>
        s.slotId === slotId
          ? {
              ...s,
              carrierName: apn.carrier,
              spn: apn.apnName,
              mcc: apn.mcc,
              mnc: apn.mnc
            }
          : s
      )
    );
  };

  const handleExportFullDiagnosticReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      hardware: VIVO_Y66_HARDWARE_SPECS,
      hybridTrayConfiguration: hybridMode,
      funtouchDualSimRouting: {
        defaultMobileDataSim: `SIM ${defaultDataSlot}`,
        defaultVoiceSim: defaultVoiceSlot === 'ask' ? 'Toujours demander' : `SIM ${defaultVoiceSlot}`
      },
      simSlots: slots,
      simContactsCount: {
        sim1: contacts.filter(c => c.slotId === 1).length,
        sim2: contacts.filter(c => c.slotId === 2).length
      },
      simContacts: contacts
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagnostic_sim_vivo_y66_pd1621.json';
    a.click();
    URL.revokeObjectURL(url);
    setDiagnosticToast('Rapport complet diagnostic_sim_vivo_y66_pd1621.json téléchargé.');
    setTimeout(() => setDiagnosticToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-12">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={e => {
              e.preventDefault();
              setActiveSection('mpesa-stk');
            }}
            className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Vivo Y66 SIM Toolkit</span>
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
            <button
              type="button"
              onClick={() => setActiveSection('mpesa-stk')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'mpesa-stk'
                  ? 'text-sky-400 underline underline-offset-8 decoration-2 font-semibold'
                  : 'hover:text-slate-100'
              }`}
            >
              <span>STK M-PESA &amp; Mobile Money</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'text-sky-400 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-100'
              }`}
            >
              Diagnostic Dual-SIM
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('stk-ussd')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'stk-ussd'
                  ? 'text-sky-400 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-100'
              }`}
            >
              Codes Réseau &amp; STK
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('contacts')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'contacts'
                  ? 'text-sky-400 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-100'
              }`}
            >
              Contacts SIM ({contacts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('apn-security')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'apn-security'
                  ? 'text-sky-400 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-100'
              }`}
            >
              APN &amp; PIN/PUK
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection('mpesa-stk')}
              className="hidden sm:flex px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 min-h-[38px] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Acheter Airtime / Prêt</span>
            </button>
            <button
              type="button"
              onClick={handleExportFullDiagnosticReport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Rapport SIM</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Hardware Context Banner with Unboxed Metadata */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-medium">
                <span>vivo Y66 (PD1621)</span>
                <span aria-hidden="true">·</span>
                <span>Android 6.0.1 Marshmallow</span>
                <span aria-hidden="true">·</span>
                <span>Funtouch OS 3.0</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">ROM pd1621_a_1.13.15</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mt-1.5">
                Boîte à Outils SIM &amp; Menu STK M-PESA
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                Gérez votre carte SIM en toute simplicité : menu interactif STK M-PESA (achat de crédit d&apos;appel Airtime, prêts &amp; épargne M-Shwari / Fuliza), configuration Dual-SIM et outils Snapdragon 430 (MSM8937 · 3 Go RAM).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveSlot(1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSlot === 1
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SIM 1 ({slots[0].carrierName})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot(2)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                onClick={handleRefreshRadioSignal}
                className="px-3 py-2 text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Actualiser RF</span>
              </button>
            </div>
          </div>

          {diagnosticToast && (
            <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/40 text-xs text-sky-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{diagnosticToast}</span>
            </div>
          )}

          {/* Quick Shortcuts Pill-Free Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSection('mpesa-stk')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeSection === 'mpesa-stk'
                  ? 'bg-emerald-500/15 border-emerald-500/60'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>M-PESA Airtime &amp; Loans</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Crédit, Prêts M-Shwari</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'bg-sky-500/15 border-sky-500/60'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Tiroir Hybride Dual-SIM</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Contacts ISO 7816 &amp; 4G</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('stk-ussd')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeSection === 'stk-ussd'
                  ? 'bg-sky-500/15 border-sky-500/60'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Codes Ingénieur Vivo</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">*#*#4636#*#* &amp; *#558#</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('contacts')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeSection === 'contacts'
                  ? 'bg-sky-500/15 border-sky-500/60'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <BookUser className="w-3.5 h-3.5" />
                <span>Contacts SIM (.VCF)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{contacts.length} enregistrements</div>
            </button>
          </div>
        </section>

        {/* Section: STK M-PESA & Mobile Money (User Request Highlight) */}
        {activeSection === 'mpesa-stk' && (
          <MpesaStkSimulator slotId={activeSlot} carrierName={currentSlot.carrierName} />
        )}

        {/* Section: Dashboard & Dual-SIM Routing */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <SimTraySchematic
              slots={slots}
              activeSlot={activeSlot}
              onSelectSlot={setActiveSlot}
              hybridMode={hybridMode}
              onToggleHybridMode={handleToggleHybridMode}
            />

            {/* Funtouch OS 3.0 Dual-SIM Default Routing & Radio Band Control */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Detailed Inspector for Active Slot */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-100">
                        Paramètres Radio &amp; Identifiants de {currentSlot.label}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Format physique : {currentSlot.formFactor} · IMEI dédié : <code className="text-slate-200 font-mono">{currentSlot.imei}</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setActiveSlot(1)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          activeSlot === 1
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SIM 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSlot(2)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          activeSlot === 2
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SIM 2
                      </button>
                    </div>
                  </div>

                  {/* Key SIM Elementary Files Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-[11px] text-slate-400">Opérateur (EF_SPN) &amp; Numéro MSISDN</div>
                      <div className="text-sm font-semibold text-slate-100 mt-0.5">
                        {currentSlot.carrierName} ({currentSlot.spn})
                      </div>
                      <div className="text-xs font-mono tabular-nums text-sky-400 mt-0.5">
                        {currentSlot.phoneNumber}
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-[11px] text-slate-400">Numéro de série puce (EF_ICCID)</div>
                      <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 mt-1">
                        {currentSlot.iccid}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                        IMSI : {currentSlot.imsi}
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-[11px] text-slate-400">Bande Fréquence Active (MSM8937)</div>
                      <div className="text-xs font-mono font-semibold text-emerald-400 mt-1">
                        {currentSlot.activeBand}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                        Puissance : {currentSlot.signalDbm} dBm ({currentSlot.signalAsu} ASU)
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-[11px] text-slate-400">État Alimentation Radio UIM{activeSlot}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-100">
                          {currentSlot.enabled ? 'Radio Active (En Service)' : 'Radio Coupée'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleSimEnabled(activeSlot)}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          {currentSlot.enabled ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network Mode Selector */}
                  <div className="mt-5">
                    <span className="block text-xs font-medium text-slate-300 mb-2">
                      Mode Réseau Préféré sur SIM {activeSlot} (Modem Qualcomm X6)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(
                        [
                          'LTE/WCDMA/GSM (Auto)',
                          'LTE Only (4G Forcé)',
                          'WCDMA Preferred (3G+)',
                          'GSM Only (2G Éco)'
                        ] as SimSlotConfig['networkMode'][]
                      ).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleNetworkModeChange(activeSlot, mode)}
                          className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium transition-colors min-h-[42px] cursor-pointer ${
                            currentSlot.networkMode === mode
                              ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Funtouch OS 3.0 Dual-SIM Call & Data Routing */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-100">
                      Répartition Dual-SIM (Funtouch OS 3.0)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paramètres &gt; Réseau mobile &gt; Carte de données et appels par défaut
                    </p>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <span className="block text-xs font-medium text-slate-300 mb-2">
                        Carte SIM dédiée aux Données Mobiles (Internet 4G LTE)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDefaultDataSlot(1);
                            setDiagnosticToast('Données mobiles 4G basculées sur SIM 1 (Nano-SIM).');
                            setTimeout(() => setDiagnosticToast(null), 2500);
                          }}
                          className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                            defaultDataSlot === 1
                              ? 'bg-sky-500/15 border-sky-500 text-sky-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-semibold">SIM 1 ({slots[0].carrierName})</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Priorité 4G Cat.4</div>
                        </button>

                        <button
                          type="button"
                          disabled={hybridMode === 'sim-plus-sd'}
                          onClick={() => {
                            setDefaultDataSlot(2);
                            setDiagnosticToast('Données mobiles 4G basculées sur SIM 2 (Micro-SIM).');
                            setTimeout(() => setDiagnosticToast(null), 2500);
                          }}
                          className={`p-3 rounded-xl border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            defaultDataSlot === 2
                              ? 'bg-sky-500/15 border-sky-500 text-sky-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-semibold">SIM 2 ({slots[1].carrierName})</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Bascule SIM 1 en 2G</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-slate-300 mb-2">
                        Carte SIM par défaut pour les Appels Vocaux &amp; USSD
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: '1', label: 'SIM 1' },
                          { id: '2', label: 'SIM 2' },
                          { id: 'ask', label: 'Demander' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDefaultVoiceSlot(opt.id as '1' | '2' | 'ask')}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              defaultVoiceSlot === opt.id
                                ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveSection('mpesa-stk')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Lancer le Menu STK M-PESA &amp; Achat Airtime</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: STK Menu & USSD / Engineering Codes */}
        {activeSection === 'stk-ussd' && (
          <StkAndUssdPanel
            slots={slots}
            activeSlot={activeSlot}
            onSelectSlot={setActiveSlot}
            onToggleStkFirewall={handleToggleStkFirewall}
          />
        )}

        {/* Section: SIM Contacts Manager (EF_ADN / vCard .vcf) */}
        {activeSection === 'contacts' && (
          <SimContactsManager
            contacts={contacts}
            slots={slots}
            activeSlot={activeSlot}
            onSelectSlot={setActiveSlot}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onNormalizeAllNames={handleNormalizeAllNames}
            onImportContacts={handleImportContacts}
          />
        )}

        {/* Section: APN Configurator & PIN/PUK Security */}
        {activeSection === 'apn-security' && (
          <ApnAndSecurityPanel
            slots={slots}
            activeSlot={activeSlot}
            onSelectSlot={setActiveSlot}
            onApplyApnToSlot={handleApplyApnToSlot}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Thumb-Zone Navigation for Smartphone Viewports) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-14 px-1">
        <button
          type="button"
          onClick={() => setActiveSection('mpesa-stk')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeSection === 'mpesa-stk' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">M-PESA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeSection === 'dashboard' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">Dual-SIM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('stk-ussd')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeSection === 'stk-ussd' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">Codes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('contacts')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeSection === 'contacts' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <BookUser className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('apn-security')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeSection === 'apn-security' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">APN/PIN</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
