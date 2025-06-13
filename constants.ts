
import { TranscriptionSession, Word, Annotation, User, KnowledgeResult } from './types';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  TRANSCRIPTION: '/transcribe',
  SESSIONS: '/sessions',
  PROFILE: '/profile',
  HOME: '/',
};

export const MOCK_USER: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Demo User',
};

export const MOCK_TRANSCRIPT_WORDS: Word[] = [
  { id: 'w1', text: "Welcome", start: 0, end: 0.8, speaker: 1 },
  { id: 'w2', text: "to", start: 0.9, end: 1.1, speaker: 1 },
  { id: 'w3', text: "this", start: 1.2, end: 1.5, speaker: 1 },
  { id: 'w4', text: "demonstration", start: 1.6, end: 2.5, speaker: 1, keyword: "demonstration" },
  { id: 'w5', text: "of", start: 2.6, end: 2.8, speaker: 1 },
  { id: 'w6', text: "real-time", start: 2.9, end: 3.5, speaker: 1, keyword: "real-time computing" },
  { id: 'w7', text: "transcription.", start: 3.6, end: 4.5, speaker: 1 },
  { id: 'w8', text: "I'm", start: 5.0, end: 5.3, speaker: 2 },
  { id: 'w9', text: "speaker", start: 5.4, end: 5.9, speaker: 2 },
  { id: 'w10', text: "two.", start: 6.0, end: 6.4, speaker: 2 },
  { id: 'w11', text: "We", start: 7.0, end: 7.2, speaker: 1 },
  { id: 'w12', text: "will", start: 7.3, end: 7.6, speaker: 1 },
  { id: 'w13', text: "discuss", start: 7.7, end: 8.3, speaker: 1, keyword: "artificial intelligence" },
  { id: 'w14', text: "Gemini", start: 8.4, end: 9.0, speaker: 1, keyword: "Google Gemini API" },
  { id: 'w15', text: "and", start: 9.1, end: 9.4, speaker: 1 },
  { id: 'w16', text: "its", start: 9.5, end: 9.8, speaker: 1 },
  { id: 'w17', text: "capabilities.", start: 9.9, end: 10.8, speaker: 1 },
  { id: 'w18', text: "Any", start: 11.5, end: 11.8, speaker: 2 },
  { id: 'w19', text: "questions", start: 11.9, end: 12.5, speaker: 2, keyword: "FAQ" },
  { id: 'w20', text: "so", start: 12.6, end: 12.8, speaker: 2 },
  { id: 'w21', text: "far?", start: 12.9, end: 13.3, speaker: 2 },
];

export const MOCK_ANNOTATIONS: Annotation[] = [
  { id: 'anno1', wordId: 'w4', timestamp: 2.0, text: "Clarify meaning of 'demonstration'", createdAt: new Date() },
  { id: 'anno2', timestamp: 9.0, text: "Research Gemini API limits", createdAt: new Date() },
];

export const MOCK_SESSIONS: TranscriptionSession[] = [
  {
    id: 'session1',
    title: 'Project Kickoff Meeting',
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    duration: 3600, // 1 hour
    transcriptWords: MOCK_TRANSCRIPT_WORDS.slice(0,10),
    annotations: [MOCK_ANNOTATIONS[0]],
    summary: "Initial discussion about project goals and timelines."
  },
  {
    id: 'session2',
    title: 'AI Ethics Brainstorm',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    duration: 1800, // 30 minutes
    transcriptWords: MOCK_TRANSCRIPT_WORDS.slice(10),
    annotations: [MOCK_ANNOTATIONS[1]],
    summary: "Brainstorming session on ethical considerations for AI development."
  },
];

export const MOCK_KNOWLEDGE_RESULTS: KnowledgeResult[] = [
    // Will be populated dynamically by Gemini
];

// SVG Icons
export const MIC_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c.618 0 1.198-.056 1.757-.162M12 15V4.5m0 10.5l-3.75-5.625M12 15l3.75-5.625m0 0V4.5m0 0H8.25m7.5 0h3.75M12 4.5V3M8.25 4.5H4.5m3.75 0V3m0 0H3.75M3 3v1.5m0 0V3m0 0h1.5m0 0h1.5m0 0V3m0 0h1.5m0 0V3" />
</svg>`;

export const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L8.029 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
</svg>`;

export const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>`;

export const STOP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
</svg>`;

export const ANNOTATE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>`;

export const KNOWLEDGE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a.75.75 0 00.75-.75V6.038a.75.75 0 00-.75-.75S11.25 5.25 11.25 9.75s.75 4.5.75 4.5zm0 0v2.625m0-2.625a.75.75 0 01.75.75V15M12 15v3.75m0-3.75a.75.75 0 00-.75-.75H9.375m3.375 0S13.5 14.25 13.5 9.75s-.75-4.5-.75-4.5M12 15H9.375m0 0a.75.75 0 000 1.5h3.375a.75.75 0 000-1.5H9.375zM12 5.25V3m0 2.25a.75.75 0 01.75.75S13.5 6 13.5 9.75s-.75 4.5-.75 4.5M12 5.25S11.25 6 11.25 9.75s.75 4.5.75 4.5m0-9a.75.75 0 00-.75-.75h0M12 3c.828 0 1.5.672 1.5 1.5S12.828 6 12 6s-1.5-.672-1.5-1.5S11.172 3 12 3z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 12c0 .865-.092 1.706-.259 2.508M18.653 17.192c-.408.22-.83.424-1.268.608M17.192 5.347a10.415 10.415 0 012.37 2.37m-2.37-2.37a10.415 10.415 0 00-2.37 2.37M3.007 14.508A10.438 10.438 0 012.25 12c0-.865.092-1.706.259-2.508m2.498-2.498a10.415 10.415 0 012.37-2.37m-2.37 2.37a10.415 10.415 0 002.37-2.37" />
</svg>`;

export const LOGOUT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
</svg>`;

export const USER_CIRCLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>`;

export const GEAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
 <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.057-1.228a48.249 48.249 0 0112.701 0c.498.22.968.686 1.058 1.228.09.54-.044 1.134-.386 1.617L17.25 12l4.763 6.443c.343.483.477 1.077.386 1.617-.09.542-.56 1.007-1.057 1.228a48.25 48.25 0 01-12.701 0c-.498-.22-.968-.686-1.058-1.228-.09-.54.044-1.134.386-1.617L6.75 12 2.016 5.557C1.672 5.074 1.538 4.48 1.628 3.94M6.75 12h10.5" />
</svg>`;
