import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import LoginHistoryTab from './LoginHistoryTab';
import UserFormModal from './UserFormModal';
import UserDirectory from './components/UserDirectory';
import UserManagementHeader from './components/UserManagementHeader';
import { useUserManagement } from './hooks/useUserManagement';

const UserManagement = () => {
  const users = useUserManagement();

  return (
    <main className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full flex-grow relative">
      <UserManagementHeader activeTab={users.activeTab} onAdd={users.openAddModal} onTabChange={users.setActiveTab} />

      {users.activeTab === 'usuarios' && (
        <UserDirectory
          users={users.filteredUsers}
          searchTerm={users.searchTerm}
          onSearchChange={users.setSearchTerm}
          onExport={users.handleExport}
          onEdit={users.openEditModal}
          onToggle={users.toggleUserStatus}
          isLoading={users.isLoading}
        />
      )}
      {users.activeTab === 'sesiones' && <LoginHistoryTab />}

      {users.showAddModal && (
        <UserFormModal initialData={users.formData} onSubmit={users.handleCreateSubmit} onClose={users.closeAddModal} isSaving={users.isSaving} isEdit={false} />
      )}
      {users.editingUser && (
        <UserFormModal initialData={users.formData} onSubmit={users.handleEditSubmit} onClose={users.closeEditModal} isSaving={users.isSaving} isEdit editingUser={users.editingUser} />
      )}
      {users.confirmModal.show && (
        <ConfirmActionModal
          title={users.confirmModal.isActivating ? 'Reactivar Usuario' : 'Desactivar Usuario'}
          message={`¿Estás seguro de que deseas ${users.confirmModal.isActivating ? 'reactivar' : 'desactivar'} el usuario ${users.confirmModal.user?.nombre_razonsocial}?`}
          warningText={!users.confirmModal.isActivating ? 'El usuario no podrá iniciar sesión en el sistema.' : undefined}
          confirmText={users.confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, desactivar'}
          isDestructive={!users.confirmModal.isActivating}
          isLoading={users.isSaving}
          icon={users.confirmModal.isActivating ? 'person_add' : 'person_off'}
          onConfirm={users.executeToggleUser}
          onClose={users.closeConfirmModal}
        />
      )}
      {users.pdfPreviewUrl && (
        <PdfPreviewModal pdfBlobUrl={users.pdfPreviewUrl} title="Reporte de Usuarios" downloadFileName={`usuarios_${new Date().toISOString().slice(0, 10)}.pdf`} onClose={users.closePdfModal} />
      )}
    </main>
  );
};

export default UserManagement;
