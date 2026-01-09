import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const CopilotContext = createContext(null);
export const useCopilot = () => useContext(CopilotContext);


const isValidImageUrl = (url) => {
  return typeof url === 'string' && (
    url.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)(?=\?|$)/i) ||
    url.match(/^https?:\/\/(www\.)?picsum\.photos\/.+/i)
  );
};

const isVideoUrl = (url) => {
  return typeof url === 'string' && (
    url.match(/\.(mp4|webm|ogg|mov)(?=\?|$)/i) ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')
  );
};

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const CopilotProvider = ({ children, initialConfig = { width: 400, height: 83, position: 'right' } }) => {
  const { formatMessage } = useIntl();
  const t = (msg, values) => {
    if (!msg || !msg.id) {
      console.warn('Missing message id in CopilotContext:', msg);
      return ''; // or return msg?.defaultMessage || ''
    }
    return formatMessage(msg, values);
  };


  // const STUDIO_BASE = getConfig().STUDIO_BASE_URL?.replace(/\/+$/, '') ?? '';
  const [enabledCopilot, setEnabledCopilot] = useState(false);
  const [showCopilotIcon, setShowCopilotIcon] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fieldData, setFieldData] = useState({ name: '', value: '' });
  const [isDocked, setIsDocked] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ w: initialConfig.width, h: initialConfig.height });
  const [pos, setPos] = useState({ x: window.innerWidth - initialConfig.width, y: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedState, setSavedState] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [feedbackBannerHeight, setFeedbackBannerHeight] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isFloating, setIsFloating] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [introVideo, setIntroVideo] = useState('');
  const [aiResponse, setAiResponse] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [buttons, setButtons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [userAnswers, setUserAnswers] = useState({});
  const [pinnedSuggestions, setPinnedSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState({
    title: false, shortDescription: false, description: false, cardImage: false, bannerImage: false, introVideo: false,
  });
  const [lastFailedAction, setLastFailedAction] = useState(null);

  const startData = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });

  const addErrorToChat = (retryAction) => {
    setChatHistory(prev => [...prev, {
      type: 'error',
      sender: 'ai',
      content: t(messages.error),
      retryAction
    }]);
  };

  const retryLastAction = () => {
    if (lastFailedAction) {
      lastFailedAction();
      setLastFailedAction(null);
    }
  };

  const safeApiCall = async (apiCall, actionName) => {
    try {
      setLastFailedAction(() => () => safeApiCall(apiCall, actionName));
      return await apiCall();
    } catch (err) {
      console.error(`API Error [${actionName}]:`, err);
      addErrorToChat(() => safeApiCall(apiCall, actionName));
      return null;
    }
  };

  const handleAIButtonClick = async (fieldName, fieldValue) => {
    let effectiveValue = fieldValue?.trim() || "";
    if (!effectiveValue && !['cardImage', 'bannerImage', 'introVideo'].includes(fieldName)) return;
    if (['cardImage', 'bannerImage', 'introVideo'].includes(fieldName)) {
      effectiveValue = title?.trim() || "";
      if (!effectiveValue) return;
    }

    setAiLoading(prev => ({ ...prev, [fieldName]: true }));
    setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: t(messages.generating) }]);

    const action = async () => {
      // const token = await getToken();
      const config = {
        title: { url: 'suggest-titles/', key: 'title' },
        shortDescription: { url: 'suggest-descriptions/', key: 'user_short_description' },
        description: { url: 'suggest-full-descriptions/', key: 'user_long_description' },
        cardImage: { url: 'suggest-images/', key: 'title' },
        bannerImage: { url: 'suggest-images/', key: 'title' },
        introVideo: { url: 'suggest-videos/', key: 'title' },
      }[fieldName];

      // for local api fetch 

      // try {
      //   const res = await getAuthenticatedHttpClient().post(
      //     `LMS_API_DOMAIN/chat/v1/${config.url}`,
      //     { [config.key]: effectiveValue }
      //   );
      //   return res.data;

      // } catch (err) {
      //   throw new Error("Suggestion failed");
      // }
      try {
        const res = await getAuthenticatedHttpClient().post(
          `${getConfig().LMS_BASE_URL}/chat/v1/${config.url}`,
          { [config.key]: effectiveValue }
        );
        return res.data;

      } catch (err) {
        throw new Error("Suggestion failed");
      }
    };

    const data = await safeApiCall(action, `AI_${fieldName}`);
    if (data) {
      openCopilot(fieldName, effectiveValue);
      setAiResponse(prev => [...prev, data]);
      setButtons(data.btns || []);
    }
    setAiLoading(prev => ({ ...prev, [fieldName]: false }));
  };

  const updateTitle = (v) => setTitle(v);
  const updateShortDescription = (v) => setShortDescription(v);
  const updateDescription = (v) => setDescription(v);
  const updateCardImage = (v) => setCardImage(v);
  const updateBannerImage = (v) => setBannerImage(v);
  const updateIntroVideo = (v) => setIntroVideo(v);

  const getReadableFieldName = (field) => t(messages[`field${field.charAt(0).toUpperCase() + field.slice(1)}`]);

  const openCopilotReview = () => {
    setPinnedSuggestions([]);
    setIsDocked(true); setIsMinimized(true);
    setSize({ w: initialConfig.width, h: initialConfig.height });
    setPos({ x: window.innerWidth - initialConfig.width, y: 0 });
    setIsOpen(true); setIsFloating(false);
    setTimeout(() => setIsMinimized(false), 10);
    if (!isOpen) {
      setChatHistory([]); setAiResponse([]); setSelectedSuggestion(null);
      setPrompt(''); setButtons([]); setQuestions([]); setCurrentQuestionIndex(-1); setUserAnswers({});
    }
  }
  const openCopilot = (name, value) => {
    setPinnedSuggestions([]);
    setFieldData({ name, value });
    setIsDocked(true); setIsMinimized(true);
    setSize({ w: initialConfig.width, h: initialConfig.height });
    setPos({ x: window.innerWidth - initialConfig.width, y: 0 });
    setIsOpen(true); setIsFloating(false);
    setTimeout(() => setIsMinimized(false), 10);
    if (!isOpen) {
      setChatHistory([]); setAiResponse([]); setSelectedSuggestion(null);
      setPrompt(''); setButtons([]); setQuestions([]); setCurrentQuestionIndex(-1); setUserAnswers({});
    }
  };

  const closeCopilot = () => {
    setPinnedSuggestions([]);
    setIsOpen(false);
    if (isFullScreen) { setIsFullScreen(false); setSavedState(null); }
    setQuestions([]); setCurrentQuestionIndex(-1); setUserAnswers({});
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const dock = () => {
    setIsDocked(true); setIsMinimized(false);
    setSize({ w: initialConfig.width, h: initialConfig.height });
    setPos({ x: window.innerWidth - initialConfig.width, y: 0 });
    setIsFloating(false);
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setSavedState({ size, pos, isDocked, isMinimized });
      setSize({
        w: window.innerWidth - sidebarWidth - 40,
        h: window.innerHeight - feedbackBannerHeight - navbarHeight - 16
      });
      setPos({
        x: sidebarWidth + 20,
        y: feedbackBannerHeight + navbarHeight + 15
      });
      setIsDocked(false);
      setIsMinimized(false);
      setIsFullScreen(true);
    } else if (savedState) {
      setSize(savedState.size);
      setPos(savedState.pos);
      setIsDocked(savedState.isDocked);
      setIsMinimized(savedState.isMinimized);
      setIsFullScreen(false);
      setSavedState(null);
    }
  };

  const handleFloating = () => {
    setIsFloating(true); setIsDocked(false);
    const w = 400, h = 450;
    setPos({ x: window.innerWidth / 2 - w / 2, y: window.innerHeight / 2 - h / 2 });
    setSize({ w, h });
  };

  // Field order for sorting
  const FIELD_ORDER = {
    title: 0,
    shortDescription: 1,
    description: 2,
    cardImage: 3,
    bannerImage: 4,
    introVideo: 5,
  };

  // Helper: Sort pinned suggestions by field order
  const getSortedPinnedSuggestions = () => {
    return [...pinnedSuggestions].sort((a, b) => {
      return (FIELD_ORDER[a.field] ?? 5) - (FIELD_ORDER[b.field] ?? 5);
    });
  };

  // Updated pinSuggestion
  const pinSuggestion = (sug) => {
    const newPin = { value: sug.value, field: sug.field };
    setPinnedSuggestions(prev => {
      if (prev.some(p => p.value === newPin.value && p.field === newPin.field)) {
        return prev;
      }
      return [...prev, newPin];
    });
  };

  // Updated unpinSuggestion
  const unpinSuggestion = (valueOrSug) => {
    const value = typeof valueOrSug === 'string' ? valueOrSug : valueOrSug.value;
    const field = typeof valueOrSug === 'string' ? fieldData.name : valueOrSug.field;

    setPinnedSuggestions(prev =>
      prev.filter(p => !(p.value === value && p.field === field))
    );
  };

  // Updated insertPinnedSuggestion – only removes from same field
  const insertPinnedSuggestion = (sug) => {
    handleSelectSuggestion(sug); // This already inserts + updates field

    // Remove ONLY pinned items from the SAME field
    setPinnedSuggestions(prev =>
      prev.filter(p => p.field !== sug.field)
    );
  };
  const getApiConfig = (field) => {
    const map = {
      title: { url: 'suggest-titles/', bodyKey: 'title' },
      shortDescription: { url: 'suggest-descriptions/', bodyKey: 'user_short_description' },
      description: { url: 'suggest-full-descriptions/', bodyKey: 'user_long_description' },
      cardImage: { url: 'suggest-images/', bodyKey: 'title' },
      bannerImage: { url: 'suggest-images/', bodyKey: 'title' },
      introVideo: {url: 'suggest-videos/', bodyKey: 'title'},
    };
    return map[field] || map.title;
  };

  const getPreviousValue = (field) => {
    const map = { shortDescription: title, description: shortDescription || title, cardImage: title, bannerImage: title, introVideo: title };
    return (map[field] || '')?.trim();
  };

  const getCurrentFieldValue = (field) => {
    const map = { title, shortDescription, description, cardImage: title, bannerImage: title, introVideo: title };
    return (map[field] || '')?.trim();
  };

  const fetchQuestions = async (field) => {
    setChatHistory(prev => [...prev, { type: 'text', sender: 'user', content: t(messages.customizeRequest) }]);
    const action = async () => {
      // for local api fetch

      // try {
      //   const res = await getAuthenticatedHttpClient().post(
      //     `LMS_API_DOMAIN/chat/v1/prediction-questions/`,
      //     {}
      //   );
      //   return res.data;

      // } catch (err) {
      //   throw new Error("Failed to fetch questions");
      // }
      try {
        const res = await getAuthenticatedHttpClient().post(
          `${getConfig().LMS_BASE_URL}/chat/v1/prediction-questions/`,
          {}
        );
        return res.data;

      } catch (err) {
        throw new Error("Failed to fetch questions");
      }
    };
    const data = await safeApiCall(action, 'fetchQuestions');
    if (data) {
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: data.messages?.[0]?.text }]);
    }
  };

  const fetchSuggestions = async (prompt, field = fieldData.name, more = false) => {
    const value = more ? getCurrentFieldValue(field) : prompt;
    if (!value) {
      setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: t(messages.noValue, { field: getReadableFieldName(field) }) }]);
      return;
    }

    setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: t(messages.generating) }]);

    const action = async () => {

      const cfg = getApiConfig(field);
      const payload = { [cfg.bodyKey]: value, };
      if (more) payload.more_suggestions = true;

      // for local api url

      // try {
      //   const res = await getAuthenticatedHttpClient().post(
      //     `LMS_API_DOMAIN/chat/v1/${cfg.url}`,
      //     payload
      //   );
      //   return res.data;

      // } catch (err) {
      //   throw new Error("Failed to fetch suggestions");
      // }

      try {
        const res = await getAuthenticatedHttpClient().post(
          `${getConfig().LMS_BASE_URL}/chat/v1/${cfg.url}`,
          payload
        );
        return res.data;

      } catch (err) {
        throw new Error("Failed to fetch suggestions");
      }
    };

    const data = await safeApiCall(action, 'fetchSuggestions');
    if (data) setAiResponse(prev => [...prev, data]);
  };

  const submitCustomAnswers = async (field = fieldData.name) => {
    setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: t(messages.generating) }]);
    const action = async () => {
      const cfg = getApiConfig(field);
      const payload = {
        [cfg.bodyKey]: getCurrentFieldValue(field),
        ...userAnswers,
        custom_flow: true,
      };

      // for local api fetch

      // try {
      //   const res = await getAuthenticatedHttpClient().post(
      //     `LMS_API_DOMAIN/chat/v1/${cfg.url}`,
      //     payload
      //   );

      //   return res.data;

      // } catch (err) {
      //   throw new Error("Failed to submit answers");
      // }

      try {
        const res = await getAuthenticatedHttpClient().post(
          `${getConfig().LMS_BASE_URL}/chat/v1/${cfg.url}`,
          payload
        );

        return res.data;

      } catch (err) {
        throw new Error("Failed to submit answers");
      }
    };
    const data = await safeApiCall(action, 'submitCustomAnswers');
    if (data) {
      setAiResponse(prev => [...prev, data]);
      setQuestions([]); setCurrentQuestionIndex(-1); setUserAnswers({});
    }
  };

  const handleAnswer = (answer, field) => {
    setUserAnswers(prev => ({ ...prev, [questions[currentQuestionIndex].key]: answer }));
    setChatHistory(prev => [...prev, { type: 'text', sender: 'user', content: answer }]);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitCustomAnswers(field);
    }
  };

  const sendPrompt = async () => {
    let effectivePrompt = prompt.trim();
    if (!effectivePrompt) {
      effectivePrompt = getPreviousValue(fieldData.name);
      if (!effectivePrompt) {
        setChatHistory(prev => [...prev, { type: 'text', sender: 'ai', content: t(messages.noValue, { field: getReadableFieldName(fieldData.name) }) }]);
        return;
      }
    } else {
      setChatHistory(prev => [...prev, { type: 'text', sender: 'user', content: prompt }]);
    }
    setPrompt('');
    await fetchSuggestions(effectivePrompt);
  };

  const handleButtonAction = (buttonId) => {
    switch (buttonId) {
      case 'more_suggestions':
        setChatHistory(prev => [...prev, { type: 'text', sender: 'user', content: t(messages.buttonMore) }]);
        fetchSuggestions(getPreviousValue(fieldData.name), fieldData.name, true);
        break;
      case 'customize':
        handleCustomize();
        break;
      case 'continue': {
        const fieldOrder = ['title', 'shortDescription', 'description', 'cardImage', 'bannerImage', 'introVideo'];
        const currentIndex = fieldOrder.indexOf(fieldData.name);
        const remainingFields = fieldOrder.slice(currentIndex + 1);

        // Find the first EMPTY field in the remaining sequence
        const nextEmptyField = remainingFields.find(f => {
          const value = {
            title,
            shortDescription,
            description,
            cardImage,
            bannerImage,
            introVideo,
          }[f];
          return !value || value.trim() === '';
        });

        const targetField = nextEmptyField;
        if (targetField) {
          setFieldData({ name: targetField, value: '' });
          setPrompt('');
          fetchSuggestions(getCurrentFieldValue(fieldData.name), targetField);
        }
        break;
      }

    }
  };

  const handleCustomize = () => fetchQuestions(fieldData.name);

  const handleMouseDownDrag = (ref) => (e) => {
    if (isMinimized || isFullScreen) return;
    e.preventDefault(); e.stopPropagation();
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    startData.current = { x: rect.left, y: rect.top, mouseX: e.clientX, mouseY: e.clientY };
    if (isDocked) {
      setIsDocked(false); setIsFloating(true);
      setSize({ w: 400, h: window.innerHeight * 0.83 });
      setPos({ x: rect.left, y: rect.top });
    }
    setDragging(true);
  };

  const handleMouseDownResize = (type) => (e) => {
    if (isMinimized || isFullScreen) return;
    e.preventDefault(); e.stopPropagation();
    startData.current = { w: size.w, h: size.h, mouseX: e.clientX, mouseY: e.clientY };
    setResizing(true); setResizeType(type);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - startData.current.mouseX;
      const dy = e.clientY - startData.current.mouseY;
      const newX = Math.max(0, Math.min(window.innerWidth - size.w, startData.current.x + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - size.h, startData.current.y + dy));
      setPos({ x: newX, y: newY });
    }
    if (resizing) {
      const dx = e.clientX - startData.current.mouseX;
      const dy = e.clientY - startData.current.mouseY;
      let newW = size.w, newH = size.h;
      if (resizeType === 'width') newW = Math.max(400, Math.min(600, size.w - dx));
      if (resizeType === 'both') {
        newW = Math.max(400, Math.min(800, size.w + dx));
        newH = Math.max(450, Math.min(800, size.h + dy));
      }
      setSize({ w: newW, h: newH });
    }
  };

  const handleMouseUp = () => {
    setDragging(false); setResizing(false); setResizeType('');
  };

  useEffect(() => {

    const fetchMenuConfig = async () => {
      try {

        // for local api fetch

        // const response = await getAuthenticatedHttpClient().get(`STUDIO_API_DOMAIN/titaned/api/v1/menu-config/`);
        const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);

        const data = response.data;

        setEnabledCopilot(!!data.enable_copilot);
        setShowCopilotIcon(!!data.show_copilot_icon);
      } catch (err) {
        console.log('Failed to load menu-config for Copilot:', err);
      }
      setEnabledCopilot(false);
      setShowCopilotIcon(false);
    };

    fetchMenuConfig();
  }, []);

  useEffect(() => {
    const handle = (e) => { if (dragging || resizing) { e.preventDefault(); handleMouseMove(e); } };
    if (dragging || resizing) {
      document.addEventListener('mousemove', handle, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handle);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [dragging, resizing]);


  // PERFECT FEEDBACK BANNER + SIDEBAR + NAVBAR DETECTION
  useEffect(() => {
    let banner = document.querySelector('.feedback_banner');
    let sidebar = document.querySelector('.sidebar, [data-testid="sidebar"], #sidebar, .pgn__sidebar, aside');
    let navbar = document.querySelector('header, .navbar, nav, [data-testid="navbar"], .pgn__navbar');

    let currentBannerH = 0;
    let currentNavbarH = 0;
    let currentSidebarW = 0;

    const update = () => {
      const newBanner = document.querySelector('.feedback_banner');
      const newBannerH = newBanner?.getBoundingClientRect().height || 0;
      const newNavbarH = navbar?.getBoundingClientRect().height || 0;
      const newSidebarW = sidebar?.getBoundingClientRect().width || 0;

      if (
        newBanner !== banner ||
        newBannerH !== currentBannerH ||
        newNavbarH !== currentNavbarH ||
        newSidebarW !== currentSidebarW
      ) {
        banner = newBanner;
        currentBannerH = newBannerH;
        currentNavbarH = newNavbarH;
        currentSidebarW = newSidebarW;

        setFeedbackBannerHeight(currentBannerH);
        setNavbarHeight(currentNavbarH);
        setSidebarWidth(currentSidebarW);

        if (isFullScreen) {
          setSize({
            w: window.innerWidth - currentSidebarW - 40,
            h: window.innerHeight - currentBannerH - currentNavbarH - 16
          });
          setPos({
            x: currentSidebarW + 20,
            y: currentBannerH + currentNavbarH + 15
          });
        }
      }
    };

    // Initial + instant
    update();

    // Watch for banner appearing/disappearing
    const mo = new MutationObserver(update);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Watch size changes
    const ro = new ResizeObserver(update);
    if (sidebar) ro.observe(sidebar);
    if (navbar) ro.observe(navbar);
    document.querySelectorAll('.feedback_banner').forEach(el => ro.observe(el));

    // Window resize
    window.addEventListener('resize', update);

    // Safety poll (for banners added via JS after mount)
    const poll = setInterval(update, 400);

    return () => {
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', update);
      clearInterval(poll);
    };
  }, [isFullScreen]);

  useEffect(() => {
    if (aiResponse.length > 0) {
      const latest = aiResponse[aiResponse.length - 1];
      const history = [];
      // Helper to tag suggestions with current field
      const tagSuggestions = (arr) => (arr || []).map(value => ({
        value,
        field: fieldData.name  // This is the magic!
      }));

      latest.msg?.forEach(m => history.push({ type: 'text', sender: 'ai', content: m.text, id: m.id }));
      if (latest.suggestions) history.push({ type: 'suggestions', sender: 'ai', content: tagSuggestions(latest.suggestions) });
      if (latest.l3) history.push({ type: 'customize', sender: 'ai', content: latest.l3.text });
      if (latest.l4) history.push({ type: 'text', sender: 'ai', content: latest.l4.text });
      if (latest.more_suggestions) history.push({ type: 'suggestions', sender: 'ai', content: tagSuggestions(latest.more_suggestions) });
      setChatHistory(prev => [...prev, ...history]);
      setButtons(latest.btns || []);
      if (latest.suggestions && !latest.more_suggestions && latest.suggestions.length > 0) {
        const first = latest.suggestions[0];
        setSelectedSuggestion(first);
        insertSuggestion(first, false);
      }
    }
  }, [aiResponse]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      if (chatHistory[chatHistory.length - 1]?.id === q.key) return;
      setChatHistory(prev => [...prev, {
        type: 'question', sender: 'ai', id: q.key, content: q.text, options: q.options || null,
        questionIndex: currentQuestionIndex + 1, totalQuestions: questions.length
      }]);
    }
  }, [questions, currentQuestionIndex]);

  const insertSuggestion = (sug, add = true) => {
    const value = typeof sug === 'string' ? sug : sug.value;
    const targetField = typeof sug === 'string' ? fieldData.name : sug.field;
    const map = { title: updateTitle, shortDescription: updateShortDescription, description: updateDescription, cardImage: updateCardImage, bannerImage: updateBannerImage, introVideo: updateIntroVideo };
    map[targetField]?.(value);
    if (add) {
      const messageContent = isValidImageUrl(value) || isVideoUrl(value)
      ? { value }
      : value;

      setChatHistory(prev => [...prev, {
        type: isVideoUrl(value) ? 'video' : isValidImageUrl(value) ? 'image' : 'text',
        sender: 'user',
        content: messageContent
      }]);
    }
  };

  const handleSelectSuggestion = (sug) => {

    const value = typeof sug === 'string' ? sug : sug.value;
    const targetField = typeof sug === 'string' ? fieldData.name : sug.field;
    setSelectedSuggestion({ value, field: targetField });
    setSelectedSuggestion({ value, field: targetField });
    insertSuggestion({ value, field: targetField }, true);

    setPinnedSuggestions(prev =>
      prev.filter(p => p.field !== sug.field)
    );

    // ✅ Update correct field using available updaters
    const updaters = {
      title: updateTitle,
      shortDescription: updateShortDescription,
      description: updateDescription,
      cardImage: updateCardImage,
      bannerImage: updateBannerImage,
      introVideo: updateIntroVideo,
    };

    updaters[targetField]?.(value);

    // ✅ Switch to the correct field
    setFieldData({ name: targetField, value });


    // const field = fieldData.name;
    const readableName = getReadableFieldName(targetField);

    // Success message
    setChatHistory(prev => [
      ...prev,
      { type: 'text', sender: 'ai', content: t(messages.inserted, { field: readableName }) },
    ]);

    // ✅ Find next EMPTY field (same logic as your 'continue' case)
    const fieldOrder = ['title', 'shortDescription', 'description', 'cardImage', 'bannerImage', 'introVideo'];
    const currentIndex = fieldOrder.indexOf(targetField);
    const remainingFields = fieldOrder.slice(currentIndex + 1);

    const nextEmptyField = remainingFields.find(f => {
      const value = {
        title,
        shortDescription,
        description,
        cardImage,
        bannerImage,
        introVideo,
      }[f];
      return !value || value.trim() === '';
    });

    const nextField = nextEmptyField; // may be undefined if all filled

    if (nextField) {
      setChatHistory(prev => [
        ...prev,
        { type: 'text', sender: 'ai', content: t(messages[`continue${nextField.charAt(0).toUpperCase() + nextField.slice(1)}`]) }
      ]);
      setButtons([{ id: 'continue', label: t(messages.buttonContinue), status: 'active' }]);
    } else {
      setButtons([]); // Last field → no continue
    }
  };



  const value = {
    isOpen, fieldData, isDocked, isMinimized, size, pos, openCopilot, closeCopilot, toggleMinimize, dock,
    isFullScreen, toggleFullScreen, isFloating, handleFloating, handleMouseDownDrag, handleMouseDownResize,
    title, shortDescription, description, cardImage, bannerImage,
    updateTitle, updateShortDescription, updateDescription, updateCardImage, updateBannerImage,
    chatHistory, selectedSuggestion, prompt, setPrompt, buttons, questions, currentQuestionIndex,
    handleSelectSuggestion, sendPrompt, handleButtonAction, handleAnswer, handleAIButtonClick, aiLoading,
    t, retryLastAction, getReadableFieldName, sidebarWidth, feedbackBannerHeight, navbarHeight, pinnedSuggestions,
    pinSuggestion, unpinSuggestion, insertPinnedSuggestion, getSortedPinnedSuggestions, enabledCopilot, showCopilotIcon, openCopilotReview, introVideo, updateIntroVideo,
  };

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
};

export default CopilotContext;