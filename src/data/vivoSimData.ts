export interface SimSlotConfig {
  slotId: 1 | 2;
  label: string;
  formFactor: 'Nano-SIM (4FF)' | 'Micro-SIM (3FF) / Hybride MicroSD';
  enabled: boolean;
  carrierName: string;
  spn: string;
  mcc: string;
  mnc: string;
  iccid: string;
  imsi: string;
  imei: string;
  phoneNumber: string;
  networkMode: 'LTE/WCDMA/GSM (Auto)' | 'LTE Only (4G Forcé)' | 'WCDMA Preferred (3G+)' | 'GSM Only (2G Éco)';
  activeBand: string;
  signalDbm: number;
  signalAsu: number;
  roaming: boolean;
  volteSupported: boolean;
  pinEnabled: boolean;
  pinAttemptsLeft: number;
  pukAttemptsLeft: number;
  stkPushDisabled: boolean;
  adnCapacity: number;
}

export interface SimContact {
  id: string;
  slotId: 1 | 2;
  index: number; // EF_ADN record index 1..250
  name: string;
  number: string;
  category: 'ADN (Répertoire SIM)' | 'FDN (Numéros Fixés PIN2)' | 'SDN (Services Opérateur)';
}

export interface ApnProfile {
  id: string;
  country: string;
  carrier: string;
  mcc: string;
  mnc: string;
  apnName: string;
  apn: string;
  apnType: string;
  protocol: 'IPv4' | 'IPv6' | 'IPv4/IPv6';
  roamingProtocol: 'IPv4' | 'IPv4/IPv6';
  authType: 'Aucune' | 'PAP' | 'CHAP' | 'PAP ou CHAP';
  mmsc?: string;
  mmsProxy?: string;
  mmsPort?: string;
  bearer: string;
}

export interface SecretCodeItem {
  id: string;
  code: string;
  title: string;
  category: 'Vivo Funtouch OS 3.0' | 'Qualcomm MSM8937 / Android 6.0.1' | 'Contrôle GSM & Renvois' | 'Sécurité PIN / PUK';
  description: string;
  funtouchPath: string;
  simulatedOutput: string[];
}

export interface StkMenuNode {
  id: string;
  title: string;
  ussdEquivalent: string;
  description: string;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  responseTemplate: string;
  children?: StkMenuNode[];
}

export const VIVO_Y66_HARDWARE_SPECS = {
  model: 'vivo Y66 (PD1621)',
  romVersion: 'Funtouch OS 3.0 (pd1621_a_1.13.15)',
  androidVersion: 'Android 6.0.1 Marshmallow (API 23)',
  soc: 'Qualcomm Snapdragon 430 (MSM8937)',
  cpu: 'Octa-Core 1.4 GHz ARM Cortex-A53 (64-bit)',
  modem: 'Qualcomm Snapdragon X6 LTE (Cat.4 150/50 Mbps)',
  ram: '3 Go LPDDR3 (800 MHz)',
  simArchitecture: 'Dual SIM Dual Standby (DSDS) — Tiroir Hybride (Nano-SIM + Micro-SIM/TF)',
  supportedBands: {
    gsm: '850 / 900 / 1800 / 1900 MHz',
    wcdma: 'B1 (2100) / B5 (850) / B8 (900)',
    fddLte: 'B1 (2100) / B3 (1800) / B5 (850) / B8 (900)',
    tddLte: 'B38 (2600) / B40 (2300) / B41 (2500)'
  },
  stkPackage: 'com.android.stk (Version 6.0.1-pd1621)'
};

