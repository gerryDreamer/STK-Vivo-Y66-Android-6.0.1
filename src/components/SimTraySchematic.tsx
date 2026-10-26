import React, { useState } from 'react';
import { SimSlotConfig } from '../data/vivoSimData';
import { Cpu, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SimTraySchematicProps {
  slots: SimSlotConfig[];
  activeSlot: 1 | 2;
  onSelectSlot: (slotId: 1 | 2) => void;
  hybridMode: 'dual-sim' | 'sim-plus-sd';
  onToggleHybridMode: (mode: 'dual-sim' | 'sim-plus-sd') => void;
}

interface PinSpec {
  pin: string;
  name: string;
  voltageOrSignal: string;
  role: string;
}

const ISO_7816_PINS: PinSpec[] = [
  { pin: 'C1', name: 'VCC (Alimentation)', voltageOrSignal: '1.8V DC (Classe C)', role: 'Alimentation régulée par PMIC Qualcomm PM8937' },
  { pin: 'C2', name: 'RST (Reset)', voltageOrSignal: 'Actif bas (L)', role: 'Initialisation Answer-To-Reset (ATR) de la carte USIM' },
  { pin: 'C3', name: 'CLK (Horloge)', voltageOrSignal: '3.84 MHz', role: 'Fréquence d\'horloge synchrone du contrôleur UIM MSM8937' },
  { pin: 'C5', name: 'GND (Masse)', voltageOrSignal: '0.0V Réf.', role: 'Continuité électrique du châssis vivo PD1621' },
  { pin: 'C6', name: 'VPP / SWP', voltageOrSignal: 'Non connecté / NFC', role: 'Tension de programmation (inutilisée sur USIM 1.8V)' },
  { pin: 'C7', name: 'I/O (Données)', voltageOrSignal: 'Half-Duplex T=0', role: 'Bus de commandes APDU (EF_ADN, EF_IMSI, STK Envelopes)' }
];

export const SimTraySchematic: React.FC<SimTraySchematicProps> = ({
  slots,
  activeSlot,
  onSelectSlot,
  hybridMode,
  onToggleHybridMode
}) => {
  const [selectedPin, setSelectedPin] = useState<PinSpec>(ISO_7816_PINS[0]);
  const currentSlot = slots.find(s => s.slotId === activeSlot) || slots[0];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Architecture Tiroir Hybride Vivo Y66 (PD1621) & Contacts ISO/IEC 7816
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modem Qualcomm Snapdragon X6 LTE · Contrôleur UIM1 & UIM2 Dual-Standby · Tension 1.8V Classe C
          </p>
        </div>

        {/* Interactive Mode Switcher for Slot 2 Hybrid Tray */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start lg:self-auto">
          <button
            type="button"
            onClick={() => onToggleHybridMode('dual-sim')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              hybridMode === 'dual-sim'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mode Dual-SIM (Nano + Micro)
          </button>
          <button
            type="button"
            onClick={() => onToggleHybridMode('sim-plus-sd')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              hybridMode === 'sim-plus-sd'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mode SIM 1 + MicroSD (TF)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        {/* Left: Visual SVG Tray Representation */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <span>Schéma physique du tiroir latéral gauche (PD1621)</span>
            <span className="font-mono tabular-nums text-slate-300">
              GPIO_SIM_DET: FERMÉ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {/* Slot 1 Card */}
            <button
              type="button"
              onClick={() => onSelectSlot(1)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                activeSlot === 1
                  ? 'bg-slate-900 border-sky-500/80'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-400">
                  EMPLACEMENT SIM 1 (UIM1)
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  4FF Nano
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                {/* Gold Contact SVG Icon */}
                <svg className="w-12 h-10 shrink-0" viewBox="0 0 64 48" fill="none">
                  <rect x="2" y="2" width="60" height="44" rx="6" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                  <path d="M48 2L62 16V40C62 43.3137 59.3137 46 56 46H8C4.68629 46 2 43.3137 2 40V8C2 4.68629 4.68629 2 8 2H48Z" className="fill-slate-900 stroke-sky-400/60" strokeWidth="1.5" />
                  <rect x="14" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  <rect x="27" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  <rect x="40" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  <rect x="14" y="21" width="36" height="6" rx="1" className="fill-amber-500/80" />
                  <rect x="14" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  <rect x="27" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  <rect x="40" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                </svg>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {slots[0].enabled ? slots[0].carrierName : 'Désactivée'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums truncate">
                    {slots[0].phoneNumber}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span>{slots[0].signalDbm} dBm</span>
                    <span aria-hidden="true"> · </span>
                    <span>MCC {slots[0].mcc}/{slots[0].mnc}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Slot 2 Card (Hybrid Micro-SIM or MicroSD) */}
            <button
              type="button"
              onClick={() => onSelectSlot(2)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                activeSlot === 2
                  ? 'bg-slate-900 border-sky-500/80'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">
                  EMPLACEMENT SIM 2 (HYBRIDE)
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {hybridMode === 'dual-sim' ? '3FF Micro' : 'MicroSDXC'}
                </span>
              </div>

              {hybridMode === 'dual-sim' ? (
                <div className="mt-3 flex items-center gap-3">
                  <svg className="w-12 h-10 shrink-0" viewBox="0 0 64 48" fill="none">
                    <rect x="2" y="2" width="60" height="44" rx="6" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                    <rect x="14" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                    <rect x="27" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                    <rect x="40" y="11" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                    <rect x="14" y="21" width="36" height="6" rx="1" className="fill-amber-500/80" />
                    <rect x="14" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                    <rect x="27" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                    <rect x="40" y="30" width="10" height="7" rx="1.5" className="fill-amber-400/90" />
                  </svg>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {slots[1].enabled ? slots[1].carrierName : 'Désactivée'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono tabular-nums truncate">
                      {slots[1].phoneNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <span>{slots[1].signalDbm} dBm</span>
                      <span aria-hidden="true"> · </span>
                      <span>MCC {slots[1].mcc}/{slots[1].mnc}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">
                      Carte MicroSD Insérée
                    </div>
                    <div className="text-xs text-slate-400">
                      UIM2 désactivé physiquement (stockage externe actif jusqu&apos;à 256 Go)
                    </div>
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ATR (Answer To Reset) : <code className="text-slate-200">3B 9F 96 80 1F C7 80 31 E0 73 FE 21 1B</code></span>
            </div>
            <span className="font-mono tabular-nums">ICCID : {currentSlot.iccid}</span>
          </div>
        </div>

        {/* Right: Interactive ISO/IEC 7816-2 Pinout Inspector */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200">
                Diagnostic Broches ISO/IEC 7816-2 (SIM {activeSlot})
              </span>
              <span className="text-xs font-mono tabular-nums text-emerald-400">
                6/6 Contacts OK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ISO_7816_PINS.map(pin => (
                <button
                  key={pin.pin}
                  type="button"
                  onClick={() => setSelectedPin(pin)}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    selectedPin.pin === pin.pin
                      ? 'bg-amber-500/15 border-amber-400/70 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold">{pin.pin}</span>
                    <span className="text-[11px] font-mono text-slate-400">OK</span>
                  </div>
                  <div className="text-xs font-medium truncate mt-0.5">{pin.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Broche {selectedPin.pin} — {selectedPin.name}
              </span>
              <span className="font-mono tabular-nums text-amber-300">
                {selectedPin.voltageOrSignal}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {selectedPin.role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
