import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Word, Annotation, TranscriptionSession, KnowledgeResult, User, AuthMethod } from './types';
import { MIC_ICON, PLAY_ICON, PAUSE_ICON, STOP_ICON, ANNOTATE_ICON, KNOWLEDGE_ICON, MOCK_TRANSCRIPT_WORDS } from './constants';
import { GeminiService, MockPaymentService, MockTranscriptionService } from './services';
import { useAppContext } from './AppContext';

// --- UI Elements ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading = false, className = '',  leftIcon, rightIcon, ...props }) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition ease-in-out duration-150 inline-flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 focus:ring-indigo-500 border border-gray-600'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.disabled || isLoading ? disabledStyles : ''} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={id}
        className={`block w-full px-3 py-2 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-100 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea
        id={id}
        className={`block w-full px-3 py-2 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-100 ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div className={`bg-gray-800 shadow-lg rounded-lg p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-[6px]',
  };
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-indigo-500 border-t-transparent ${className}`} />
  );
};

export const Tooltip: React.FC<{ text: string; children: React.ReactElement; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" 
         onMouseEnter={() => setVisible(true)} 
         onMouseLeave={() => setVisible(false)}
         onFocus={() => setVisible(true)}
         onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

// --- Auth Components ---
export const LoginForm: React.FC = () => {
  const { login, isLoading, addNotification } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification("Please enter email and password.", "error");
      return;
    }
    await login(AuthMethod.EMAIL, { email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input type="email" label="Email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
      <Input type="password" label="Password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
      <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
        Sign In
      </Button>
    </form>
  );
};

export const RegistrationForm: React.FC<{onSwitchToLogin: () => void}> = ({onSwitchToLogin}) => {
  const { register, isLoading, addNotification } = useAppContext();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      addNotification("Please fill all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addNotification("Passwords do not match.", "error");
      return;
    }
    await register({ email, password, name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input type="text" label="Full Name" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required autoComplete="name"/>
      <Input type="email" label="Email" id="reg-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/>
      <Input type="password" label="Password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password"/>
      <Input type="password" label="Confirm Password" id="reg-confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password"/>
      <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
        Create Account
      </Button>
      <p className="text-sm text-center text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-medium text-indigo-400 hover:text-indigo-300">
          Sign In
        </button>
      </p>
    </form>
  );
};


export const WalletConnectButton: React.FC = () => {
  const { login, isLoading } = useAppContext();
  const handleWalletLogin = async () => {
    await login(AuthMethod.WALLET);
  };
  return (
    <Button onClick={handleWalletLogin} variant="secondary" className="w-full" isLoading={isLoading} disabled={isLoading}>
      Connect Wallet (Simulated)
    </Button>
  );
};

export const LemonSqueezyPlaceholder: React.FC = () => {
  const { addNotification } = useAppContext();
  const handlePayment = async () => {
    addNotification("Redirecting to LemonSqueezy (Simulated)...", "info");
    const result = await MockPaymentService.initiateSubscription("pro_plan");
    if (result.success && result.checkoutUrl) {
      // In a real app, you might redirect: window.location.href = result.checkoutUrl;
      addNotification(`Checkout URL (simulated): ${result.checkoutUrl}`, "success");
    } else {
      addNotification(result.error || "Payment initiation failed.", "error");
    }
  };
  return (
    <div className="mt-4 p-4 border border-dashed border-yellow-500 rounded-md bg-yellow-900_ bg-opacity-20">
      <p className="text-sm text-yellow-300 mb-2">This is a placeholder for LemonSqueezy integration.</p>
      <Button onClick={handlePayment} variant="secondary" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
        Subscribe via LemonSqueezy (Simulated)
      </Button>
    </div>
  );
};

// --- Transcription Components ---

interface TranscriptionViewerProps {
  words: Word[];
  annotations: Annotation[];
  currentPlayTime: number;
  onWordClick: (word: Word) => void;
  selectedWordId?: string;
}

export const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({ words, annotations, currentPlayTime, onWordClick, selectedWordId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeWordRef.current && viewerRef.current) {
      // Scroll the active word into view
      const viewerRect = viewerRef.current.getBoundingClientRect();
      const wordRect = activeWordRef.current.getBoundingClientRect();
      
      if (wordRect.bottom > viewerRect.bottom || wordRect.top < viewerRect.top) {
         activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPlayTime]); // Depends on when active word changes

  return (
    <div ref={viewerRef} className="h-[calc(100vh-300px)] overflow-y-auto p-4 bg-gray-800 rounded-md shadow-inner space-y-2 custom-scrollbar">
      {words.map((word, index) => {
        const isActive = currentPlayTime >= word.start && currentPlayTime < word.end;
        const isAnnotated = annotations.some(a => a.wordId === word.id);
        const speakerColor = word.speaker === 1 ? 'text-sky-300' : word.speaker === 2 ? 'text-emerald-300' : 'text-gray-300';

        return (
          <span key={word.id} ref={isActive ? activeWordRef : null}>
            {word.speaker && index > 0 && words[index-1].speaker !== word.speaker && <br />} 
            {word.speaker && (index === 0 || words[index-1].speaker !== word.speaker) && 
                <span className={`font-semibold mr-2 ${speakerColor}`}>Speaker {word.speaker}:</span>
            }
            <span
              onClick={() => onWordClick(word)}
              className={`cursor-pointer hover:bg-gray-600 p-0.5 rounded-sm transition-colors duration-150
                ${isActive ? 'bg-indigo-600 text-white font-semibold' : speakerColor}
                ${selectedWordId === word.id ? 'ring-2 ring-yellow-400' : ''}
                ${isAnnotated ? 'underline decoration-yellow-400 decoration-dotted' : ''}
              `}
            >
              {word.text}
            </span>{' '}
          </span>
        );
      })}
    </div>
  );
};

interface AudioControlsSimulatorProps {
  duration: number;
  isPlaying: boolean;
  currentPlayTime: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const AudioControlsSimulator: React.FC<AudioControlsSimulatorProps> = ({
  duration, isPlaying, currentPlayTime, onPlayPause, onStop, onSeek, isRecording, onToggleRecording
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="p-4 bg-gray-850 rounded-b-md flex items-center space-x-4">
       <Tooltip text={isRecording ? "Stop Recording" : "Start Recording"}>
        <button
          onClick={onToggleRecording}
          className={`p-2 rounded-full ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
          dangerouslySetInnerHTML={{ __html: MIC_ICON }}
        />
      </Tooltip>
      <Tooltip text={isPlaying ? "Pause" : "Play"}>
        <button
          onClick={onPlayPause}
          disabled={isRecording}
          className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
          dangerouslySetInnerHTML={{ __html: isPlaying ? PAUSE_ICON : PLAY_ICON }}
        />
      </Tooltip>
      <Tooltip text="Stop">
        <button
          onClick={onStop}
          disabled={isRecording}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
          dangerouslySetInnerHTML={{ __html: STOP_ICON }}
        />
      </Tooltip>
      <span className="text-sm text-gray-400">{formatTime(currentPlayTime)}</span>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentPlayTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        disabled={isRecording}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
      />
      <span className="text-sm text-gray-400">{formatTime(duration)}</span>
    </div>
  );
};

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  word?: Word;
  timestamp?: number;
  existingAnnotation?: Annotation;
}

export const AnnotationModal: React.FC<AnnotationModalProps> = ({ isOpen, onClose, onSave, word, timestamp, existingAnnotation }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (existingAnnotation) {
      setText(existingAnnotation.text);
    } else {
      setText(''); // Reset for new annotation
    }
  }, [existingAnnotation, isOpen]);


  const handleSave = () => {
    if(text.trim()){
      onSave(text);
      setText(''); // Reset after save
    }
  };
  
  const title = existingAnnotation ? "Edit Annotation" : "Add Annotation";
  const targetInfo = word ? `for "${word.text}"` : timestamp ? `at ${timestamp.toFixed(1)}s` : "";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${title} ${targetInfo}`}>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your annotation..."
        rows={4}
        className="mb-4"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Annotation</Button>
      </div>
    </Modal>
  );
};


// --- Knowledge Panel Components ---
interface KnowledgePanelProps {
  keywords: string[]; // Keywords that have triggered search
  knowledgeResults: KnowledgeResult[];
  isLoading: boolean;
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ knowledgeResults, isLoading }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-gray-850 h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <span dangerouslySetInnerHTML={{__html: KNOWLEDGE_ICON}} className="mr-2 text-indigo-400"/>
        Real-time Knowledge
      </h3>
      {isLoading && knowledgeResults.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32">
            <Spinner />
            <p className="text-gray-400 mt-2">Fetching insights...</p>
        </div>
      )}
      {!isLoading && knowledgeResults.length === 0 && (
        <p className="text-gray-500 text-sm">Relevant information will appear here as you transcribe.</p>
      )}
      <div className="space-y-4">
        {knowledgeResults.map((result) => (
          <KnowledgeItemCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};

const KnowledgeItemCard: React.FC<{ result: KnowledgeResult }> = ({ result }) => {
  return (
    <Card className="bg-gray-800 hover:bg-gray-700/50 transition-colors duration-150">
      <h4 className="text-md font-semibold text-indigo-300 mb-1">
        {result.query}
        <span className="text-xs text-gray-500 ml-2">({new Date(result.timestamp).toLocaleTimeString()})</span>
      </h4>
      <p className="text-sm text-gray-300 mb-2">{result.summary}</p>
      {result.source && result.source.uri && (
        <a
          href={result.source.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:text-sky-300 hover:underline break-all"
        >
          Source: {result.source.title || result.source.uri}
        </a>
      )}
      {result.summary.startsWith("Error:") && (
         <p className="text-xs text-red-400 mt-1">{result.summary}</p>
      )}
    </Card>
  );
};

// --- Session Components ---
interface SessionListProps {
  sessions: TranscriptionSession[];
  onSelectSession: (session: TranscriptionSession) => void;
}
export const SessionList: React.FC<SessionListProps> = ({ sessions, onSelectSession }) => {
  if (sessions.length === 0) {
    return <p className="text-gray-400">No past sessions found.</p>;
  }
  return (
    <div className="space-y-4">
      {sessions.map(session => (
        <SessionListItem key={session.id} session={session} onSelect={onSelectSession} />
      ))}
    </div>
  );
};

const SessionListItem: React.FC<{ session: TranscriptionSession; onSelect: (session: TranscriptionSession) => void; }> = ({ session, onSelect }) => {
  const { addNotification } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendToCloud = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    setIsProcessing(true);
    addNotification(`Sending "${session.title}" to cloud for processing...`, 'info');
    const result = await MockTranscriptionService.sendToCloudForProcessing(session.id);
    if (result.success) {
      addNotification(result.message || "Session sent to cloud!", 'success');
    } else {
      addNotification("Failed to send session to cloud.", 'error');
    }
    setIsProcessing(false);
  };

  return (
    <Card className="hover:shadow-indigo-500/30 cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1" onClick={() => onSelect(session)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-indigo-400">{session.title}</h3>
          <p className="text-sm text-gray-400">
            {new Date(session.createdAt).toLocaleDateString()} - {Math.floor(session.duration / 60)} min
          </p>
          {session.summary && <p className="text-sm text-gray-300 mt-1 truncate">{session.summary}</p>}
        </div>
        <Tooltip text="Send to cloud for enhanced STT (Simulated)">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSendToCloud}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            ☁️ Send
          </Button>
        </Tooltip>
      </div>
       <p className="text-xs text-gray-500 mt-2">{session.annotations.length} annotation(s)</p>
    </Card>
  );
};

// --- Profile Components ---
export const ProfileEditorForm: React.FC<{ user: User; onUpdateProfile: (updatedUser: Partial<User>) => void }> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const { addNotification } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email });
    addNotification("Profile updated successfully!", "success");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Full Name" id="profile-name" value={name} onChange={e => setName(e.target.value)} />
      <Input type="email" label="Email Address" id="profile-email" value={email} onChange={e => setEmail(e.target.value)} />
      {user.walletAddress && (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Wallet Address</label>
            <p className="text-sm text-gray-400 bg-gray-700 p-2 rounded-md">{user.walletAddress}</p>
        </div>
      )}
      <Button type="submit">Save Changes</Button>
    </form>
  );
};