export const INITIAL_SIM_SLOTS: SimSlotConfig[] = [
  {
    slotId: 1,
    label: 'SIM 1 — Emplacement Principal',
    formFactor: 'Nano-SIM (4FF)',
    enabled: true,
    carrierName: 'Orange',
    spn: 'Orange 4G',
    mcc: '208',
    mnc: '01',
    iccid: '8933012405198842105F',
    imsi: '208014928174630',
    imei: '863948031726419',
    phoneNumber: '+33 6 42 88 19 04',
    networkMode: 'LTE/WCDMA/GSM (Auto)',
    activeBand: 'LTE Band 3 (1800 MHz · EARFCN 1650)',
    signalDbm: -84,
    signalAsu: 56,
    roaming: false,
    volteSupported: false,
    pinEnabled: true,
    pinAttemptsLeft: 3,
    pukAttemptsLeft: 10,
    stkPushDisabled: true,
    adnCapacity: 250
  },
  {
    slotId: 2,
    label: 'SIM 2 — Emplacement Hybride',
    formFactor: 'Micro-SIM (3FF) / Hybride MicroSD',
    enabled: true,
    carrierName: 'Free Mobile',
    spn: 'Free',
    mcc: '208',
    mnc: '15',
    iccid: '8933150226094718293F',
    imsi: '208150983746128',
    imei: '863948031726427',
    phoneNumber: '+33 7 81 30 55 92',
    networkMode: 'GSM Only (2G Éco)',
    activeBand: 'GSM 900 MHz (ARFCN 42)',
    signalDbm: -79,
    signalAsu: 61,
    roaming: false,
    volteSupported: false,
    pinEnabled: true,
    pinAttemptsLeft: 3,
    pukAttemptsLeft: 10,
    stkPushDisabled: true,
    adnCapacity: 250
  }
];

export const INITIAL_SIM_CONTACTS: SimContact[] = [
  { id: 'c1', slotId: 1, index: 1, name: 'SERVICE CLIENT', number: '888', category: 'SDN (Services Opérateur)' },
  { id: 'c2', slotId: 1, index: 2, name: 'SUIVI CONSO', number: '#123#', category: 'SDN (Services Opérateur)' },
  { id: 'c3', slotId: 1, index: 3, name: 'MESSAGERIE', number: '888', category: 'ADN (Répertoire SIM)' },
  { id: 'c4', slotId: 1, index: 4, name: 'MAMAN MAISON', number: '+33611248900', category: 'ADN (Répertoire SIM)' },
  { id: 'c5', slotId: 1, index: 5, name: 'URGENCE MED', number: '112', category: 'FDN (Numéros Fixés PIN2)' },
  { id: 'c6', slotId: 1, index: 6, name: 'CABINET AUTO', number: '+33145829010', category: 'ADN (Répertoire SIM)' },
  { id: 'c7', slotId: 2, index: 1, name: 'ASSISTANCE FREE', number: '3244', category: 'SDN (Services Opérateur)' },
  { id: 'c8', slotId: 2, index: 2, name: 'MESSAGERIE VOC', number: '666', category: 'ADN (Répertoire SIM)' },
  { id: 'c9', slotId: 2, index: 3, name: 'BUREAU PRO', number: '+33762401189', category: 'ADN (Répertoire SIM)' }
];

