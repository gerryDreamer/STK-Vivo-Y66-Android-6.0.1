export interface StkMenuItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  actionType: 'submenu' | 'input-flow' | 'info';
  children?: StkMenuItem[];
  flowSteps?: StkFlowStep[];
}

export type StkStepType = 'input-text' | 'input-amount' | 'input-pin' | 'select' | 'confirm';

export interface StkFlowStep {
  id: string;
  prompt: string;
  type: StkStepType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: string;
  validationRegex?: string;
  hint?: string;
}

export interface MpesaAccountState {
  currency: string;
  mpesaBalance: number;
  airtimeBalance: number;
  mshwariSavings: number;
  mshwariLoanLimit: number;
  mshwariActiveLoan: number;
  fulizaLimit: number;
  fulizaUsed: number;
  pin: string;
  transactions: {
    id: string;
    type: 'AIRTIME' | 'SEND' | 'WITHDRAW' | 'LOAN_REQUEST' | 'LOAN_REPAY' | 'SAVINGS_DEPOSIT' | 'LIPA';
    title: string;
    amount: number;
    currency: string;
    date: string;
    refNumber: string;
    details: string;
  }[];
}

export const INITIAL_MPESA_STATE: MpesaAccountState = {
  currency: 'KES', // Default for M-PESA, can also display in CDF or FCFA for Francophone zones
  mpesaBalance: 12500,
  airtimeBalance: 250,
  mshwariSavings: 4800,
  mshwariLoanLimit: 15000,
  mshwariActiveLoan: 1500,
  fulizaLimit: 8000,
  fulizaUsed: 0,
  pin: '1234',
  transactions: [
    {
      id: 'tx-01',
      type: 'AIRTIME',
      title: 'Achat Airtime (Crédit d\'appel)',
      amount: 100,
      currency: 'KES',
      date: '25/10/2026 18:30',
      refNumber: 'QK891234AB',
      details: 'Achat de 100 KES crédit d\'appel pour le Vivo Y66 (+254712345678).'
    },
    {
      id: 'tx-02',
      type: 'LOAN_REQUEST',
      title: 'Prêt M-Shwari accordé',
      amount: 1500,
      currency: 'KES',
      date: '24/10/2026 11:15',
      refNumber: 'QK778291CD',
      details: 'Prêt M-Shwari de 1,500 KES versé sur le solde M-PESA. Frais d\'ouverture 7.5%.'
    },
    {
      id: 'tx-03',
      type: 'SAVINGS_DEPOSIT',
      title: 'Dépôt Épargne M-Shwari',
      amount: 800,
      currency: 'KES',
      date: '20/10/2026 09:40',
      refNumber: 'QK665190EF',
      details: 'Transfert du compte M-PESA vers le compte épargne rémunéré M-Shwari.'
    }
  ]
};

