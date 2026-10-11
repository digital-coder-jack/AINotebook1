import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Network,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  X,
  Zap,
} from 'lucide-react';

type Page = 'home' | 'chat' | 'notes' | 'summaries' | 'roadmaps' | 'mindmaps' | 'settings';
type Note = { id: number; title: string; body: string; updated: string };
type ChatMessage = { id: number; role: 'user' | 'assistant' | 'error'; content: string };

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'chat', label: 'AI conversations', icon: MessageSquare },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'summaries', label: 'Summaries', icon: FileText },
  { id: 'roadmaps', label: 'Roadmaps', icon: ListChecks },
  { id: 'mindmaps', label: 'Mind maps', icon: Network },
];

const initialNotes: Note[] = [
  { id: 1, title: 'Welcome to AI Notebook', body: 'Capture ideas, shape thinking, and turn scattered research into something you can act on.', updated: 'Just now' },
  { id: 2, title: 'Product launch questions', body: 'Which moment should feel most effortless for a first-time user?', updated: 'Yesterday' },
];

const initialMessages: ChatMessage[] = [
  { id: 1, role: 'assistant', content: 'Welcome to AI Notebook. I can help you shape ideas, organize research, and make a clear next step from a blank page.' },
];

function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = window.localStorage.getItem('ai-notebook-notes');
      return saved ? JSON.parse(saved) as Note[] : initialNotes;
    } catch { return initialNotes; }
  });
  const [selectedNoteId, setSelectedNoteId] = useState(1);
  const [search, setSearch] = useState('');
  const [composer, setComposer] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serviceNotice, setServiceNotice] = useState(false);
  const [accent, setAccent] = useState('rose');
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('ai-notebook-notes', JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0];
  const filteredNotes = useMemo(() => notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(search.toLowerCase())), [notes, search]);
  const pageTitle = navItems.find((item) => item.id === activePage)?.label ?? 'Overview';

  function goTo(page: Page) {
    setActivePage(page);
    setProfileOpen(false);
    setServiceNotice(false);
  }

  function createNote() {
    const note: Note = { id: Date.now(), title: 'Untitled note', body: '', updated: 'Just now' };
    setNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
    setActivePage('notes');
  }

  function updateSelectedNote(field: 'title' | 'body', value: string) {
    if (!selectedNote) return;
    setNotes((current) => current.map((note) => note.id === selectedNote.id ? { ...note, [field]: value, updated: 'Just now' } : note));
  }

  function submitChat(event?: FormEvent) {
    event?.preventDefault();
    const content = composer.trim();
    if (!content || isGenerating) return;
    setMessages((current) => [...current, { id: Date.now(), role: 'user', content }]);
    setComposer('');
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      setServiceNotice(true);
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'error', content: 'AI generation is not connected in this workspace yet. Your message is kept here, but no answer was produced.' }]);
    }, 650);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitChat();
    }
  }

  return (
    <div className={`app-shell accent-${accent} ${compactMode ? 'compact-mode' : ''}`}>
      <div className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="brand-row">
          <button className="brand-mark" onClick={() => goTo('home')} aria-label="Go to overview"><img src="/assets/images/designarena_image_lcyn904e.jpg" alt="AI Notebook" /></button>
          {sidebarOpen && <button className="brand-name" onClick={() => goTo('home')}>AI <span>Notebook</span></button>}
          <button className="icon-button sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">A</div>
          {sidebarOpen && <><div className="workspace-copy"><strong>Personal space</strong><span>Free workspace</span></div><ChevronDown size={15} /></>}
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activePage === id ? 'active' : ''}`} onClick={() => goTo(id)} title={!sidebarOpen ? label : undefined}><Icon size={18} /><span>{label}</span>{id === 'chat' && sidebarOpen && <span className="nav-dot" />}</button>)}
          <p className="nav-label secondary-label">Manage</p>
          <button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => goTo('settings')}><Settings size={18} /><span>Settings</span></button>
        </nav>

        {sidebarOpen && <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Zap size={15} /></div><strong>Unlock deeper thinking</strong><p>Upgrade to Pro for larger context and advanced models.</p><button onClick={() => setServiceNotice(true)}>Explore Pro <ArrowUpRight size={14} /></button></div><div className="sidebar-footer"><button className="help-link"><CircleHelp size={16} /> Help center</button><span className="version-label">v0.1 preview</span></div></div>}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="breadcrumbs"><span>Personal space</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div></div>
          <div className="topbar-actions"><button className="search-trigger" onClick={() => document.getElementById('global-search')?.focus()}><Search size={16} /><span>Search</span><kbd>⌘ K</kbd></button><button className="icon-button"><Sun size={17} /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="profile-avatar">JD</span><span className="profile-name">Jordan Davis</span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-menu"><strong>Jordan Davis</strong><span>jordan@ainotebook.app</span><hr /><button onClick={() => goTo('settings')}>Account settings</button><button onClick={() => setServiceNotice(true)}>Sign out</button></div>}</div></div>
        </header>

        {serviceNotice && <div className="service-banner"><div><span className="status-pulse" /> <strong>Workspace preview mode</strong><span> Your data is saved on this device. AI providers are not connected in this project.</span></div><button onClick={() => setServiceNotice(false)} aria-label="Dismiss"><X size={16} /></button></div>}

        <div className="page-wrap">
          {activePage === 'home' && <Dashboard onNavigate={goTo} onCreateNote={createNote} />}
          {activePage === 'chat' && <Chat messages={messages} composer={composer} setComposer={setComposer} submitChat={submitChat} handleComposerKeyDown={handleComposerKeyDown} isGenerating={isGenerating} />}
          {activePage === 'notes' && <Notes notes={filteredNotes} selectedNote={selectedNote} selectedNoteId={selectedNoteId} setSelectedNoteId={setSelectedNoteId} search={search} setSearch={setSearch} createNote={createNote} updateSelectedNote={updateSelectedNote} />}
          {activePage === 'summaries' && <SummaryView onNavigate={goTo} />}
          {activePage === 'roadmaps' && <RoadmapView />}
          {activePage === 'mindmaps' && <MindMapView />}
          {activePage === 'settings' && <SettingsView accent={accent} setAccent={setAccent} compactMode={compactMode} setCompactMode={setCompactMode} />}
        </div>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ onNavigate, onCreateNote }: { onNavigate: (page: Page) => void; onCreateNote: () => void }) {
  return <>
    <PageIntro eyebrow="Saturday, October 11" title="Good morning, Jordan" description="A clear mind starts with a place to put everything." action={<button className="secondary-button"><MoreHorizontal size={17} /> More</button>} />
    <section className="hero-panel"><div className="hero-glow" /><div className="hero-content"><div className="hero-kicker"><Sparkles size={15} /> Your thinking companion</div><h2>What are you working through today?</h2><p>Start with a question, an idea, or a messy thought. AI Notebook helps you find the shape inside it.</p><button className="primary-button" onClick={() => onNavigate('chat')}>Start a conversation <ArrowUpRight size={16} /></button></div><div className="hero-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><BrainCircuit size={27} /></div><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /></div></section>
    <div className="section-heading"><div><span className="eyebrow">Quick actions</span><h2>Make something useful</h2></div><button className="text-button" onClick={() => onNavigate('settings')}>Customize <ArrowUpRight size={14} /></button></div>
    <div className="action-grid"><button className="action-card action-chat" onClick={() => onNavigate('chat')}><span className="card-icon"><MessageSquare size={19} /></span><strong>New conversation</strong><span>Think out loud with AI</span><ArrowUpRight size={16} /></button><button className="action-card" onClick={onCreateNote}><span className="card-icon note-icon"><StickyNote size={19} /></span><strong>Capture a note</strong><span>Save a thought before it wanders</span><ArrowUpRight size={16} /></button><button className="action-card" onClick={() => onNavigate('summaries')}><span className="card-icon summary-icon"><FileText size={19} /></span><strong>Summarize content</strong><span>Turn long into clear</span><ArrowUpRight size={16} /></button></div>
    <div className="content-columns"><section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">Keep going</span><h2>Recent work</h2></div><button className="icon-button"><MoreHorizontal size={17} /></button></div><div className="recent-item"><div className="recent-symbol chat-symbol"><MessageSquare size={16} /></div><div><strong>Welcome to your thinking space</strong><span>Conversation · Just now</span></div><ChevronRight size={16} /></div><div className="recent-item"><div className="recent-symbol note-symbol"><StickyNote size={16} /></div><div><strong>Welcome to AI Notebook</strong><span>Note · Just now</span></div><ChevronRight size={16} /></div><div className="empty-row"><span>More of your work will appear here as you create.</span></div></section><section className="panel focus-panel"><div className="focus-badge"><Lightbulb size={17} /></div><span className="eyebrow">A small prompt</span><h2>What deserves your attention?</h2><p>Write down the one thing you want to make clearer today.</p><button className="quiet-button" onClick={onCreateNote}>Open a blank page <Plus size={15} /></button></section></div>
  </>;
}

function Chat({ messages, composer, setComposer, submitChat, handleComposerKeyDown, isGenerating }: { messages: ChatMessage[]; composer: string; setComposer: (value: string) => void; submitChat: (event?: FormEvent) => void; handleComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void; isGenerating: boolean }) {
  return <div className="chat-page"><PageIntro eyebrow="AI workspace" title="AI conversations" description="Explore an idea, solve a problem, or make sense of the noise." action={<button className="secondary-button"><Plus size={16} /> New chat</button>} /><div className="chat-layout"><aside className="chat-history panel"><div className="panel-heading"><strong>Conversations</strong><button className="icon-button"><Search size={16} /></button></div><button className="history-item active"><span className="history-dot" /><span>Welcome to your thinking space</span><MoreHorizontal size={15} /></button><div className="history-empty">Your future conversations will live here.</div></aside><section className="conversation panel"><div className="conversation-header"><div className="model-chip"><span className="model-mark"><Bot size={14} /></span><span><strong>AI Notebook</strong><small>Gemini workspace</small></span></div><button className="icon-button"><MoreHorizontal size={17} /></button></div><div className="messages">{messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}><div className="message-avatar">{message.role === 'user' ? 'JD' : message.role === 'error' ? '!' : <img src="/assets/images/designarena_image_lcyn904e.jpg" alt="" />}</div><div className="message-bubble"><span className="message-author">{message.role === 'user' ? 'You' : message.role === 'error' ? 'Connection status' : 'AI Notebook'}</span><p>{message.content}</p>{message.role === 'error' && <button className="retry-button" onClick={() => undefined}>Retry connection <ArrowUpRight size={14} /></button>}</div></div>)}{isGenerating && <div className="message-row assistant"><div className="message-avatar"><img src="/assets/images/designarena_image_lcyn904e.jpg" alt="" /></div><div className="message-bubble"><span className="message-author">AI Notebook</span><div className="typing"><i /><i /><i /></div></div></div>}</div><form className="composer" onSubmit={submitChat}><textarea value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder="Ask anything or describe what you're working through..." rows={2} /><div className="composer-tools"><span>Enter to send · Shift + Enter for a new line</span><button className="send-button" type="submit" disabled={!composer.trim() || isGenerating} aria-label="Send message"><Send size={17} /></button></div></form></section></div></div>;
}

function Notes({ notes, selectedNote, selectedNoteId, setSelectedNoteId, search, setSearch, createNote, updateSelectedNote }: { notes: Note[]; selectedNote?: Note; selectedNoteId: number; setSelectedNoteId: (id: number) => void; search: string; setSearch: (value: string) => void; createNote: () => void; updateSelectedNote: (field: 'title' | 'body', value: string) => void }) {
  return <div className="notes-page"><PageIntro eyebrow="Your library" title="Notes" description="A quiet place for ideas in progress." action={<button className="primary-button" onClick={createNote}><Plus size={16} /> New note</button>} /><div className="notes-layout"><aside className="notes-list panel"><div className="notes-search"><Search size={16} /><input id="global-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" /></div><div className="notes-list-heading"><span>{notes.length} notes</span><button className="icon-button"><MoreHorizontal size={16} /></button></div>{notes.map((note) => <button key={note.id} className={`note-list-item ${selectedNoteId === note.id ? 'active' : ''}`} onClick={() => setSelectedNoteId(note.id)}><span className="note-list-icon"><StickyNote size={15} /></span><span><strong>{note.title || 'Untitled note'}</strong><small>{note.body || 'No text yet'} · {note.updated}</small></span></button>)}{!notes.length && <div className="notes-empty">No notes match that search.</div>}</aside><section className="note-editor panel">{selectedNote ? <><div className="editor-toolbar"><span className="save-status"><Check size={14} /> Saved on this device</span><div><button className="icon-button"><FolderOpen size={16} /></button><button className="icon-button"><MoreHorizontal size={16} /></button></div></div><input className="note-title-input" value={selectedNote.title} onChange={(event) => updateSelectedNote('title', event.target.value)} placeholder="Untitled note" /><textarea className="note-body-input" value={selectedNote.body} onChange={(event) => updateSelectedNote('body', event.target.value)} placeholder="Begin with a thought..." /><div className="editor-footer"><span>Markdown supported</span><span>{selectedNote.body.length} characters</span></div></> : <div className="blank-state"><StickyNote size={27} /><h2>Select a note to begin</h2><p>Choose a note from your library or create a new one.</p></div>}</section></div></div>;
}

function SummaryView({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [input, setInput] = useState('');
  return <div><PageIntro eyebrow="Make it clear" title="Topic summaries" description="Turn a long article, meeting transcript, or idea dump into something you can use." action={<button className="secondary-button" onClick={() => onNavigate('chat')}><MessageSquare size={16} /> Ask AI instead</button>} /><div className="summary-layout"><section className="panel summary-input"><div className="panel-heading"><div><span className="eyebrow">Source material</span><h2>What should we clarify?</h2></div><span className="input-count">{input.length} / 10,000</span></div><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste an article, notes, transcript, or any text you want to understand better..." /><div className="summary-controls"><label>Format<select defaultValue="Briefing"><option>Briefing</option><option>Key takeaways</option><option>Study guide</option></select></label><button className="primary-button" onClick={() => undefined} disabled={!input.trim()}><Sparkles size={16} /> Generate summary</button></div></section><section className="panel summary-output"><div className="output-placeholder"><div className="placeholder-icon"><FileText size={23} /></div><span className="eyebrow">Your summary</span><h2>Clarity is one paste away</h2><p>Your generated summary will appear here with key ideas, context, and next steps.</p></div></section></div></div>;
}

function RoadmapView() {
  return <div><PageIntro eyebrow="Move forward" title="Roadmaps" description="Give a meaningful idea a sequence, a shape, and a next step." action={<button className="primary-button"><Plus size={16} /> New roadmap</button>} /><section className="panel roadmap-empty"><div className="roadmap-illustration"><span className="roadmap-line" /><span className="roadmap-node node-a"><Lightbulb size={16} /></span><span className="roadmap-node node-b"><Check size={16} /></span><span className="roadmap-node node-c"><ArrowUpRight size={16} /></span></div><span className="eyebrow">A clearer path</span><h2>Your next meaningful project starts here</h2><p>Create a roadmap to turn a goal into focused milestones. You can track what is done and what deserves attention next.</p><button className="quiet-button">Create your first roadmap <Plus size={15} /></button></section></div>;
}

function MindMapView() {
  return <div><PageIntro eyebrow="See the whole picture" title="Mind maps" description="Connect ideas visually and find the relationships hiding between them." action={<button className="primary-button"><Plus size={16} /> New mind map</button>} /><section className="panel mindmap-canvas"><div className="canvas-toolbar"><span className="model-chip"><span className="model-mark"><Network size={14} /></span><span><strong>Untitled map</strong><small>Not saved yet</small></span></span><div className="canvas-actions"><button className="icon-button"><ChevronLeft size={16} /></button><span>100%</span><button className="icon-button"><ChevronRight size={16} /></button><button className="secondary-button"><Check size={15} /> Save map</button></div></div><div className="map-stage"><div className="map-line line-left" /><div className="map-line line-right" /><div className="map-node side-node left-node"><span className="node-dot" />Ideas</div><div className="map-node root-node"><BrainCircuit size={17} /> New idea</div><div className="map-node side-node right-node"><span className="node-dot" />Next steps</div><div className="map-hint">Double-click the canvas to add a node</div></div></section></div>;
}

function SettingsView({ accent, setAccent, compactMode, setCompactMode }: { accent: string; setAccent: (value: string) => void; compactMode: boolean; setCompactMode: (value: boolean) => void }) {
  return <div><PageIntro eyebrow="Make it yours" title="Settings" description="Shape the workspace around how you think best." /><div className="settings-layout"><aside className="settings-nav panel"><button className="active"><Sun size={16} /> Appearance</button><button><MessageSquare size={16} /> Chat preferences</button><button><Settings size={16} /> Account & security</button><button><FolderOpen size={16} /> Data & privacy</button></aside><section className="settings-content"><div className="settings-section"><span className="eyebrow">Interface</span><h2>Appearance</h2><p className="settings-description">Small choices that make the space feel like yours.</p><div className="setting-row"><div><strong>Accent color</strong><span>Choose the energy of your workspace.</span></div><div className="swatches">{['rose', 'blue', 'amber', 'green'].map((color) => <button key={color} className={`swatch ${color} ${accent === color ? 'selected' : ''}`} onClick={() => setAccent(color)} aria-label={`${color} accent`}><Check size={13} /></button>)}</div></div><div className="setting-row"><div><strong>Compact layout</strong><span>Fit more content into your workspace.</span></div><button className={`toggle ${compactMode ? 'on' : ''}`} onClick={() => setCompactMode(!compactMode)} aria-label="Toggle compact layout"><span /></button></div></div><div className="settings-section"><span className="eyebrow">Account</span><h2>Jordan Davis</h2><p className="settings-description">Your account controls will be available when authentication is connected.</p><div className="account-card"><span className="profile-avatar large">JD</span><div><strong>jordan@ainotebook.app</strong><span>Personal workspace · Preview</span></div><button className="secondary-button">Manage <ArrowUpRight size={14} /></button></div></div><div className="settings-section danger-section"><span className="eyebrow">Data</span><h2>Local preview storage</h2><p className="settings-description">Notes and appearance preferences are stored only in this browser until the original backend is restored.</p><button className="danger-button">Clear local workspace</button></div></section></div></div>;
}

export default App;