export const APN_PROFILES: ApnProfile[] = [
  {
    id: 'orange-fr',
    country: 'France',
    carrier: 'Orange France',
    mcc: '208',
    mnc: '01',
    apnName: 'Orange World',
    apn: 'orange',
    apnType: 'default,supl',
    protocol: 'IPv4/IPv6',
    roamingProtocol: 'IPv4',
    authType: 'PAP',
    mmsc: 'http://mms.orange.fr',
    mmsProxy: '192.168.10.200',
    mmsPort: '8080',
    bearer: 'LTE / HSPAP / EDGE'
  },
  {
    id: 'free-fr',
    country: 'France',
    carrier: 'Free Mobile',
    mcc: '208',
    mnc: '15',
    apnName: 'Free',
    apn: 'free',
    apnType: 'default,supl,hipri',
    protocol: 'IPv4/IPv6',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    mmsc: 'http://mms.free.fr',
    bearer: 'Non spécifié (Auto MSM8937)'
  },
  {
    id: 'sfr-fr',
    country: 'France',
    carrier: 'SFR',
    mcc: '208',
    mnc: '10',
    apnName: 'SFR Webphone',
    apn: 'sl2sfr',
    apnType: 'default,supl,mms',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    mmsc: 'http://mms1',
    mmsProxy: '10.151.0.1',
    mmsPort: '8080',
    bearer: 'LTE / WCDMA'
  },
  {
    id: 'bouygues-fr',
    country: 'France',
    carrier: 'Bouygues Telecom',
    mcc: '208',
    mnc: '20',
    apnName: 'Bouygues Telecom',
    apn: 'mmsbouygtel.com',
    apnType: 'default,supl,mms',
    protocol: 'IPv4/IPv6',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    mmsc: 'http://mms.bouyguestelecom.fr/mms/wapenc',
    mmsProxy: '62.201.129.226',
    mmsPort: '8080',
    bearer: 'Non spécifié'
  },
  {
    id: 'orange-ci-sn-cm',
    country: 'Afrique (CI / SN / CM / ML / CD)',
    carrier: 'Orange Afrique',
    mcc: '612',
    mnc: '03',
    apnName: 'Orange Internet',
    apn: 'orangeinternet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'LTE / WCDMA / GSM'
  },
  {
    id: 'mtn-africa',
    country: 'Afrique (CI / CM / BJ / CG / GN)',
    carrier: 'MTN',
    mcc: '624',
    mnc: '01',
    apnName: 'MTN Internet',
    apn: 'internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'PAP',
    bearer: 'Non spécifié'
  },
  {
    id: 'moov-africa',
    country: 'Afrique (CI / BJ / TG / BF / NE)',
    carrier: 'Moov Africa',
    mcc: '612',
    mnc: '02',
    apnName: 'Moov Internet',
    apn: 'internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'Non spécifié'
  },
  {
    id: 'yas-telma-mg',
    country: 'Madagascar',
    carrier: 'Yas (ex-Telma)',
    mcc: '646',
    mnc: '04',
    apnName: 'Yas Internet',
    apn: 'internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'LTE / WCDMA'
  },
  {
    id: 'airtel-africa',
    country: 'Afrique (CD / MG / CG / GA / TD)',
    carrier: 'Airtel',
    mcc: '630',
    mnc: '02',
    apnName: 'Airtel Internet',
    apn: 'internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'Non spécifié'
  },
  {
    id: 'maroc-telecom',
    country: 'Maroc',
    carrier: 'Maroc Telecom (IAM)',
    mcc: '604',
    mnc: '01',
    apnName: 'IAM Internet',
    apn: 'www.iamgprs1.ma',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'LTE / WCDMA'
  },
  {
    id: 'mobilis-dz',
    country: 'Algérie',
    carrier: 'Mobilis',
    mcc: '603',
    mnc: '01',
    apnName: 'Mobilis Internet',
    apn: 'internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'LTE / WCDMA'
  },
  {
    id: 'djezzy-dz',
    country: 'Algérie',
    carrier: 'Djezzy',
    mcc: '603',
    mnc: '02',
    apnName: 'Djezzy Internet',
    apn: 'djezzy.internet',
    apnType: 'default,supl',
    protocol: 'IPv4',
    roamingProtocol: 'IPv4',
    authType: 'Aucune',
    bearer: 'LTE / WCDMA'
  }
];

