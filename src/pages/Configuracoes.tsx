import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Moon,
  Sun,
  Palette,
  Shield,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Configuracoes: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'data'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    studyReminders: true,
    taskDueDates: true,
    examReminders: true,
    flashcardReviews: true,
    achievementAlerts: true,
    emailNotifications: false
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    fontSize: 'medium',
    compactMode: false
  });

  useEffect(() => {
    setAppearanceSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await updateUser(profileData);
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      setMessage('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (securitySettings.newPassword.length < 6) {
      setMessage('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      // Aqui você implementaria a mudança de senha
      setMessage('Senha alterada com sucesso!');
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false
      });
    } catch (error) {
      setMessage('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    // Implementar exportação de dados
    setMessage('Exportação iniciada. Você receberá um email com seus dados.');
  };

  const handleDataDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir todos os seus dados? Esta ação não pode ser desfeita.')) {
      // Implementar exclusão de dados
      setMessage('Solicitação de exclusão enviada. Você receberá um email de confirmação.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'data', name: 'Dados', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-300">Gerencie suas preferências e configurações da conta</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações do Perfil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Configurações de Notificação</h3>
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {key === 'studyReminders' && 'Lembretes de estudo'}
                          {key === 'taskDueDates' && 'Prazos de tarefas'}
                          {key === 'examReminders' && 'Lembretes de simulados'}
                          {key === 'flashcardReviews' && 'Revisões de flashcards'}
                          {key === 'achievementAlerts' && 'Alertas de conquistas'}
                          {key === 'emailNotifications' && 'Notificações por email'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {key === 'studyReminders' && 'Receba lembretes para suas sessões de estudo'}
                          {key === 'taskDueDates' && 'Seja notificado sobre tarefas próximas do prazo'}
                          {key === 'examReminders' && 'Lembretes para simulados agendados'}
                          {key === 'flashcardReviews' && 'Notificações para revisões pendentes'}
                          {key === 'achievementAlerts' && 'Celebre suas conquistas'}
                          {key === 'emailNotifications' && 'Receba notificações importantes por email'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          [key]: !value
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Aparência</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-md ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Sun className="h-4 w-4" />
                        <span>Claro</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-md ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Moon className="h-4 w-4" />
                        <span>Escuro</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tamanho da Fonte</label>
                    <select
                      value={appearanceSettings.fontSize}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Modo Compacto</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reduz o espaçamento entre elementos</p>
                    </div>
                    <button
                      onClick={() => setAppearanceSettings({
                        ...appearanceSettings,
                        compactMode: !appearanceSettings.compactMode
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        appearanceSettings.compactMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Segurança</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={securitySettings.showPassword ? 'text' : 'password'}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={securitySettings.showPassword ? 'text' : 'password'}
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={securitySettings.showPassword ? 'text' : 'password'}
                        value={securitySettings.confirmPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirme a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setSecuritySettings({ ...securitySettings, showPassword: !securitySettings.showPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {securitySettings.showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={handlePasswordChange}
                      disabled={loading || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Gerenciamento de Dados</h3>
                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Exportar Dados</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Baixe uma cópia de todos os seus dados em formato JSON
                        </p>
                      </div>
                      <button
                        onClick={handleDataExport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </button>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">Excluir Conta</h4>
                        <p className="text-sm text-red-600">
                          Exclua permanentemente sua conta e todos os dados associados
                        </p>
                      </div>
                      <button
                        onClick={handleDataDelete}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Conta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
