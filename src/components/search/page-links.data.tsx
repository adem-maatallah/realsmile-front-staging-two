import { routes } from '@/config/routes';
import FolderLockIcon from '@/components/icons/folder-lock';
import HouseIcon from '@/components/icons/house';
import UsersColorIcon from '@/components/icons/users-color';
import {
  PiPersonArmsSpreadLight,
  PiFolderPlusFill,
  PiFolderOpenBold,
} from 'react-icons/pi';
import { BiHelpCircle, BiMessage } from 'react-icons/bi';
import ActivitesIcon from '../custom-icons/ActivitiesIcon';
import FacturationIcon from '../custom-icons/FacturationIcon';
import AllCasesIcon from '../custom-icons/AllCasesIcon';
import SmileSetIcon from '../custom-icons/SmileSetIcon';
import AddCaseIcon from '../custom-icons/AddCaseIcon';
import { FaBusinessTime } from 'react-icons/fa6';

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  {
    name: 'Tableau de bord',
    roles: ['admin', 'doctor', 'labo', 'hachem'],
  },
  {
    name: 'Accueil',
    href: '/',
    icon: <HouseIcon />,
    roles: ['admin', 'doctor', 'labo', 'hachem'],
  },
  {
    name: 'Comptes hub',
    roles: ['admin'],
  },
  {
    name: 'Utilisateurs',
    href: '/users',
    icon: <UsersColorIcon />,
    roles: ['admin'],
  },
  {
    name: 'Docteurs',
    href: '/doctors',
    icon: <FolderLockIcon />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Ajouter un patient',
    href: routes.patients.createPatient,
    icon: <PiFolderPlusFill />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Commerciaux',
    href: routes.commercials.list,
    icon: <FaBusinessTime className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Alertes',
    href: routes.alerts,
    icon: <FaBusinessTime className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Cas hub',
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Ajouter un cas',
    href: routes.cases.createCase,
    icon: <PiFolderPlusFill />,
    roles: ['doctor'],
  },
  {
    name: 'Tous les cas',
    href: routes.cases.list,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Cas incomplétes',
    href: routes.cases.incomplete,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'SmileSet En Cours',
    href: routes.cases.smile_set_in_progress,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Approbation requise',
    href: routes.cases.needs_approval,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'En Fabrication',
    href: routes.cases.in_construction,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Cas Expédiés',
    href: routes.cases.sent,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'En Traitement',
    href: routes.cases.in_treatment,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Cas Terminés',
    href: routes.cases.complete,
    icon: <PiFolderOpenBold />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Patients',
    href: routes.patients.list,
    icon: <PiPersonArmsSpreadLight />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Realsmile Shop',
    roles: ['admin', 'doctor'],
  },

  {
    name: 'Labo hub',
    roles: ['admin', 'hachem', 'labo'],
  },
  {
    name: 'All available cases',
    href: routes.laboratory.list,
    icon: <AllCasesIcon className="w-4 text-white" />,
    roles: ['admin', 'labo'],
  },
  {
    name: 'In Construction cases',
    href: routes.laboratory.in_construction,
    icon: <AllCasesIcon className="w-4 text-white" />,
    roles: ['labo', 'admin', 'hachem'],
  },

  // Éléments spécifiques à l'admin pour E-commerce
  {
    name: 'Produits',
    href: '/products',
    icon: <AllCasesIcon className="w-4 text-white" />, // Remplacez par une icône appropriée
    roles: ['admin'],
  },
  {
    name: 'Catégories',
    href: '/categories',
    icon: <SmileSetIcon className="w-4 text-white" />, // Remplacez par une icône pertinente
    roles: ['admin'],
  },
  {
    name: 'Commandes',
    href: '/orders',
    icon: <FacturationIcon className="w-4 text-white" />, // Remplacez par une icône appropriée
    roles: ['admin', 'doctor'],
  },

  // Éléments spécifiques au docteur pour E-commerce
  {
    name: 'Boutique',
    href: '/shop',
    icon: <AddCaseIcon className="w-4 text-white" />, // Remplacez par une icône liée à une boutique
    roles: ['doctor'],
  },
  {
    name: 'Aide Hub',
    roles: ['admin', 'labo', 'doctor', 'patient', 'hachem'],
  },
  {
    name: "Centre d'aide",
    icon: <BiHelpCircle className="w-4 text-white" />,
    roles: ['admin', 'labo', 'doctor', 'patient', 'hachem'],
    href: '/helpdesk',
  },
  {
    name: 'Activités',
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Log des activités',
    href: '/activities',
    icon: <ActivitesIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Finance hub',
    roles: ['admin', 'doctor', 'patient', 'hachem'],
  },
  {
    name: 'Nos Tarifs',
    href: '/pricing',
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Liste des devis',
    // badge: true,
    href: routes.devis.list,
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Liste des factures',
    href: '/invoices',
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Social hub',
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Chat',
    icon: <BiMessage />,
    roles: ['admin', 'doctor'],
    href: '/support',
  },
  {
    name: 'Annoncement',
    icon: <BiMessage />,
    roles: ['admin'],
    href: '/announcement',
  },
];