export const SECRET_CODES: SecretCodeItem[] = [
  {
    id: 'testing-4636',
    code: '*#*#4636#*#*',
    title: 'Menu Ingénieur Radio & Forçage 4G LTE (Android 6.0.1)',
    category: 'Qualcomm MSM8937 / Android 6.0.1',
    description: 'Ouvre le panneau caché Testing d\'Android 6.0.1 sur le Vivo Y66. Permet de verrouiller le modem Snapdragon X6 sur "LTE only" pour éviter les bascules intempestives en 3G/H+, lire l\'IMSI/ICCID et lancer un test Ping.',
    funtouchPath: 'Téléphone > Clavier > Composer *#*#4636#*#* > Informations sur le téléphone (SIM 1 / SIM 2)',
    simulatedOutput: [
      '=== INFORMATIONS SUR LE TÉLÉPHONE (PD1621) ===',
      'IMEI : 863948031726419',
      'Réseau actuel : LTE (Band 3 - 1800 MHz)',
      'Puissance du signal : -84 dBm 56 asu',
      'Service vocal : En service (CSFB)',
      'Service de données : Connecté (LTE Cat.4)',
      'Type de réseau préféré : [ LTE/WCDMA/GSM auto (PRL) ]',
      'Alimentation radio mobile : [ ACTIVÉE ]'
    ]
  },
  {
    id: 'vivo-4838',
    code: '*#*#4838#*#*',
    title: 'Menu Test Réseau Alternatif Vivo Funtouch OS 3.0',
    category: 'Vivo Funtouch OS 3.0',
    description: 'Alternative spécifique aux ROMs Vivo (dont pd1621_a_1.13.15) lorsque *#*#4636#*#* est filtré par le dialer Funtouch OS.',
    funtouchPath: 'Téléphone > Clavier > Composer *#*#4838#*#*',
    simulatedOutput: [
      '=== VIVO NETWORK TESTING (PD1621_A_1.13.15) ===',
      'Sub 0 (Nano-SIM) : État READY · MCC/MNC 208/01',
      'Sub 1 (Micro-SIM) : État READY · MCC/MNC 208/15',
      'Modem Baseband : MPSS.JO.2.0.c1-00084-8937_GENNS_PACK-1',
      'Sélection de bande : GSM / WCDMA / LTE B1,B3,B5,B8,B38,B40,B41'
    ]
  },
  {
    id: 'vivo-qc-558',
    code: '*#558#',
    title: 'Usine & Diagnostic Matériel Vivo (Factory Test Mode)',
    category: 'Vivo Funtouch OS 3.0',
    description: 'Ouvre le laboratoire d\'inspection matériel Vivo sur PD1621 : test de détection physique des lecteurs SIM 1 et SIM 2, test antennes RF, calibrage et vérification de la version logicielle.',
    funtouchPath: 'Téléphone > Clavier > Composer *#558# > Engineering Test > SIM Card Test',
    simulatedOutput: [
      '=== VIVO FACTORY QC TEST (PD1621) ===',
      '[PASS] Lecteur SIM 1 (Nano-SIM) : Contact C1-C8 OK (1.8V Class C)',
      '[PASS] Lecteur SIM 2 (Micro-SIM) : Contact C1-C8 OK (1.8V Class C)',
      '[PASS] Détection tiroir hybride GPIO : Fermé',
      '[INFO] Firmware : pd1621_a_1.13.15 (Android 6.0.1)'
    ]
  },
  {
    id: 'imei-06',
    code: '*#06#',
    title: 'Lecture IMEI 1, IMEI 2 & MEID (Dual-SIM)',
    category: 'Qualcomm MSM8937 / Android 6.0.1',
    description: 'Affiche instantanément les deux identifiants IMEI dédiés aux emplacements SIM 1 et SIM 2 ainsi que le MEID du modem Qualcomm MSM8937.',
    funtouchPath: 'Téléphone > Clavier > Composer *#06#',
    simulatedOutput: [
      '=== IDENTIFIANTS MATÉRIELS VIVO Y66 ===',
      'MEID : A000005E49218B',
      'IMEI 1 (SIM 1) : 863948031726419',
      'IMEI 2 (SIM 2) : 863948031726427'
    ]
  },
  {
    id: 'vivo-09',
    code: '*#*#09#*#*',
    title: 'Vérification Version Firmware & Baseband PD1621',
    category: 'Vivo Funtouch OS 3.0',
    description: 'Affiche les détails complets de compilation de la ROM Funtouch OS 3.0 (pd1621_a_1.13.15) et de la bande de base Qualcomm.',
    funtouchPath: 'Téléphone > Clavier > Composer *#*#09#*#*',
    simulatedOutput: [
      'Modèle : vivo Y66',
      'Version logicielle : PD1621_A_1.13.15',
      'Version Android : 6.0.1',
      'Bande de base : MSM8937_GEN_PACK',
      'Noyau : 3.18.24-perf+ (gcc 4.9)'
    ]
  },
  {
    id: 'gsm-forward-21',
    code: '*#21#',
    title: 'Audit de Sécurité des Renvois d\'Appels & SMS',
    category: 'Contrôle GSM & Renvois',
    description: 'Vérifie si vos appels vocaux, SMS ou données de la carte SIM sont redirigés à votre insu vers un autre numéro.',
    funtouchPath: 'Téléphone > Clavier > Composer *#21# > Appeler (SIM 1 ou SIM 2)',
    simulatedOutput: [
      'Transfert d\'appel Inconditionnel :',
      'Voix : Non transféré',
      'Données : Non transféré',
      'SMS : Non transféré',
      'Synchronisation : Non transféré'
    ]
  },
  {
    id: 'gsm-cancel-002',
    code: '##002#',
    title: 'Désactivation Totale de Tous les Renvois SIM',
    category: 'Contrôle GSM & Renvois',
    description: 'Efface immédiatement tous les renvois d\'appels conditionnels et inconditionnels configurés sur la carte SIM auprès de l\'opérateur.',
    funtouchPath: 'Téléphone > Clavier > Composer ##002# > Appeler',
    simulatedOutput: [
      'Transfert d\'appel :',
      'Effacement réussi pour tous les services (Voix, Données, SMS).'
    ]
  },
  {
    id: 'gsm-cw-43',
    code: '*43#',
    title: 'Activation du Double Appel (Signal d\'Appel en Attente)',
    category: 'Contrôle GSM & Renvois',
    description: 'Active la notification de second appel entrant sur la carte SIM active sans couper la conversation en cours.',
    funtouchPath: 'Téléphone > Clavier > Composer *43# > Appeler',
    simulatedOutput: [
      'Appel en attente :',
      'Le service a été activé pour : Voix.'
    ]
  }
];