// Full standard STK M-PESA Menu Tree matching official SIM Toolkit specifications (GSM 11.14 / 3GPP TS 31.111)
export const MPESA_STK_MENU: StkMenuItem = {
  id: 'mpesa-root',
  code: 'MPESA',
  title: 'M-PESA',
  actionType: 'submenu',
  children: [
    {
      id: 'send-money',
      code: '1',
      title: '1. Send Money (Envoyer Argent)',
      actionType: 'input-flow',
      flowSteps: [
        {
          id: 'phone',
          prompt: 'Entrez le numéro de téléphone du destinataire :',
          type: 'input-text',
          placeholder: 'Ex: 0712345678 ou +243...',
          hint: 'Format national ou international standard'
        },
        {
          id: 'amount',
          prompt: 'Entrez le montant à envoyer :',
          type: 'input-amount',
          placeholder: 'Ex: 500',
          hint: 'Min 10 KES / Max 150,000 KES'
        },
        {
          id: 'pin',
          prompt: 'Entrez votre code secret M-PESA :',
          type: 'input-pin',
          placeholder: 'Code à 4 chiffres (défaut: 1234)',
          hint: 'Ne partagez jamais votre code secret'
        }
      ]
    },
    {
      id: 'withdraw-cash',
      code: '2',
      title: '2. Withdraw Cash (Retirer Argent)',
      actionType: 'submenu',
      children: [
        {
          id: 'withdraw-agent',
          code: '1',
          title: '1. From Agent (Chez un Agent)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'agentNumber',
              prompt: 'Entrez le numéro d\'agent (Agent Till No) :',
              type: 'input-text',
              placeholder: 'Ex: 123456'
            },
            {
              id: 'amount',
              prompt: 'Entrez le montant à retirer :',
              type: 'input-amount',
              placeholder: 'Ex: 1000'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        },
        {
          id: 'withdraw-atm',
          code: '2',
          title: '2. From ATM (Distributeur)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'atmNumber',
              prompt: 'Entrez le numéro ATM :',
              type: 'input-text',
              placeholder: 'Ex: 555555'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        }
      ]
    },
    {
      id: 'buy-airtime',
      code: '3',
      title: '3. Buy Airtime (Acheter Crédit d\'Appel)',
      actionType: 'submenu',
      children: [
        {
          id: 'buy-airtime-myphone',
          code: '1',
          title: '1. My Phone (Pour mon numéro Vivo Y66)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'amount',
              prompt: 'Entrez le montant de crédit d\'appel à acheter :',
              type: 'input-amount',
              placeholder: 'Ex: 200',
              hint: 'Recharge directe sur le solde d\'appel de votre carte SIM'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres (défaut: 1234)'
            }
          ]
        },
        {
          id: 'buy-airtime-otherphone',
          code: '2',
          title: '2. Other Phone (Pour un autre numéro)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'phone',
              prompt: 'Entrez le numéro du bénéficiaire :',
              type: 'input-text',
              placeholder: 'Ex: 0722000000'
            },
            {
              id: 'amount',
              prompt: 'Entrez le montant d\'Airtime :',
              type: 'input-amount',
              placeholder: 'Ex: 150'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        }
      ]
    },
    {
      id: 'loans-and-savings',
      code: '4',
      title: '4. Loans and Savings (Prêts et Épargne)',
      actionType: 'submenu',
      children: [
        {
          id: 'mshwari-menu',
          code: '1',
          title: '1. M-Shwari',
          actionType: 'submenu',
          children: [
            {
              id: 'mshwari-loan-request',
              code: '1',
              title: '1. Request Loan (Demander un Prêt)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'amount',
                  prompt: 'Entrez le montant du prêt désiré :',
                  type: 'input-amount',
                  placeholder: 'Ex: 3000',
                  hint: 'Plafond disponible calculé selon votre historique M-PESA'
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA pour valider :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'mshwari-loan-repay',
              code: '2',
              title: '2. Repay Loan (Rembourser un Prêt)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'repaySource',
                  prompt: 'Source de remboursement :',
                  type: 'select',
                  options: [
                    { label: 'Depuis compte M-PESA', value: 'mpesa' },
                    { label: 'Depuis épargne M-Shwari', value: 'savings' }
                  ]
                },
                {
                  id: 'amount',
                  prompt: 'Entrez le montant à rembourser :',
                  type: 'input-amount',
                  placeholder: 'Ex: 1500'
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'mshwari-check-loan-limit',
              code: '3',
              title: '3. Check Loan Limit (Vérifier Plafond Prêt)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA pour consulter le plafond :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'mshwari-lock-savings',
              code: '4',
              title: '4. Lock Savings Account (Compte Épargne Bloqué)',
              actionType: 'submenu',
              children: [
                {
                  id: 'lock-savings-deposit',
                  code: '1',
                  title: '1. Verser sur Épargne Bloquée',
                  actionType: 'input-flow',
                  flowSteps: [
                    {
                      id: 'amount',
                      prompt: 'Entrez le montant à bloquer (taux 6% annuel) :',
                      type: 'input-amount',
                      placeholder: 'Ex: 2000'
                    },
                    {
                      id: 'duration',
                      prompt: 'Choisissez la durée de blocage :',
                      type: 'select',
                      options: [
                        { label: '1 mois', value: '1m' },
                        { label: '3 mois', value: '3m' },
                        { label: '6 mois', value: '6m' }
                      ]
                    },
                    {
                      id: 'pin',
                      prompt: 'Entrez votre code secret M-PESA :',
                      type: 'input-pin',
                      placeholder: 'Code à 4 chiffres'
                    }
                  ]
                },
                {
                  id: 'lock-savings-balance',
                  code: '2',
                  title: '2. Consulter Solde Épargne Bloquée',
                  actionType: 'input-flow',
                  flowSteps: [
                    {
                      id: 'pin',
                      prompt: 'Entrez votre code secret M-PESA :',
                      type: 'input-pin',
                      placeholder: 'Code à 4 chiffres'
                    }
                  ]
                }
              ]
            },
            {
              id: 'mshwari-savings-deposit',
              code: '5',
              title: '5. Send to M-Shwari Savings (Dépôt Épargne Simple)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'amount',
                  prompt: 'Entrez le montant à épargner sur M-Shwari :',
                  type: 'input-amount',
                  placeholder: 'Ex: 1000'
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'mshwari-savings-withdraw',
              code: '6',
              title: '6. Withdraw from M-Shwari Savings (Retrait Épargne)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'amount',
                  prompt: 'Entrez le montant à retirer de l\'épargne :',
                  type: 'input-amount',
                  placeholder: 'Ex: 500'
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            }
          ]
        },
        {
          id: 'fuliza-menu',
          code: '2',
          title: '2. Fuliza M-PESA (Découvert Automatique)',
          actionType: 'submenu',
          children: [
            {
              id: 'fuliza-limit',
              code: '1',
              title: '1. Check Limit & Balance (Vérifier Plafond)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'fuliza-opt',
              code: '2',
              title: '2. Opt-in Status (Statut Adhésion)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'choice',
                  prompt: 'Activer le découvert instantané Fuliza lors des paiements ?',
                  type: 'select',
                  options: [
                    { label: 'Activer Fuliza M-PESA', value: 'opt-in' },
                    { label: 'Désactiver Fuliza M-PESA', value: 'opt-out' }
                  ]
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            }
          ]
        },
        {
          id: 'kcb-mpesa-menu',
          code: '3',
          title: '3. KCB M-PESA',
          actionType: 'submenu',
          children: [
            {
              id: 'kcb-loan',
              code: '1',
              title: '1. Request Loan (Prêt KCB)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'amount',
                  prompt: 'Entrez le montant du prêt KCB :',
                  type: 'input-amount',
                  placeholder: 'Ex: 5000'
                },
                {
                  id: 'period',
                  prompt: 'Période de remboursement :',
                  type: 'select',
                  options: [
                    { label: '1 mois (frais 7.35%)', value: '1m' },
                    { label: '3 mois', value: '3m' }
                  ]
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            },
            {
              id: 'kcb-savings',
              code: '2',
              title: '2. Deposit to KCB Savings (Épargne KCB)',
              actionType: 'input-flow',
              flowSteps: [
                {
                  id: 'amount',
                  prompt: 'Entrez le montant :',
                  type: 'input-amount',
                  placeholder: 'Ex: 1000'
                },
                {
                  id: 'pin',
                  prompt: 'Entrez votre code secret M-PESA :',
                  type: 'input-pin',
                  placeholder: 'Code à 4 chiffres'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'lipa-na-mpesa',
      code: '5',
      title: '5. Lipa na M-PESA (Paiements Factures / Marchands)',
      actionType: 'submenu',
      children: [
        {
          id: 'paybill',
          code: '1',
          title: '1. Pay Bill (Factures / Services Publics)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'bizNumber',
              prompt: 'Entrez le numéro d\'entreprise (Paybill No) :',
              type: 'input-text',
              placeholder: 'Ex: 888888 ou KPLC...'
            },
            {
              id: 'account',
              prompt: 'Entrez le numéro de compte (Account No) :',
              type: 'input-text',
              placeholder: 'Ex: REF-10924'
            },
            {
              id: 'amount',
              prompt: 'Entrez le montant :',
              type: 'input-amount',
              placeholder: 'Ex: 500'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        },
        {
          id: 'buy-goods',
          code: '2',
          title: '2. Buy Goods and Services (Magasins / Till)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'tillNumber',
              prompt: 'Entrez le numéro Till du marchand :',
              type: 'input-text',
              placeholder: 'Ex: 654321'
            },
            {
              id: 'amount',
              prompt: 'Entrez le montant :',
              type: 'input-amount',
              placeholder: 'Ex: 350'
            },
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        }
      ]
    },
    {
      id: 'my-account',
      code: '6',
      title: '6. My Account (Mon Compte)',
      actionType: 'submenu',
      children: [
        {
          id: 'check-balance',
          code: '1',
          title: '1. Check Balance (Consulter Solde M-PESA)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA pour recevoir votre solde par SMS :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres (défaut: 1234)'
            }
          ]
        },
        {
          id: 'mini-statement',
          code: '2',
          title: '2. Mini Statement (5 Dernières Opérations)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'pin',
              prompt: 'Entrez votre code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Code à 4 chiffres'
            }
          ]
        },
        {
          id: 'change-pin',
          code: '3',
          title: '3. Change PIN (Changer Code Secret M-PESA)',
          actionType: 'input-flow',
          flowSteps: [
            {
              id: 'oldPin',
              prompt: 'Entrez votre ancien code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Ancien code'
            },
            {
              id: 'newPin',
              prompt: 'Entrez votre nouveau code secret M-PESA (4 chiffres) :',
              type: 'input-pin',
              placeholder: 'Nouveau code'
            },
            {
              id: 'confirmPin',
              prompt: 'Confirmez votre nouveau code secret M-PESA :',
              type: 'input-pin',
              placeholder: 'Confirmation code'
            }
          ]
        }
      ]
    }
  ]
};

export const MOBILE_MONEY_PROFILES = [
  { id: 'mpesa', name: 'M-PESA (Vodacom / Safaricom)', country: 'RDC / Kenya / Tanzanie', currency: 'KES', defaultBalance: 12500 },
  { id: 'airtel', name: 'Airtel Money', country: 'RDC / Congo / Gabon / Niger', currency: 'CDF', defaultBalance: 45000 },
  { id: 'orange', name: 'Orange Money', country: 'Côte d\'Ivoire / Mali / Sénégal / Cameroun', currency: 'FCFA', defaultBalance: 35000 },
  { id: 'mtn', name: 'MTN Mobile Money (MoMo)', country: 'Bénin / Côte d\'Ivoire / Ghana / Ouganda', currency: 'FCFA', defaultBalance: 28000 }
];
