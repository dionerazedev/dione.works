import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  ChatCircleDots,
  PaperPlaneTilt,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useDialogAccessibility } from './ui/useDialogAccessibility';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

const BOT_RESPONSES = {
  greeting:
    "Hi, I'm Dione's portfolio assistant. Ask me about his featured products, automation work, services, or technical approach.",
  about:
    'Dione Raze Oro is a Full-Stack & AI Automation Engineer based in Davao City, Philippines. He builds web applications, API integrations, and workflow automation systems.',
  automation:
    'Dione builds workflow automations with n8n, Make, Zapier, AI models, webhooks, spreadsheets, and third-party APIs. The portfolio shows how these systems route requests, structure data, and reduce repetitive processing.',
  ai:
    'The portfolio includes AI-assisted product features and automation prototypes for inquiry routing, booking requests, document processing, and customer intake. Each project is labeled by its actual status and documented capabilities.',
  crm:
    'Dione has explored lead qualification, intake, routing, and data synchronization workflows. These systems are designed to organize incoming information and make follow-up easier to manage.',
  tools:
    'The core toolkit includes React, TypeScript, Supabase, PostgreSQL, n8n, Make, Zapier, Claude, Google Sheets, REST APIs, and webhooks.',
  dashboard:
    'Dione builds responsive product interfaces and internal tools for workflows such as booking, intake, reporting, and content operations.',
  projects:
    'Selected work includes Migo, Laag Bukidnon, Narra Estates, and Peak Athletics. Current work includes automation prototypes such as the WhatsApp AI Booking & Inquiry Agent and the Voice Appointment Manager.',
  peak:
    'Peak Athletics is a live Shopify concept storefront for a fictional performance-apparel brand. It demonstrates Liquid theme sections, product and collection architecture, variants, predictive search, cart behavior, checkout integration, and responsive storefront testing.',
  whatsapp:
    'The WhatsApp AI Booking & Inquiry Agent is presented as a technical prototype. Its workflow covers booking requests, general inquiries, cancellations, complaints, escalations, and conversation logging with n8n, WhatsApp, Claude, and Google Sheets.',
  services:
    'Dione is available for full-stack development, AI automation, responsive product interfaces, and API integration projects.',
  contact:
    'You can schedule a 30-minute call, email dioneraze.dev@gmail.com, open the resume, or connect through GitHub and LinkedIn.',
  hiring:
    'Dione is currently available for full-stack development, AI automation, and API integration projects. The contact section includes direct scheduling, email, and resume actions.',
  pricing:
    'Project scope and pricing depend on the product, integrations, and workflow complexity. A short call is the best way to define requirements and the right build plan.',
  experience:
    'The portfolio demonstrates Dione\'s experience through live products, source code, project visuals, technical prototypes, and documented implementation choices.',
  approach:
    'Dione works across product design, frontend development, databases, integrations, and automation, with a focus on practical systems that solve a clear problem.',
  travel:
    'Migo combines trip planning, social travel features, and AI assistance. Laag Bukidnon organizes useful local destination and tourism information into a responsive platform.',
  default:
    'Tell me what you would like to explore: featured work, AI automation, full-stack development, services, or ways to contact Dione.',
} as const;

const getResponse = (userInput: string): string => {
  const lower = userInput.toLowerCase().trim();

  if (['hi', 'hello', 'hey', 'hey there', 'yo'].includes(lower)) {
    return "Hi. Would you like to explore Dione's featured products, automation work, services, or technical stack?";
  }
  if (['how are you', 'how are you doing', 'whats up', "what's up"].includes(lower)) {
    return 'Ready to help. What would you like to know about the portfolio?';
  }
  if (['thanks', 'thank you', 'thx'].includes(lower)) {
    return 'You are welcome. I can also point you to a project, the resume, or the contact section.';
  }
  if (['cool', 'nice', 'awesome', 'amazing', 'ok', 'okay', 'got it', 'understood'].includes(lower)) {
    return 'Glad that helped. What else would you like to explore?';
  }

  if (lower.includes('who are you') || lower.includes('dione') || lower.includes('about you')) {
    return BOT_RESPONSES.about;
  }
  if (lower.includes('whatsapp') || lower.includes('concierge')) {
    return BOT_RESPONSES.whatsapp;
  }
  if (lower.includes('peak') || lower.includes('shopify') || lower.includes('ecommerce') || lower.includes('e-commerce')) {
    return BOT_RESPONSES.peak;
  }
  if (lower.includes('dashboard') || lower.includes('analytics')) {
    return BOT_RESPONSES.dashboard;
  }
  if (lower.includes('travel') || lower.includes('migo') || lower.includes('laag') || lower.includes('bukidnon')) {
    return BOT_RESPONSES.travel;
  }
  if (lower.includes('experience') || lower.includes('background')) {
    return BOT_RESPONSES.experience;
  }
  if (lower.includes('approach') || lower.includes('process') || lower.includes('style')) {
    return BOT_RESPONSES.approach;
  }
  if (lower.includes('tool') || lower.includes('tech') || lower.includes('framework') || lower.includes('n8n') || lower.includes('make') || lower.includes('zapier')) {
    return BOT_RESPONSES.tools;
  }
  if (lower.includes('project') || lower.includes('example') || lower.includes('booking')) {
    return BOT_RESPONSES.projects;
  }
  if (lower.includes('automate') || lower.includes('automation') || lower.includes('workflow')) {
    return BOT_RESPONSES.automation;
  }
  if (lower.includes('ai') || lower.includes('artificial intelligence') || lower.includes('chatbot') || lower.includes('agent')) {
    return BOT_RESPONSES.ai;
  }
  if (lower.includes('crm') || lower.includes('lead') || lower.includes('sales') || lower.includes('customer') || lower.includes('pipeline')) {
    return BOT_RESPONSES.crm;
  }
  if (lower.includes('service') || lower.includes('offer') || lower.includes('expertise') || lower.includes('capability')) {
    return BOT_RESPONSES.services;
  }
  if (lower.includes('contact') || lower.includes('email') || lower.includes('schedule') || lower.includes('call') || lower.includes('resume')) {
    return BOT_RESPONSES.contact;
  }
  if (lower.includes('available') || lower.includes('hire') || lower.includes('freelance')) {
    return BOT_RESPONSES.hiring;
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('budget')) {
    return BOT_RESPONSES.pricing;
  }

  return BOT_RESPONSES.default;
};