export const STK_MENU_TREE: Record<1 | 2, StkMenuNode[]> = {
  1: [
    {
      id: 'stk-solde',
      title: '1. Suivi Conso & Solde Principal',
      ussdEquivalent: '#123#',
      description: 'Interroge le serveur opérateur via commande PROACTIVE_COMMAND SEND_USSD.',
      responseTemplate: 'SOLDE SIM 1 (Orange) : Forfait Appels illimités · Internet 4G restant : 18,40 Go / 30 Go (valable jusqu\'au 25/11/2026). Crédit hors-forfait : 4,50 EUR.'
    },
    {
      id: 'stk-data',
      title: '2. Pass Internet 4G & Recharges',
      ussdEquivalent: '#123*2#',
      description: 'Souscription de pass Data 4G compatibles LTE B3/B20/B1.',
      responseTemplate: 'MENU PASS DATA : [1] Pass 1 Go (24h) - 2 EUR · [2] Pass 5 Go (7j) - 5 EUR · [3] Pass 15 Go (30j) - 10 EUR. Statut : Prêt à souscrire.'
    },
    {
      id: 'stk-transfert',
      title: '3. Transfert de Crédit / SOS Crédit',
      ussdEquivalent: '#123*3#',
      description: 'Envoi de crédit ou demande SOS vers un autre abonné SIM.',
      requiresInput: true,
      inputPlaceholder: 'Numéro destinataire (ex: 0612345678)',
      responseTemplate: 'STK SEND_SS : Préparation du transfert vers {{INPUT}}. Veuillez confirmer avec votre code secret opérateur.'
    },
    {
      id: 'stk-push-guard',
      title: '4. Pare-feu Messages Flash / Popups STK',
      ussdEquivalent: 'STK_ENVELOPE_FILTER',
      description: 'Bloque les messages publicitaires "Flash SMS" (Class 0) et les réveils d\'écran intempestifs du processus com.android.stk sur Android 6.0.1.',
      responseTemplate: 'PROTECTION ACTIVE : Les notifications DISPLAY_TEXT non sollicitées (Class 0 Flash SMS) sur SIM 1 sont interceptées pour préserver la batterie du Vivo Y66.'
    },
    {
      id: 'stk-config-ota',
      title: '5. Réception Paramètres APN / MMS (OTA)',
      ussdEquivalent: 'STK_OTA_PROVISION',
      description: 'Demande l\'envoi par SMS de configuration automatique des points d\'accès Internet et MMS pour Vivo PD1621.',
      responseTemplate: 'DEMANDE ENVOYÉE : Les paramètres APN automatiques pour "vivo Y66 (PD1621)" arriveront par SMS de configuration (PIN par défaut : 0000 ou 1234).'
    }
  ],
  2: [
    {
      id: 'stk2-conso',
      title: '1. État du Forfait & Enveloppe Data',
      ussdEquivalent: '555',
      description: 'Vérifie l\'état de consommation voix, SMS et données sur SIM 2.',
      responseTemplate: 'SOLDE SIM 2 (Free) : Voix : 1h42 / 2h00 · SMS/MMS illimités · Data : 42 Mo / 50 Mo consommés sur le mois en cours.'
    },
    {
      id: 'stk2-messagerie',
      title: '2. Configuration Messagerie Vocale',
      ussdEquivalent: '666',
      description: 'Paramétrage du renvoi sur non-réponse et notification par SMS.',
      responseTemplate: 'MESSAGERIE SIM 2 : Notification SMS active · Délai avant renvoi : 20 secondes (modifiable via **61*666**20#).'
    },
    {
      id: 'stk2-roaming',
      title: '3. Verrouillage Hors-Forfait International',
      ussdEquivalent: 'STK_ROAMING_LOCK',
      description: 'Empêche la connexion Data en itinérance sur le second emplacement SIM.',
      responseTemplate: 'VERROUILLAGE ACTIF : Itinérance des données bloquée sur l\'emplacement SIM 2 (Micro-SIM).'
    }
  ]
};
