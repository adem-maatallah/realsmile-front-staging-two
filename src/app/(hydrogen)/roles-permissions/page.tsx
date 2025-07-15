import PageHeader from '@/app/shared/page-header';
import ModalButton from '@/app/shared/modal-button';
import RolesGrid from '@/app/shared/roles-permissions/roles-grid';
import CreateRole from '@/app/shared/roles-permissions/create-role';

const pageHeader = {
  title: 'Gestion des Roles & Permissions',
  breadcrumb: [
    {
      href: '/',
      name: 'Accueil',
    },
    {
      name: 'Gestion des Roles & Permissions',
    },
  ],
};

export default function RolesPermissionsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <ModalButton label="Ajouter un role" view={<CreateRole />} />
      </PageHeader>
      <RolesGrid />
    </>
  );
}