export const PaymentSettingsPlaceholder: React.FC = () => {
  const { addNotification } = useAppContext();
  const handleManageSubscription = async () => {
    addNotification("Fetching subscription details (Simulated)...", "info");
    const result = await MockPaymentService.manageSubscription();
    if (result.success && result.managementUrl) {
      // In a real app, you might redirect: window.location.href = result.managementUrl;
      addNotification(`Manage Subscription URL (simulated): ${result.managementUrl}`, "success");
    } else {
      addNotification(result.error || "Failed to fetch subscription details.", "error");
    }
  };
  return (
    <Card className="mt-8">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Payment & Subscription</h3>
      <p className="text-sm text-gray-400 mb-4">Manage your subscription and payment methods via LemonSqueezy (Simulated).</p>
      <Button onClick={handleManageSubscription} variant="secondary">
        Manage Subscription
      </Button>
    </Card>
  );
};

// --- Notification Component ---
export const NotificationArea: React.FC = () => {
  const { notifications, removeNotification } = useAppContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {notifications.map(notif => {
        const baseClasses = "p-4 rounded-md shadow-lg flex items-center justify-between text-sm";
        const typeClasses = {
          success: "bg-green-600 text-white",
          error: "bg-red-600 text-white",
          info: "bg-sky-600 text-white",
        };
        return (
          <div key={notif.id} className={`${baseClasses} ${typeClasses[notif.type]}`}>
            <span>{notif.message}</span>
            <button onClick={() => removeNotification(notif.id)} className="ml-4 p-1 rounded-full hover:bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Word component for the Transcription Editor
export const TranscriptWord: React.FC<{
  word: Word;
  isActive: boolean;
  isAnnotated: boolean;
  isSelected: boolean;
  onClick: () => void;
  speakerColor: string;
}> = ({ word, isActive, isAnnotated, isSelected, onClick, speakerColor }) => {
  return (
    <span
      onClick={onClick}
      className={`cursor-pointer hover:bg-gray-600 p-0.5 rounded-sm transition-colors duration-150
        ${isActive ? 'bg-indigo-600 text-white font-semibold' : speakerColor}
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isAnnotated ? 'underline decoration-yellow-400 decoration-dotted' : ''}
      `}
    >
      {word.text}
    </span>
  );
};