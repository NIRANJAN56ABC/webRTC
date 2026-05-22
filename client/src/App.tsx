import { ChatProvider, useChat } from './context/ChatContext.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';

function AppContent() {
  const { status } = useChat();

  // Show landing page only when truly idle (never started)
  if (status === 'idle') {
    return <LandingPage />;
  }

  return <ChatPage />;
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
