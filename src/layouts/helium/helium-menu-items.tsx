import { routes } from '@/config/routes';
import { BiHelpCircle, BiMessage } from 'react-icons/bi';
import HomeIcon from '@/components/custom-icons/HomeIcon';
import AddCaseIcon from '@/components/custom-icons/AddCaseIcon';
import AllCasesIcon from '@/components/custom-icons/AllCasesIcon';
import IncompleteCasesIcon from '@/components/custom-icons/IncompleteCasesIcon';
import SmileSetIcon from '@/components/custom-icons/SmileSetIcon';
import NeedsApprovalIcon from '@/components/custom-icons/NeedsApprovalIcon';
import EnFabricationIcon from '@/components/custom-icons/EnFabricationIcon';
import ExpedieIcon from '@/components/custom-icons/ExpedieIcon';
import InTreatmentIcon from '@/components/custom-icons/InTreatmentIcon';
import TermineIcon from '@/components/custom-icons/TermineIcon';
import PatientIcon from '@/components/custom-icons/PatientIcon';
import FacturationIcon from '@/components/custom-icons/FacturationIcon';
import ActivitesIcon from '@/components/custom-icons/ActivitiesIcon';
import { FaBusinessTime,FaFontAwesome} from 'react-icons/fa6';

export const menuItems = [
  // Dashboard Section
  {
    name: 'Tableau de bord',
    roles: ['admin', 'doctor', 'labo', 'hachem'],
  },
  {
    name: 'Accueil',
    href: '/',
    icon: <HomeIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'labo', 'hachem'],
  },
  {
    name: 'RealSmile AI',
    roles: ['admin'],
  },
  {
    name: 'RealSmile AI',
    href: '/realsmile-ai',
    icon: <SmileSetIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Cas RealSmile AI',
    href: '/cases/realsmile-ai',
    icon: <AllCasesIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Comptes Hub',
    roles: ['admin'],
  },
  {
    name: 'Utilisateurs',
    href: '/users',
    icon: <PatientIcon className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Docteurs',
    href: routes.doctor.list,
    icon: <PatientIcon className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Patients',
    href: routes.patients.list,
    icon: <PatientIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Commercials',
    href: routes.commercials.list,
    icon: <FaBusinessTime className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Alertes',
    href: routes.alerts,
    icon: <FaFontAwesome className="w-4 text-white" />,
    roles: ['admin'],
  },
  // Praticien Hub Section for Commercial
  {
    name: 'Praticien Hub',
    roles: ['commercial'],
  },
  {
    name: 'Mes praticiens',
    href: '/doctors',
    icon: <PatientIcon className="w-4 text-white" />,
    roles: ['commercial'],
  },
  {
    name: 'Ajouter un praticien',
    href: '/doctors/create',
    icon: <AddCaseIcon className="w-4 text-white" />,
    roles: ['commercial'],
  },
  // Cas Hub Section for Admin, Doctor, Hachem
  {
    name: 'Cas Hub',
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Ajouter un cas',
    href: routes.cases.createCase(null),
    icon: <AddCaseIcon className="w-4 text-white" />,
    roles: ['doctor'],
  },
  {
    name: 'Ajouter une goutiére de contention',
    href: routes.reatainingGutters.create,
    icon: <AddCaseIcon className="w-4 text-white" />,
    roles: ['doctor', 'admin'],
  },
  {
    name: 'Tous les cas',
    href: routes.cases.list,
    icon: <AllCasesIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Soumission Incompléte',
    href: routes.cases.incomplete,
    icon: <IncompleteCasesIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'SmileSet En Cours',
    href: routes.cases.smile_set_in_progress,
    icon: <SmileSetIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Approbation requise',
    href: routes.cases.needs_approval,
    icon: <NeedsApprovalIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'En Fabrication',
    href: routes.cases.in_construction,
    icon: <EnFabricationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Cas Expédiés',
    href: routes.cases.sent,
    icon: <ExpedieIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'En Traitement',
    href: routes.cases.in_treatment,
    icon: <InTreatmentIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Cas Terminés',
    href: routes.cases.complete,
    icon: <TermineIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Liste des goutiéres de contention',
    href: routes.reatainingGutters.list,
    icon: <AddCaseIcon className="w-4 text-white" />,
    roles: ['doctor', 'admin', 'hachem'],
  },
  // Realsmile Shop Section for Admin and Doctor
  {
    name: 'Realsmile Shop',
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Produits',
    href: '/products',
    icon: <AllCasesIcon className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Catégories',
    href: '/categories',
    icon: <SmileSetIcon className="w-4 text-white" />,
    roles: ['admin'],
  },
  {
    name: 'Commandes',
    href: '/orders',
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Labo Hub',
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
  {
    name: 'Aide Hub',
    roles: ['admin', 'doctor', 'patient', 'hachem', 'commercial'],
  },
  {
    name: 'Formations',
    icon: <BiHelpCircle className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'patient', 'hachem', 'commercial'],
    href: '/formations',
  },
  {
    name: "Centre d'aide",
    icon: <BiHelpCircle className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'patient', 'hachem', 'commercial'],
    href: '/helpdesk',
  },
  {
    name: 'Activités',
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Log des activités',
    icon: <ActivitesIcon className="w-4 text-white" />,
    href: '/activity',
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Finance Hub',
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
    href: routes.devis.list,
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'hachem'],
  },
  {
    name: 'Liste des factures',
    href: '/invoices',
    icon: <FacturationIcon className="w-4 text-white" />,
    roles: ['admin', 'doctor', 'hachem', 'finance'],
  },
  {
    name: 'Social Hub',
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Chat',
    href: '/support',
    icon: <BiMessage />,
    roles: ['admin', 'doctor'],
  },
  {
    name: 'Annoncement',
    href: '/announcement',
    icon: <BiMessage />,
    roles: ['admin'],
  },
];
