import React, { useState } from 'react';
import {
  MPESA_STK_MENU,
  INITIAL_MPESA_STATE,
  StkMenuItem,
  StkFlowStep,
  MpesaAccountState,
  MOBILE_MONEY_PROFILES
} from '../data/stkMpesaData';
import {
  Smartphone,
  CreditCard,
  PiggyBank,
  PhoneCall,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

interface MpesaStkSimulatorProps {
  slotId: 1 | 2;
  carrierName: string;
}

export const MpesaStkSimulator: React.FC<MpesaStkSimulatorProps> = ({
  slotId,
  carrierName
}) => {
  const [account, setAccount] = useState<MpesaAccountState>(INITIAL_MPESA_STATE);
  const [activeProfileId, setActiveProfileId] = useState<string>('mpesa');

  // STK Navigation Path Stack
  const [menuStack, setMenuStack] = useState<StkMenuItem[]>([MPESA_STK_MENU]);
  const currentMenu = menuStack[menuStack.length - 1];

  // Active Flow Step (if user selected an action that requires inputs like Airtime or Loan)
  const [activeFlow, setActiveFlow] = useState<{
    item: StkMenuItem;
    stepIndex: number;
    collectedValues: Record<string, string>;
  } | null>(null);

  const [currentInputValue, setCurrentInputValue] = useState<string>('');
  const [stkNotification, setStkNotification] = useState<string | null>(null);
  const [latestSms, setLatestSms] = useState<string | null>(
    `M-PESA: Bienvenue sur le service SIM Toolkit pour Vivo Y66. Solde actuel: ${INITIAL_MPESA_STATE.currency} ${INITIAL_MPESA_STATE.mpesaBalance.toLocaleString('fr-FR')}.`
  );

  const activeProfile =
    MOBILE_MONEY_PROFILES.find(p => p.id === activeProfileId) || MOBILE_MONEY_PROFILES[0];

  // Quick shortcut to launch specific flows immediately
  const handleLaunchQuickFlow = (flowId: 'airtime' | 'loans' | 'balance' | 'send') => {
    if (flowId === 'airtime') {
      const airtimeItem = MPESA_STK_MENU.children?.[2]?.children?.[0];
      if (airtimeItem) handleSelectMenuItem(airtimeItem);
    } else if (flowId === 'loans') {
      const loansMenu = MPESA_STK_MENU.children?.[3];
      if (loansMenu) {
        setMenuStack([MPESA_STK_MENU, loansMenu]);
        setActiveFlow(null);
      }
    } else if (flowId === 'balance') {
      const balanceItem = MPESA_STK_MENU.children?.[5]?.children?.[0];
      if (balanceItem) handleSelectMenuItem(balanceItem);
    } else if (flowId === 'send') {
      const sendItem = MPESA_STK_MENU.children?.[0];
      if (sendItem) handleSelectMenuItem(sendItem);
    }
  };

  const handleSelectMenuItem = (item: StkMenuItem) => {
    if (item.actionType === 'submenu' && item.children) {
      setMenuStack(prev => [...prev, item]);
      setActiveFlow(null);
    } else if (item.actionType === 'input-flow' && item.flowSteps) {
      setActiveFlow({
        item,
        stepIndex: 0,
        collectedValues: {}
      });
      setCurrentInputValue(item.flowSteps[0].defaultValue || '');
    }
  };

  const handleBack = () => {
    if (activeFlow) {
      if (activeFlow.stepIndex > 0) {
        setActiveFlow(prev => prev && { ...prev, stepIndex: prev.stepIndex - 1 });
      } else {
        setActiveFlow(null);
      }
    } else if (menuStack.length > 1) {
      setMenuStack(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleCancel = () => {
    setActiveFlow(null);
    setMenuStack([MPESA_STK_MENU]);
  };

  const generateTxRef = () => {
    const letters = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `${l1}${l2}${digits}CD`;
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlow || !activeFlow.item.flowSteps) return;

    const currentStep = activeFlow.item.flowSteps[activeFlow.stepIndex];
    const val = currentInputValue.trim();
    if (!val && currentStep.type !== 'select') return;

    const updatedValues = {
      ...activeFlow.collectedValues,
      [currentStep.id]: val
    };

    if (activeFlow.stepIndex < activeFlow.item.flowSteps.length - 1) {
      // Proceed to next step in the flow
      const nextIndex = activeFlow.stepIndex + 1;
      setActiveFlow({
        ...activeFlow,
        stepIndex: nextIndex,
        collectedValues: updatedValues
      });
      const nextStep = activeFlow.item.flowSteps[nextIndex];
      setCurrentInputValue(nextStep.defaultValue || (nextStep.type === 'select' ? nextStep.options?.[0]?.value || '' : ''));
    } else {
      // Flow completed: execute transaction and update balances!
      executeTransaction(activeFlow.item.id, updatedValues);
    }
  };

  const executeTransaction = (itemId: string, values: Record<string, string>) => {
    const pin = values.pin || '';
    if (pin && pin !== account.pin && pin !== '1234' && pin !== '0000') {
      setStkNotification('Erreur M-PESA : Code secret PIN incorrect. Transaction annulée.');
      setActiveFlow(null);
      setTimeout(() => setStkNotification(null), 4000);
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const refCode = generateTxRef();

    // 1. Buy Airtime
    if (itemId === 'buy-airtime-myphone' || itemId === 'buy-airtime-otherphone') {
      const amount = parseFloat(values.amount) || 100;
      if (amount > account.mpesaBalance) {
        setStkNotification(`Solde M-PESA insuffisant (${account.currency} ${account.mpesaBalance.toLocaleString('fr-FR')}).`);
        setActiveFlow(null);
        return;
      }

      const target = itemId === 'buy-airtime-myphone' ? 'votre Vivo Y66' : values.phone || 'bénéficiaire';
      const newMpesa = account.mpesaBalance - amount;
      const newAirtime = itemId === 'buy-airtime-myphone' ? account.airtimeBalance + amount : account.airtimeBalance;

      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        airtimeBalance: newAirtime,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'AIRTIME',
            title: `Achat Airtime pour ${target}`,
            amount: amount,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Achat de ${account.currency} ${amount.toLocaleString('fr-FR')} de crédit d'appel réussi.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Vous avez acheté ${account.currency} ${amount.toLocaleString('fr-FR')} de crédit d'appel pour ${target} le ${dateStr}. Nouveau solde M-PESA: ${account.currency} ${newMpesa.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Achat de crédit d'appel (${account.currency} ${amount.toLocaleString('fr-FR')}) effectué avec succès !`);
    }

    // 2. Request Loan (M-Shwari)
    else if (itemId === 'mshwari-loan-request' || itemId === 'kcb-loan') {
      const amount = parseFloat(values.amount) || 1000;
      if (amount > account.mshwariLoanLimit) {
        setStkNotification(`Montant supérieur au plafond de prêt disponible (${account.currency} ${account.mshwariLoanLimit.toLocaleString('fr-FR')}).`);
        setActiveFlow(null);
        return;
      }

      const fee = Math.round(amount * 0.075);
      const netDisbursed = amount;
      const newMpesa = account.mpesaBalance + netDisbursed;
      const newActiveLoan = account.mshwariActiveLoan + amount + fee;
      const newLimit = Math.max(0, account.mshwariLoanLimit - amount);

      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        mshwariActiveLoan: newActiveLoan,
        mshwariLoanLimit: newLimit,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'LOAN_REQUEST',
            title: 'Prêt M-Shwari / Mobile Loan approuvé',
            amount: amount,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Prêt de ${account.currency} ${amount.toLocaleString('fr-FR')} versé sur votre compte M-PESA. Frais d'ouverture: ${account.currency} ${fee.toLocaleString('fr-FR')}. Date limite de remboursement: 30 jours.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Prêt M-Shwari de ${account.currency} ${amount.toLocaleString('fr-FR')} accordé avec succès le ${dateStr}. Montant crédité sur votre compte M-PESA. Total à rembourser sous 30 jours: ${account.currency} ${newActiveLoan.toLocaleString('fr-FR')}. Nouveau solde M-PESA: ${account.currency} ${newMpesa.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Prêt M-Shwari de ${account.currency} ${amount.toLocaleString('fr-FR')} accordé et crédité immédiatement !`);
    }

    // 3. Repay Loan
    else if (itemId === 'mshwari-loan-repay') {
      const amount = parseFloat(values.amount) || 500;
      const source = values.repaySource || 'mpesa';
      const actualRepay = Math.min(amount, account.mshwariActiveLoan);

      if (source === 'mpesa' && actualRepay > account.mpesaBalance) {
        setStkNotification(`Solde M-PESA insuffisant pour ce remboursement.`);
        setActiveFlow(null);
        return;
      }
      if (source === 'savings' && actualRepay > account.mshwariSavings) {
        setStkNotification(`Solde épargne M-Shwari insuffisant.`);
        setActiveFlow(null);
        return;
      }

      const newMpesa = source === 'mpesa' ? account.mpesaBalance - actualRepay : account.mpesaBalance;
      const newSavings = source === 'savings' ? account.mshwariSavings - actualRepay : account.mshwariSavings;
      const newActiveLoan = account.mshwariActiveLoan - actualRepay;
      const newLimit = account.mshwariLoanLimit + actualRepay;

      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        mshwariSavings: newSavings,
        mshwariActiveLoan: newActiveLoan,
        mshwariLoanLimit: newLimit,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'LOAN_REPAY',
            title: 'Remboursement Prêt M-Shwari',
            amount: actualRepay,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Remboursement de ${account.currency} ${actualRepay.toLocaleString('fr-FR')} effectué. Prêt restant: ${account.currency} ${newActiveLoan.toLocaleString('fr-FR')}.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Remboursement M-Shwari de ${account.currency} ${actualRepay.toLocaleString('fr-FR')} reçu le ${dateStr}. Encours de prêt restant: ${account.currency} ${newActiveLoan.toLocaleString('fr-FR')}. Plafond restauré à: ${account.currency} ${newLimit.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Remboursement de ${account.currency} ${actualRepay.toLocaleString('fr-FR')} validé !`);
    }

    // 4. Savings Deposit (M-Shwari / Lock Savings)
    else if (itemId === 'mshwari-savings-deposit' || itemId === 'lock-savings-deposit' || itemId === 'kcb-savings') {
      const amount = parseFloat(values.amount) || 500;
      if (amount > account.mpesaBalance) {
        setStkNotification(`Solde M-PESA insuffisant pour ce dépôt d'épargne.`);
        setActiveFlow(null);
        return;
      }

      const newMpesa = account.mpesaBalance - amount;
      const newSavings = account.mshwariSavings + amount;

      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        mshwariSavings: newSavings,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'SAVINGS_DEPOSIT',
            title: 'Dépôt Épargne M-Shwari (Intérêts 6%)',
            amount: amount,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Transfert de ${account.currency} ${amount.toLocaleString('fr-FR')} vers votre compte épargne sécurisé M-Shwari.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Dépôt de ${account.currency} ${amount.toLocaleString('fr-FR')} sur compte épargne M-Shwari réussi le ${dateStr}. Nouveau solde épargne: ${account.currency} ${newSavings.toLocaleString('fr-FR')}. Intérêts annuels capitalisés.`;
      setLatestSms(sms);
      setStkNotification(`Dépôt de ${account.currency} ${amount.toLocaleString('fr-FR')} versé sur votre compte épargne M-Shwari !`);
    }

    // 5. Savings Withdraw
    else if (itemId === 'mshwari-savings-withdraw') {
      const amount = parseFloat(values.amount) || 500;
      if (amount > account.mshwariSavings) {
        setStkNotification(`Solde épargne insuffisant.`);
        setActiveFlow(null);
        return;
      }

      const newSavings = account.mshwariSavings - amount;
      const newMpesa = account.mpesaBalance + amount;

      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        mshwariSavings: newSavings,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'SAVINGS_DEPOSIT',
            title: 'Retrait d\'épargne M-Shwari vers M-PESA',
            amount: amount,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Transfert d'épargne vers le solde courant M-PESA.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Retrait de ${account.currency} ${amount.toLocaleString('fr-FR')} de votre épargne M-Shwari vers M-PESA effectué le ${dateStr}. Nouveau solde M-PESA: ${account.currency} ${newMpesa.toLocaleString('fr-FR')}. Solde épargne: ${account.currency} ${newSavings.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Retrait d'épargne vers M-PESA réussi !`);
    }

    // 6. Check Balance / Check Loan Limit / Fuliza Limit
    else if (itemId === 'check-balance' || itemId === 'mshwari-check-loan-limit' || itemId === 'fuliza-limit' || itemId === 'lock-savings-balance') {
      const sms = `${refCode} M-PESA Solde au ${dateStr}: Solde M-PESA: ${account.currency} ${account.mpesaBalance.toLocaleString('fr-FR')}. Solde Épargne M-Shwari: ${account.currency} ${account.mshwariSavings.toLocaleString('fr-FR')}. Prêt en cours: ${account.currency} ${account.mshwariActiveLoan.toLocaleString('fr-FR')}. Plafond prêt disponible: ${account.currency} ${account.mshwariLoanLimit.toLocaleString('fr-FR')}. Fuliza disponible: ${account.currency} ${account.fulizaLimit.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Solde & Plafond de prêt reçus par notification M-PESA.`);
    }

    // 7. Send Money
    else if (itemId === 'send-money') {
      const amount = parseFloat(values.amount) || 500;
      const phone = values.phone || '+254700000000';
      if (amount > account.mpesaBalance) {
        setStkNotification(`Solde M-PESA insuffisant.`);
        setActiveFlow(null);
        return;
      }

      const newMpesa = account.mpesaBalance - amount;
      setAccount(prev => ({
        ...prev,
        mpesaBalance: newMpesa,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'SEND',
            title: `Transfert d'argent vers ${phone}`,
            amount: amount,
            currency: account.currency,
            date: dateStr,
            refNumber: refCode,
            details: `Envoi réussi vers ${phone}.`
          },
          ...prev.transactions
        ]
      }));

      const sms = `${refCode} Confirmé. Vous avez envoyé ${account.currency} ${amount.toLocaleString('fr-FR')} à ${phone} le ${dateStr}. Frais: 0.00. Nouveau solde: ${account.currency} ${newMpesa.toLocaleString('fr-FR')}.`;
      setLatestSms(sms);
      setStkNotification(`Transfert M-PESA de ${account.currency} ${amount.toLocaleString('fr-FR')} envoyé avec succès !`);
    }

    // 8. Other / Default
    else {
      const sms = `${refCode} Commande STK "${itemId}" exécutée avec succès sur le modem Qualcomm MSM8937 le ${dateStr}.`;
      setLatestSms(sms);
      setStkNotification(`Opération STK validée.`);
    }

    setActiveFlow(null);
    setTimeout(() => setStkNotification(null), 4000);
  };

  const handleResetSimulator = () => {
    setAccount(INITIAL_MPESA_STATE);
    setMenuStack([MPESA_STK_MENU]);
    setActiveFlow(null);
    setStkNotification('Simulateur M-PESA réinitialisé aux valeurs d\'usine.');
    setTimeout(() => setStkNotification(null), 3000);
  };

  const currentStep = activeFlow?.item.flowSteps?.[activeFlow.stepIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Highlights & Operator Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-medium">
              <span>Application SIM Toolkit ISO/IEC 7816-4</span>
              <span aria-hidden="true">·</span>
              <span>Proactive SIM Commands (GET INPUT / DISPLAY TEXT)</span>
              <span aria-hidden="true">·</span>
              <span>Vivo Y66 (PD1621)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Module STK M-PESA &amp; Services Financiers SIM
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Navigation authentique dans le menu STK de votre carte SIM (Slot {slotId} · {carrierName}) : achetez de l&apos;Airtime (crédit d&apos;appel), accédez instantanément à vos prêts (Loans M-Shwari / Fuliza), épargnez et gérez vos retraits.
            </p>
          </div>

          {/* Profile Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Sélectionner le service Mobile Money"
              value={activeProfileId}
              onChange={e => {
                setActiveProfileId(e.target.value);
                const prof = MOBILE_MONEY_PROFILES.find(p => p.id === e.target.value);
                if (prof) {
                  setAccount(prev => ({
                    ...prev,
                    currency: prof.currency,
                    mpesaBalance: prof.defaultBalance
                  }));
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 min-h-[40px]"
            >
              {MOBILE_MONEY_PROFILES.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} ({prof.country} · {prof.currency})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleResetSimulator}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="Réinitialiser soldes et transactions"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Balances Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Card 1: Solde Principal M-PESA */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Solde M-PESA</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {account.currency} {account.mpesaBalance.toLocaleString('fr-FR')}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              Disponible pour transferts, retraits et achats
            </div>
          </div>

          {/* Card 2: Crédit d'appel Vivo Y66 (Airtime) */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Crédit d&apos;Appel (Airtime)</span>
                <PhoneCall className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-sky-300 mt-1">
                {account.currency} {account.airtimeBalance.toLocaleString('fr-FR')}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Solde voix/SMS SIM {slotId}</span>
              <button
                type="button"
                onClick={() => handleLaunchQuickFlow('airtime')}
                className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                + Acheter
              </button>
            </div>
          </div>

          {/* Card 3: Prêts M-Shwari / Loans */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Prêts (Loans M-Shwari)</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-300 mt-1">
                {account.currency} {account.mshwariActiveLoan.toLocaleString('fr-FR')}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Plafond : {account.currency} {account.mshwariLoanLimit.toLocaleString('fr-FR')}</span>
              <button
                type="button"
                onClick={() => handleLaunchQuickFlow('loans')}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Gérer
              </button>
            </div>
          </div>

          {/* Card 4: Épargne M-Shwari / Savings */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Épargne (Savings)</span>
                <PiggyBank className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-purple-300 mt-1">
                {account.currency} {account.mshwariSavings.toLocaleString('fr-FR')}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              Rémunération 6% annuel capitalisé
            </div>
          </div>
        </div>

        {/* 4 Direct Action Buttons Requested by the User */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <button
            type="button"
            onClick={() => handleLaunchQuickFlow('airtime')}
            className="p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-200">Acheter Airtime</span>
              <Zap className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-[11px] text-sky-300/80 mt-0.5">Pour vous ou autrui</div>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchQuickFlow('loans')}
            className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-200">Loans &amp; Savings</span>
              <CreditCard className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">M-Shwari &amp; Fuliza</div>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchQuickFlow('send')}
            className="p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200">Send Money</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">Envoi vers mobile</div>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchQuickFlow('balance')}
            className="p-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200">Solde &amp; Relevé</span>
              <DollarSign className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-[11px] text-purple-300/80 mt-0.5">Consulter compte</div>
          </button>
        </div>

        {stkNotification && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{stkNotification}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column View: Interactive STK Screen (Left) + SMS & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Authentic Android 6.0.1 / Funtouch OS 3.0 SIM Toolkit Window */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Top Bar of the STK Window */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">SIM Application Toolkit</div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{currentMenu.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      (SIM {slotId} · {activeProfile.name.split(' ')[0]})
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Back & Cancel controls */}
              <div className="flex items-center gap-1">
                {(menuStack.length > 1 || activeFlow) && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 min-h-[34px] px-2.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                  </button>
                )}
                {(menuStack.length > 1 || activeFlow) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 min-h-[34px] px-2.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Annuler</span>
                  </button>
                )}
              </div>
            </div>

            {/* Breadcrumb Trail */}
            <div className="text-[11px] text-slate-400 py-2 flex flex-wrap items-center gap-1">
              <span>STK</span>
              {menuStack.map((m, idx) => (
                <React.Fragment key={m.id}>
                  <span>&gt;</span>
                  <span className={idx === menuStack.length - 1 && !activeFlow ? 'text-sky-400 font-semibold' : ''}>
                    {m.title.replace(/^\d+\.\s*/, '')}
                  </span>
                </React.Fragment>
              ))}
              {activeFlow && (
                <>
                  <span>&gt;</span>
                  <span className="text-sky-400 font-semibold">{activeFlow.item.title.replace(/^\d+\.\s*/, '')}</span>
                </>
              )}
            </div>

            {/* STK Content: Flow Input Dialog OR Menu Items List */}
            {activeFlow && currentStep ? (
              /* Multi-Step Interactive Dialog (GET INPUT / PROACTIVE COMMAND) */
              <form onSubmit={handleStepSubmit} className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                  <span className="font-semibold text-slate-200">
                    Étape {activeFlow.stepIndex + 1} sur {activeFlow.item.flowSteps?.length}
                  </span>
                  <span className="font-mono text-sky-400 text-[11px]">
                    APDU: GET_INPUT
                  </span>
                </div>

                <div>
                  <label htmlFor="stk-step-input" className="block text-sm font-medium text-slate-100 mb-2">
                    {currentStep.prompt}
                  </label>

                  {currentStep.type === 'select' ? (
                    <div className="space-y-2">
                      {currentStep.options?.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCurrentInputValue(opt.value)}
                          className={`w-full p-3 text-left rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            currentInputValue === opt.value
                              ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : currentStep.type === 'input-pin' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="stk-step-input"
                          type="password"
                          maxLength={6}
                          autoFocus
                          value={currentInputValue}
                          onChange={e => setCurrentInputValue(e.target.value.replace(/\D/g, ''))}
                          placeholder={currentStep.placeholder || 'Code secret (défaut: 1234)'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-base font-mono tabular-nums text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Code secret par défaut configuré : <code className="text-amber-300 font-mono">1234</code>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        id="stk-step-input"
                        type={currentStep.type === 'input-amount' ? 'number' : 'text'}
                        autoFocus
                        value={currentInputValue}
                        onChange={e => setCurrentInputValue(e.target.value)}
                        placeholder={currentStep.placeholder}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                      />
                      {currentStep.hint && (
                        <div className="text-[11px] text-slate-400">
                          {currentStep.hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors min-h-[40px] cursor-pointer"
                  >
                    Retour
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-colors min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{activeFlow.stepIndex === (activeFlow.item.flowSteps?.length || 1) - 1 ? 'Confirmer la Transaction' : 'Continuer'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* Menu Items List */
              <div className="mt-3 space-y-1.5">
                {currentMenu.children?.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMenuItem(item)}
                    className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 text-left transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.id.includes('airtime') && (
                        <span className="text-[10px] font-medium bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                          Airtime
                        </span>
                      )}
                      {item.id.includes('loan') && (
                        <span className="text-[10px] font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                          Loan
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer of STK Window */}
          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Protocole : GSM 11.14 / SIM Toolkit 64K</span>
            <span className="font-mono tabular-nums text-slate-300">
              UIM_SESSION_ACTIVE
            </span>
          </div>
        </div>

        {/* Right: Simulated SMS Notification & Transaction History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Authentic M-PESA SMS Notification Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Dernier SMS Reçu (M-PESA / Opérateur)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                SMS OFFICIEL
              </span>
            </div>

            <div className="mt-3 bg-slate-950 border border-slate-800/90 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed">
              {latestSms}
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Expéditeur : <strong className="text-slate-200">MPESA</strong></span>
              <span>Reçu sur SIM {slotId}</span>
            </div>
          </div>

          {/* Real-Time Transaction Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">
                Journal des Transactions STK M-PESA
              </h3>
              <span className="text-xs text-slate-400">
                {account.transactions.length} opération(s)
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {account.transactions.map(tx => (
                <div
                  key={tx.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-100">{tx.title}</span>
                    <span
                      className={`font-mono tabular-nums ${
                        tx.type === 'LOAN_REQUEST' || tx.type === 'SAVINGS_DEPOSIT'
                          ? 'text-emerald-400'
                          : 'text-sky-300'
                      }`}
                    >
                      {tx.type === 'LOAN_REQUEST' ? '+' : '-'} {tx.currency} {tx.amount.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {tx.details}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                    <span>Réf : {tx.refNumber}</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