export const ChatAssistant = ({ isOverlayOpen = false }: { isOverlayOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', type: 'bot', text: BOT_RESPONSES.greeting },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingResponseRef = useRef<number | null>(null);

  useEffect(() => {
    const handleExternalClose = () => {
      setIsOpen(false);
      setIsMinimized(false);
    };
    const handleExternalOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('portfolio:close-assistant', handleExternalClose);
    window.addEventListener('portfolio:open-assistant', handleExternalOpen);
    return () => {
      window.removeEventListener('portfolio:close-assistant', handleExternalClose);
      window.removeEventListener('portfolio:open-assistant', handleExternalOpen);
    };
  }, []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [isOpen, isMinimized, messages, isLoading]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [isOpen, isMinimized]);

  useEffect(
    () => () => {
      if (pendingResponseRef.current !== null) {
        window.clearTimeout(pendingResponseRef.current);
      }
    },
    [],
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    launcherRef.current?.focus();
  }, []);
  useDialogAccessibility({ isOpen: isOpen && !isOverlayOpen, onClose: closeChat, containerRef: panelRef, initialFocusRef: inputRef });

  const handleSendMessage = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    const userMessage: Message = {
      id: `user-${crypto.randomUUID()}`,
      type: 'user',
      text: trimmedText,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);
    setAssistantError('');

    pendingResponseRef.current = window.setTimeout(() => {
      try {
        setMessages((current) => [...current, { id: `assistant-${crypto.randomUUID()}`, type: 'bot', text: getResponse(trimmedText) }]);
      } catch {
        setAssistantError('The local portfolio index could not prepare an answer. Try another question.');
      }
      setIsLoading(false);
      pendingResponseRef.current = null;
    }, 450);
  };

  return createPortal(
    <>
      <motion.button
        ref={launcherRef}
        type="button"
        disabled={isOverlayOpen}
        onClick={() => {
          if (isOpen) closeChat();
          else setIsOpen(true);
        }}
        className={`chat-launcher ${isOverlayOpen ? 'is-hidden' : ''}`}
        aria-label={isOpen ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        aria-controls="portfolio-assistant"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-hidden={isOverlayOpen}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        {isOpen ? (
          <X size={24} weight="regular" aria-hidden="true" />
        ) : (
          <ChatCircleDots size={25} weight="regular" aria-hidden="true" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !isOverlayOpen && (
          <motion.section
            ref={panelRef}
            id="portfolio-assistant"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`chat-panel ${isMinimized ? 'is-minimized' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            aria-describedby="chat-description"
          >
            <header className="chat-header">
              <div>
                <h2 id="chat-title">
                  Portfolio Assistant
                </h2>
                <p id="chat-description">
                  Project and hiring guide
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMinimized((current) => !current);
                  if (isMinimized) window.requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="icon-button"
                aria-label={isMinimized ? 'Expand portfolio assistant' : 'Minimize portfolio assistant'}
                aria-expanded={!isMinimized}
              >
                {isMinimized ? (
                  <ArrowsOutSimple size={18} weight="regular" aria-hidden="true" />
                ) : (
                  <ArrowsInSimple size={18} weight="regular" aria-hidden="true" />
                )}
              </button>
              <button type="button" onClick={closeChat} className="icon-button" aria-label="Close portfolio assistant"><X size={17} aria-hidden="true" /></button>
            </header>

            {!isMinimized && (
              <>
                <div
                  className="chat-log"
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions text"
                  aria-busy={isLoading}
                >
                  {messages.length === 1 && (
                    <div className="chat-suggestions" aria-label="Suggested questions">
                      {['Which projects are live?', 'What can Dione automate?', 'How can I contact Dione?'].map((question) => <button key={question} type="button" onClick={() => handleSendMessage(question)}>{question}</button>)}
                    </div>
                  )}
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`chat-message-row ${message.type === 'user' ? 'is-user' : ''}`}
                    >
                      <div
                        className={`chat-message ${message.type === 'user' ? 'is-user' : ''}`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="chat-loading" role="status">
                      <span className="sr-only">Preparing a response</span>
                      <div aria-hidden="true">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="loading-dot"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {assistantError && <p className="chat-error" role="alert">{assistantError}</p>}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSendMessage(input);
                  }}
                  className="chat-form"
                >
                  {!isOnline && <p className="chat-offline">Offline · local portfolio answers remain available.</p>}
                  <label htmlFor="portfolio-chat-input">
                    Ask about Dione's work
                  </label>
                  <div className="chat-input-row">
                    <input
                      ref={inputRef}
                      id="portfolio-chat-input"
                      type="text"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Projects, services, or contact"
                      className="chat-input"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="chat-send"
                      aria-label="Send message"
                    >
                      <PaperPlaneTilt size={17} weight="regular" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
};
