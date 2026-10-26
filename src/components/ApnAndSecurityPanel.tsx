import React, { useState } from 'react';
import { APN_PROFILES, ApnProfile, SimSlotConfig } from '../data/vivoSimData';
import {
  Wifi,
  Lock,
  Copy,
  Check,
  Download,
  PhoneCall,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface ApnAndSecurityPanelProps {
  slots: SimSlotConfig[];
  activeSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  onApplyApnToSlot: (slotId: 1 | 2, apn: ApnProfile) => void;
}

export const ApnAndSecurityPanel: React.FC<ApnAndSecurityPanelProps> = ({
  slots,
  activeSlot,
  onSelectSlot,
  onApplyApnToSlot
}) => {
  const [selectedApnId, setSelectedApnId] = useState<string>(APN_PROFILES[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  // PIN / PUK MMI Generator state
  const [mmiMode, setMmiMode] = useState<'change-pin1' | 'unlock-puk1' | 'change-pin2'>('change-pin1');
  const [oldPinOrPuk, setOldPinOrPuk] = useState<string>('1234');
  const [newPin, setNewPin] = useState<string>('0000');

  const selectedApn = APN_PROFILES.find(a => a.id === selectedApnId) || APN_PROFILES[0];

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleApplyToSim = () => {
    onApplyApnToSlot(activeSlot, selectedApn);
    setAppliedBanner(`Profil APN "${selectedApn.apnName}" (${selectedApn.carrier} · MCC ${selectedApn.mcc}/${selectedApn.mnc}) appliqué à SIM ${activeSlot}.`);
    setTimeout(() => setAppliedBanner(null), 3500);
  };

  const handleDownloadApnXml = () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- Configuration APN pour vivo Y66 (PD1621_A_1.13.15 / Android 6.0.1) -->
<apns version="8">
  <apn carrier="${selectedApn.apnName}"
       mcc="${selectedApn.mcc}"
       mnc="${selectedApn.mnc}"
       apn="${selectedApn.apn}"
       type="${selectedApn.apnType}"
       protocol="${selectedApn.protocol}"
       roaming_protocol="${selectedApn.roamingProtocol}"
       authtype="${selectedApn.authType === 'PAP' ? '1' : selectedApn.authType === 'CHAP' ? '2' : '0'}"
       ${selectedApn.mmsc ? `mmsc="${selectedApn.mmsc}"` : ''}
       ${selectedApn.mmsProxy ? `mmsproxy="${selectedApn.mmsProxy}"` : ''}
       ${selectedApn.mmsPort ? `mmsport="${selectedApn.mmsPort}"` : ''}
  />
</apns>`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apn_${selectedApn.id}_pd1621.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedMmiSequence =
    mmiMode === 'change-pin1'
      ? `**04*${oldPinOrPuk}*${newPin}*${newPin}#`
      : mmiMode === 'unlock-puk1'
      ? `**05*${oldPinOrPuk}*${newPin}*${newPin}#`
      : `**042*${oldPinOrPuk}*${newPin}*${newPin}#`;

  const apnFields = [
    { label: 'Nom', value: selectedApn.apnName },
    { label: 'APN (Point d\'accès)', value: selectedApn.apn },
    { label: 'MCC (Code pays)', value: selectedApn.mcc },
    { label: 'MNC (Code réseau)', value: selectedApn.mnc },
    { label: 'Type d\'APN', value: selectedApn.apnType },
    { label: 'Protocole APN', value: selectedApn.protocol },
    { label: 'Type d\'authentification', value: selectedApn.authType },
    { label: 'MMSC', value: selectedApn.mmsc || 'Non défini' },
    { label: 'Proxy MMS / Port', value: selectedApn.mmsProxy ? `${selectedApn.mmsProxy}:${selectedApn.mmsPort}` : 'Non défini' },
    { label: 'Réseau (Porteur)', value: selectedApn.bearer }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: APN Generator for Funtouch OS 3.0 */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Configurateur APN 4G LTE &amp; MMS (Funtouch OS 3.0)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chemin Vivo Y66 : <span className="text-slate-300">Paramètres &gt; Réseau mobile &gt; Point d&apos;accès (APN)</span>
                </p>
              </div>
              <Wifi className="w-5 h-5 text-sky-400 shrink-0" />
            </div>

            {/* Slot & Carrier Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="apn-carrier-select" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Opérateur mobile prédéfini
                </label>
                <select
                  id="apn-carrier-select"
                  value={selectedApnId}
                  onChange={e => setSelectedApnId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {APN_PROFILES.map(apn => (
                    <option key={apn.id} value={apn.id}>
                      {apn.carrier} — {apn.country} (MCC {apn.mcc}/{apn.mnc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-300 mb-1.5">
                  Carte SIM cible sur le Vivo Y66
                </span>
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onSelectSlot(1)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSlot === 2
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SIM 2 ({slots[1].carrierName})
                  </button>
                </div>
              </div>
            </div>

            {appliedBanner && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{appliedBanner}</span>
              </div>
            )}

            {/* APN Fields Table with One-Click Copy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {apnFields.map(field => (
                <div
                  key={field.label}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400">{field.label}</div>
                    <div className="text-xs font-mono font-semibold text-slate-100 truncate mt-0.5 tabular-nums">
                      {field.value}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(field.value, field.label)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    title={`Copier ${field.label}`}
                  >
                    {copiedKey === field.label ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleApplyToSim}
              className="px-4 py-2.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[42px] cursor-pointer"
            >
              Appliquer cet opérateur à SIM {activeSlot}
            </button>
            <button
              type="button"
              onClick={handleDownloadApnXml}
              className="px-3.5 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[42px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter apns-conf.xml</span>
            </button>
          </div>
        </div>

        {/* Right: Security PIN1 / PIN2 / PUK1 GSM 02.30 Generator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Sécurité PIN / PUK Directe (Norme GSM 02.30)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modifiez votre code PIN ou débloquez une carte PUK directement depuis le clavier d&apos;appel
                </p>
              </div>
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => {
                  setMmiMode('change-pin1');
                  setOldPinOrPuk('1234');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mmiMode === 'change-pin1'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Changer PIN1
              </button>
              <button
                type="button"
                onClick={() => {
                  setMmiMode('unlock-puk1');
                  setOldPinOrPuk('84920174');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mmiMode === 'unlock-puk1'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Débloquer PUK1
              </button>
              <button
                type="button"
                onClick={() => {
                  setMmiMode('change-pin2');
                  setOldPinOrPuk('0000');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mmiMode === 'change-pin2'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Changer PIN2
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label htmlFor="mmi-old" className="block text-xs text-slate-300 font-medium mb-1">
                  {mmiMode === 'unlock-puk1' ? 'Code PUK (8 chiffres)' : 'Code PIN actuel (4 à 8 chiffres)'}
                </label>
                <input
                  id="mmi-old"
                  type="text"
                  maxLength={8}
                  value={oldPinOrPuk}
                  onChange={e => setOldPinOrPuk(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label htmlFor="mmi-new" className="block text-xs text-slate-300 font-medium mb-1">
                  Nouveau code PIN souhaité (4 à 8 chiffres)
                </label>
                <input
                  id="mmi-new"
                  type="text"
                  maxLength={8}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">
                Séquence MMI générée à composer sur le Vivo Y66 :
              </div>
              <div className="text-base font-mono font-bold text-amber-300 tabular-nums mt-1 break-all">
                {generatedMmiSequence}
              </div>
              <div className="text-xs text-slate-400 mt-1.5">
                <span>Essais restants SIM {activeSlot} : </span>
                <span className="font-mono tabular-nums text-slate-200">
                  PIN ({slots[activeSlot - 1].pinAttemptsLeft}/3) · PUK ({slots[activeSlot - 1].pukAttemptsLeft}/10)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(generatedMmiSequence, 'mmi-seq')}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer"
            >
              {copiedKey === 'mmi-seq' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'mmi-seq' ? 'Séquence copiée' : 'Copier la séquence'}</span>
            </button>
            <a
              href={`tel:${encodeURIComponent(generatedMmiSequence)}`}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[42px] whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Composer</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Maintenance Guide specific to Vivo Y66 pd1621_a_1.13.15 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Maintenance &amp; Dépannage Boîte à Outils SIM sur Vivo Y66 (ROM pd1621_a_1.13.15)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Solutions aux problèmes fréquents du processus <code className="text-slate-300">com.android.stk</code> sur Android 6.0.1 Marshmallow (3 Go RAM)
            </p>
          </div>
          <Wrench className="w-5 h-5 text-sky-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-100">
              01. Icône &quot;Boîte à outils SIM&quot; disparue
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Sur Funtouch OS 3.0, l&apos;icône <code className="text-slate-300">com.android.stk</code> est masquée si le modem Qualcomm MSM8937 n&apos;a pas reçu le message APDU <code className="text-slate-300">FETCH (SET UP MENU)</code> au démarrage. Activez le Mode Avion 10 secondes puis désactivez-le, ou videz le cache dans <span className="text-slate-300">Paramètres &gt; Plus de paramètres &gt; Applications &gt; Tout &gt; Boîte à outils SIM</span>.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-100">
              02. Popups STK qui allument l&apos;écran la nuit
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Certaines cartes SIM envoient des menus push périodiques qui empêchent le processeur Snapdragon 430 d&apos;entrer en veille profonde (Deep Sleep). Dans <span className="text-slate-300">Paramètres &gt; Barre d&apos;état et notifications</span>, bloquez les notifications d&apos;aperçu de &quot;Boîte à outils SIM&quot; et activez le pare-feu STK dans l&apos;onglet précédent.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-100">
              03. Bascule 4G vers 3G/E sur l&apos;emplacement SIM 1
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Le Vivo Y66 fonctionne en mode Dual-SIM Dual-Standby (DSDS) : une seule carte SIM peut utiliser la 4G LTE à la fois tandis que la seconde bascule automatiquement en 2G/3G. Si la 4G décroche, composez <code className="text-slate-300">*#*#4636#*#*</code> ou <code className="text-slate-300">*#*#4838#*#*</code> et sélectionnez <span className="text-slate-300">LTE only</span> sur Informations téléphone 1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
