
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './AppContext';
import { ROUTE_PATHS, MOCK_TRANSCRIPT_WORDS, MOCK_ANNOTATIONS, MOCK_SESSIONS, MOCK_USER, USER_CIRCLE_ICON, LOGOUT_ICON, GEAR_ICON } from './constants';
import { Word, Annotation, TranscriptionSession, KnowledgeResult, User } from './types';
import {
  Button,
  Card,
  Input,
  Modal,
  Spinner,
  LoginForm,
  RegistrationForm,
  WalletConnectButton,
  LemonSqueezyPlaceholder,
  TranscriptionViewer,
  AudioControlsSimulator,
  AnnotationModal,
  KnowledgePanel,
  SessionList,
  ProfileEditorForm,
  PaymentSettingsPlaceholder,
  NotificationArea,
} from './components';
import { GeminiService, MockTranscriptionService } from './services';

// --- Layout Components ---
const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAppContext();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: ROUTE_PATHS.TRANSCRIPTION, label: 'Transcribe', authRequired: true },
    { path: ROUTE_PATHS.SESSIONS, label: 'Sessions', authRequired: true },
  ];

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? 'bg-gray-700 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <nav className="bg-gray-900 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTE_PATHS.HOME} className="flex-shrink-0 text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              AI Transcribe
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map(item => (
                  (item.authRequired && isAuthenticated) || !item.authRequired ? (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`${getLinkClass(item.path)} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                    >
                      {item.label}
                    </Link>
                  ) : null
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-sm rounded-full text-white focus:outline-none hover:bg-gray-700 p-2 transition-colors">
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full bg-gray-700" src={`https://picsum.photos/seed/${user.id}/32/32`} alt="User avatar" />
                    <span className="ml-2 hidden sm:inline">{user.name || user.email || "User"}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 text-gray-400">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link to={ROUTE_PATHS.PROFILE} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <span dangerouslySetInnerHTML={{__html: USER_CIRCLE_ICON}} className="text-gray-400" /> Profile
                      </Link>
                      <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left transition-colors">
                        <span dangerouslySetInnerHTML={{__html: LOGOUT_ICON}} className="text-gray-400" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={ROUTE_PATHS.LOGIN} className={`${getLinkClass(ROUTE_PATHS.LOGIN)} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
                  Login
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button - can be implemented if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppContext();
  
  if (isLoading) { // Optional: show a loading spinner while checking auth
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg"/></div>;
  }

  return isAuthenticated ? children : <Navigate to={ROUTE_PATHS.LOGIN} replace />;
};

// --- Page Components ---

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppContext();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTE_PATHS.TRANSCRIPTION);
    }
  }, [isAuthenticated, navigate]);
  
  if (isLoading && !isAuthenticated) { // Show spinner only if not yet authenticated and still loading.
     return <div className="flex justify-center items-center h-screen"><Spinner size="lg"/></div>;
  }
  if (isAuthenticated) return null; // Avoid rendering login form if already authenticated

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>
        <Card className="bg-gray-800">
          {isRegistering ? (
            <RegistrationForm onSwitchToLogin={() => setIsRegistering(false)} />
          ) : (
            <>
              <LoginForm />
              <p className="mt-6 text-sm text-center text-gray-400">
                Don't have an account?{' '}
                <button onClick={() => setIsRegistering(true)} className="font-medium text-indigo-400 hover:text-indigo-300">
                  Sign Up
                </button>
              </p>
            </>
          )}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <WalletConnectButton />
            </div>
          </div>
          <LemonSqueezyPlaceholder />
        </Card>
      </div>
    </div>
  );
};

const TranscriptionPage: React.FC = () => {
  const { addNotification } = useAppContext();
  const [transcriptWords, setTranscriptWords] = useState<Word[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>(MOCK_ANNOTATIONS);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedWordForAnnotation, setSelectedWordForAnnotation] = useState<Word | undefined>(undefined);
  const [annotationModalOpen, setAnnotationModalOpen] = useState<boolean>(false);
  const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeResult[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState<boolean>(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState<boolean>(true);
  
  const processedKeywords = useRef<Set<string>>(new Set());
  const audioDuration = MOCK_TRANSCRIPT_WORDS.length > 0 ? MOCK_TRANSCRIPT_WORDS[MOCK_TRANSCRIPT_WORDS.length - 1].end : 0;
  const playbackIntervalRef = useRef<number | null>(null);

  const fetchKnowledgeForKeyword = useCallback(async (keyword: string) => {
    if (processedKeywords.current.has(keyword.toLowerCase())) return;
    processedKeywords.current.add(keyword.toLowerCase());
    
    setKnowledgeLoading(true);
    addNotification(`Searching for: "${keyword}"...`, "info");
    const result = await GeminiService.fetchKnowledge(keyword);
    if (result) {
      setKnowledgeResults(prev => [result, ...prev]); // Add new results to the top
      if (result.summary.startsWith("Error:")) {
        addNotification(`Knowledge retrieval error for "${keyword}": ${result.summary}`, "error");
      } else {
        addNotification(`Knowledge for "${keyword}" retrieved.`, "success");
      }
    }
    setKnowledgeLoading(false);
  }, [addNotification]);

  // Simulate real-time transcription and keyword detection
  useEffect(() => {
    if (isRecording) {
      let wordIndex = 0;
      setTranscriptWords([]); // Clear previous words
      processedKeywords.current.clear(); // Clear processed keywords for new recording
      setKnowledgeResults([]); // Clear knowledge results

      const intervalId = setInterval(() => {
        if (wordIndex < MOCK_TRANSCRIPT_WORDS.length) {
          const newWord = MOCK_TRANSCRIPT_WORDS[wordIndex];
          setTranscriptWords(prev => [...prev, newWord]);
          setCurrentPlayTime(newWord.end); // Keep player in sync with live transcript
          if (newWord.keyword) {
            fetchKnowledgeForKeyword(newWord.keyword);
          }
          wordIndex++;
        } else {
          clearInterval(intervalId);
          setIsRecording(false); // Auto-stop when mock data ends
          addNotification("Mock recording finished.", "info");
        }
      }, 800); // Add a word every 800ms
      return () => clearInterval(intervalId);
    } else if (transcriptWords.length === 0 && !isRecording) { // Load initial transcript if not recording
        setTranscriptWords(MOCK_TRANSCRIPT_WORDS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, fetchKnowledgeForKeyword]); // transcriptWords dependency removed to avoid loop when loading initial set

  // Simulate audio playback
  useEffect(() => {
    if (isPlaying && !isRecording) {
      playbackIntervalRef.current = window.setInterval(() => {
        setCurrentPlayTime(prevTime => {
          const nextTime = prevTime + 0.1;
          if (nextTime >= audioDuration) {
            setIsPlaying(false);
            return audioDuration;
          }
          // Check for keywords during playback too
          const currentWord = transcriptWords.find(w => nextTime >= w.start && nextTime < w.end);
          if (currentWord?.keyword) {
            fetchKnowledgeForKeyword(currentWord.keyword);
          }
          return nextTime;
        });
      }, 100);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, audioDuration, isRecording, transcriptWords, fetchKnowledgeForKeyword]);

  const handlePlayPause = () => {
    if (isRecording) return;
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentPlayTime >= audioDuration) { // If at end, restart
      setCurrentPlayTime(0);
    }
  };

  const handleStop = () => {
    if (isRecording) return;
    setIsPlaying(false);
    setCurrentPlayTime(0);
  };

  const handleSeek = (time: number) => {
    if (isRecording) return;
    setCurrentPlayTime(time);
    if (!isPlaying && time < audioDuration) { // If paused and seek, prime for play
      // setIsPlaying(true); // Optionally auto-play on seek
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await MockTranscriptionService.stopTranscription("mock-stream-123");
      setIsRecording(false);
      addNotification("Recording stopped.", "info");
    } else {
      const { streamId } = await MockTranscriptionService.startTranscription();
       if(streamId){
         setIsRecording(true);
         setTranscriptWords([]); // Clear for new recording
         setCurrentPlayTime(0);
         setIsPlaying(false);
         addNotification("Recording started (simulated).", "info");
       } else {
         addNotification("Failed to start recording.", "error");
       }
    }
  };

  const handleWordClick = (word: Word) => {
    setSelectedWordForAnnotation(word);
    setAnnotationModalOpen(true);
  };

  const handleSaveAnnotation = (text: string) => {
    if (selectedWordForAnnotation) {
      const newAnnotation: Annotation = {
        id: `anno-${Date.now()}`,
        wordId: selectedWordForAnnotation.id,
        timestamp: selectedWordForAnnotation.start,
        text,
        createdAt: new Date(),
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      addNotification("Annotation saved!", "success");
    }
    setAnnotationModalOpen(false);
    setSelectedWordForAnnotation(undefined);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]"> {/* Adjust height for navbar */}
      <div className={`flex-grow flex flex-col ${showKnowledgePanel ? 'w-full md:w-2/3 lg:w-3/4' : 'w-full'}`}>
        <div className="p-4 bg-gray-900 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-100">Transcription Editor</h2>
            <Button onClick={() => setShowKnowledgePanel(!showKnowledgePanel)} variant="ghost" size="sm">
                {showKnowledgePanel ? "Hide" : "Show"} Knowledge Panel
            </Button>
        </div>
        <TranscriptionViewer
          words={transcriptWords}
          annotations={annotations}
          currentPlayTime={currentPlayTime}
          onWordClick={handleWordClick}
          selectedWordId={selectedWordForAnnotation?.id}
        />
        <AudioControlsSimulator
          duration={audioDuration}
          isPlaying={isPlaying}
          currentPlayTime={currentPlayTime}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSeek={handleSeek}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
        />
      </div>
      {showKnowledgePanel && (
        <KnowledgePanel
          keywords={Array.from(processedKeywords.current)}
          knowledgeResults={knowledgeResults}
          isLoading={knowledgeLoading}
        />
      )}
      <AnnotationModal
        isOpen={annotationModalOpen}
        onClose={() => setAnnotationModalOpen(false)}
        onSave={handleSaveAnnotation}
        word={selectedWordForAnnotation}
        timestamp={selectedWordForAnnotation?.start}
      />
    </div>
  );
};


const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<TranscriptionSession[]>(MOCK_SESSIONS);
  const { addNotification } = useAppContext();
  const navigate = useNavigate();

  const handleSelectSession = (session: TranscriptionSession) => {
    addNotification(`Loading session: ${session.title}`, "info");
    // Here you would typically navigate to the editor with this session's data
    // For now, just log it. In a real app:
    // navigate(`${ROUTE_PATHS.TRANSCRIPTION}/${session.id}`);
    console.log("Selected session:", session);
    navigate(ROUTE_PATHS.TRANSCRIPTION); // Go to a generic transcription page for now
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-semibold text-gray-100 mb-6">Past Transcription Sessions</h2>
      <SessionList sessions={sessions} onSelectSession={handleSelectSession} />
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout, addNotification } = useAppContext();
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  if (!currentUser) {
    return <Navigate to={ROUTE_PATHS.LOGIN} />;
  }

  const handleUpdateProfile = (updatedUser: Partial<User>) => {
    // In a real app, call an API to update user
    setCurrentUser(prev => ({ ...prev!, ...updatedUser }));
    // The AppContext user would also need to be updated if this was a real API call
    console.log("Updated profile (simulated):", updatedUser);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-100">User Profile</h2>
        <Button variant="danger" onClick={logout} leftIcon={<span dangerouslySetInnerHTML={{__html: LOGOUT_ICON}}/>}>
          Sign Out
        </Button>
      </div>
      <Card className="mb-6">
         <div className="flex items-center space-x-4 mb-6">
            <img className="h-20 w-20 rounded-full bg-gray-700" src={`https://picsum.photos/seed/${currentUser.id}/128/128`} alt="User avatar" />
            <div>
                <h3 className="text-xl font-semibold text-white">{currentUser.name || 'User'}</h3>
                <p className="text-sm text-gray-400">{currentUser.email || currentUser.walletAddress}</p>
            </div>
        </div>
        <ProfileEditorForm user={currentUser} onUpdateProfile={handleUpdateProfile} />
      </Card>
      <PaymentSettingsPlaceholder />
    </div>
  );
};

const HomePage: React.FC = () => {
    const { isAuthenticated } = useAppContext();
    if (isAuthenticated) {
        return <Navigate to={ROUTE_PATHS.TRANSCRIPTION} replace />;
    }
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
};


// --- Main App Structure ---
const AppRoutes: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-900 text-gray-100 flex-grow">
        <Routes>
          <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />
          <Route 
            path={ROUTE_PATHS.TRANSCRIPTION} 
            element={<ProtectedRoute><TranscriptionPage /></ProtectedRoute>} 
          />
          <Route 
            path={ROUTE_PATHS.SESSIONS} 
            element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} 
          />
          <Route 
            path={ROUTE_PATHS.PROFILE} 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} /> {/* Catch-all */}
        </Routes>
      </main>
      <NotificationArea />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
           <AppRoutes />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
