import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { HomeSection } from '@/components/sections/HomeSection';
import { DesignerSection } from '@/components/sections/DesignerSection';
import { WorkersSection } from '@/components/sections/WorkersSection';
import { ControlSection } from '@/components/sections/ControlSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import CustomerDashboard from '@/pages/CustomerDashboard';
import ContractorDashboard from '@/pages/ContractorDashboard';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (user) {
    if (user.user_type === 'customer') {
      return <CustomerDashboard user={user} onLogout={handleLogout} />;
    } else if (user.user_type === 'contractor') {
      return <ContractorDashboard user={user} onLogout={handleLogout} />;
    }
  }

  const navigationItems = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'projects', icon: 'Briefcase', label: 'Проекты' },
    { id: 'designer', icon: 'Palette', label: 'Дизайнер' },
    { id: 'materials', icon: 'Package', label: 'Материалы' },
    { id: 'workers', icon: 'Users', label: 'Исполнители' },
    { id: 'foreman', icon: 'UserCog', label: 'Прораб' },
    { id: 'control', icon: 'ClipboardCheck', label: 'Контроль' },
    { id: 'profile', icon: 'User', label: 'Кабинет' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'designer':
        return <DesignerSection />;
      case 'workers':
        return <WorkersSection />;
      case 'control':
        return <ControlSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return (
          <Card className="shadow-lg border-0 animate-fade-in">
            <CardContent className="p-12 text-center">
              <Icon name="Construction" size={64} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Раздел в разработке</h3>
              <p className="text-muted-foreground">Этот функционал скоро появится!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-2xl mx-auto p-6">
        {renderContent()}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {[navigationItems[0], navigationItems[2], navigationItems[4], navigationItems[6], navigationItems[7]].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-105'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={item.icon} size={24} className="mb-1" />
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;