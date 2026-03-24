import { useEffect } from 'react';
import { initDatabase } from './db/database';
import { useAppStore } from './stores/appStore';
import { useQuestStore } from './stores/questStore';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardScreen } from './screens/DashboardScreen';
import { PrepScreen } from './screens/PrepScreen';
import { ActiveScreen } from './screens/ActiveScreen';
import { DebriefScreen } from './screens/DebriefScreen';
import { QuestsScreen } from './screens/QuestsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';

function App() {
  const { screen } = useAppStore();
  const { loadQuests } = useQuestStore();

  useEffect(() => {
    initDatabase()
      .then(() => loadQuests())
      .catch(err => console.error('Failed to init database:', err));
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'prep':
        return <PrepScreen />;
      case 'active':
        return <ActiveScreen />;
      case 'debrief':
        return <DebriefScreen />;
      case 'quests':
        return <QuestsScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Active screen is fullscreen/immersive — skip the normal layout
  if (screen === 'active') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0f0f0f',
          overflow: 'hidden',
        }}
      >
        <ActiveScreen />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0f0f0f',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <TopBar />

      {/* Body: sidebar + main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: '#0f0f0f',
          }}
        >
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default App;
