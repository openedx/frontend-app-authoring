import { createContext, useContext, useState, useEffect, useRef } from 'react';

const BASE_API_URL = 'https://tenesha-fortifiable-jana.ngrok-free.dev';

const isValidImageUrl = (url) => {
  return typeof url === 'string' && url.match(/\.(jpeg|jpg|png|gif)(?=\?|$)/i);
};

const CopilotContext = createContext(null);

export const useCopilot = () => useContext(CopilotContext);

// Utility function to debounce callbacks
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const CopilotProvider = ({ children, initialConfig = { width: 400, height: 83, position: 'right' } }) => {
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
  const [aiResponse, setAiResponse] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [buttons, setButtons] = useState([]);

  const startData = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });

  const updateTitle = (value) => setTitle(value);
  const updateShortDescription = (value) => setShortDescription(value);
  const updateDescription = (value) => setDescription(value);
  const updateCardImage = (value) => setCardImage(value);
  const updateBannerImage = (value) => setBannerImage(value);

  const openCopilot = (name, value) => {
    setFieldData({ name, value });
    setIsDocked(true);
    setIsMinimized(true);
    setSize({ w: initialConfig.width, h: initialConfig.height });
    setPos({ x: window.innerWidth - initialConfig.width, y: 0 });
    setIsOpen(true);
    setIsFloating(false);
    setTimeout(() => setIsMinimized(false), 10);
    if (!isOpen) {
      setChatHistory([]);
      setAiResponse([]);
      setSelectedSuggestion(null);
      setPrompt('');
      setButtons([]);
    }
  };

  const closeCopilot = () => {
    setIsOpen(false);
    if (isFullScreen) {
      setIsFullScreen(false);
      setSavedState(null);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const dock = () => {
    setIsDocked(true);
    setIsMinimized(false);
    setSize({ w: initialConfig.width, h: initialConfig.height });
    setPos({ x: window.innerWidth - initialConfig.width, y: 0 });
    setIsFloating(false);
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setSavedState({
        size,
        pos,
        isDocked,
        isMinimized,
      });
      setSize({ w: window.innerWidth - sidebarWidth - 40, h: window.innerHeight - feedbackBannerHeight - navbarHeight - 16 });
      setPos({ x: sidebarWidth + 20, y: feedbackBannerHeight + navbarHeight + 15 });
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
    setIsFloating(true);
    setIsDocked(false);
    const w = 400;
    const h = 450;
    setPos({
      x: window.innerWidth / 2 - w / 2,
      y: window.innerHeight / 2 - h / 2,
    });
    setSize({ w, h });
  };

  const getApiConfig = (field) => {
    switch (field) {
      case 'title':
        return { url: 'suggest-titles/', bodyKey: 'title' };
      case 'shortDescription':
        return { url: 'suggest-descriptions/', bodyKey: 'user_short_description' };
      case 'description':
        return { url: 'suggest-full-descriptions/', bodyKey: 'user_long_description' };
      case 'cardImage':
        return { url: 'suggest-images/', bodyKey: 'title' };
      case 'bannerImage':
        return { url: 'suggest-images/', bodyKey: 'title' };
      default:
        return { url: 'suggest-titles/', bodyKey: 'title' };
    }
  };

  const getPreviousValue = (field) => {
    switch (field) {
      case 'shortDescription':
        return title?.trim() || '';
      case 'description':
        return shortDescription?.trim() || title?.trim() || '';
      case 'cardImage':
        return title?.trim() || '';
      case 'bannerImage':
        return title?.trim() || '';
      default:
        return '';
    }
  };

  const fetchSuggestions = async (effectivePrompt, field = fieldData.name) => {
    setChatHistory((prev) => [
      ...prev,
      { type: 'text', sender: 'ai', content: 'Your requirement is generating ...' },
    ]);
    try {
      const tokenResponse = await fetch(
        // "https://staging.titaned.com/oauth2/access_token",
        `${BASE_API_URL}/oauth2/access_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: "mrClisF8yB0nCcrDxCXQQkk1IKr5k4x0j8DN8wwZ",
            username: "admin",
            password: "admin",
          }),
        }
      );
      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;

      const config = getApiConfig(field);
      // const apiUrl = `https://staging.titaned.com/chat/v1/${config.url}`;
      const apiUrl = `${BASE_API_URL}/chat/v1/${config.url}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [config.bodyKey]: effectivePrompt,
        }),
      });
      const data = await response.json();
      setAiResponse((prev) => [...(Array.isArray(prev) ? prev : []), data]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: 'text', sender: 'ai', content: 'Error fetching suggestions. Please try again.' },
      ]);
    }
  };

  const sendPrompt = async () => {
    let effectivePrompt = prompt.trim();
    if (!effectivePrompt) {
      effectivePrompt = getPreviousValue(fieldData.name);
      if (!effectivePrompt) {
        setChatHistory((prev) => [
          ...prev,
          { type: 'text', sender: 'ai', content: `Please provide a ${fieldData.name} to generate suggestions.` },
        ]);
        return;
      }
    } else {
      setChatHistory((prev) => [...prev, { type: 'text', sender: 'user', content: prompt }]);
    }
    setPrompt('');
    await fetchSuggestions(effectivePrompt);
  };

  const handleButtonAction = (buttonId) => {
    switch (buttonId) {
      case 'more_suggestions':
        setChatHistory((prev) => [
          ...prev,
          { type: 'text', sender: 'user', content: 'Requesting more suggestions...' },
        ]);
        fetchSuggestions(getPreviousValue(fieldData.name) || prompt || '');
        break;
      case 'customize':
        handleCustomize();
        break;
      case 'continue':
        let nextField = '';
        let nextPrompt = '';
        if (fieldData.name === 'title') {
          nextField = 'shortDescription';
          nextPrompt = title?.trim() || '';
        } else if (fieldData.name === 'shortDescription') {
          nextField = 'description';
          nextPrompt = shortDescription?.trim() || '';
        } else if (fieldData.name === 'description') {
          nextField = 'cardImage';
          nextPrompt = title?.trim() || '';
        } else if (fieldData.name === 'cardImage') {
          nextField = 'bannerImage';
          nextPrompt = title?.trim() || '';
        }
        if (nextField && nextPrompt) {
          setFieldData({ name: nextField, value: '' });
          setPrompt('');
          fetchSuggestions(nextPrompt, nextField);
        }
        break;
      default:
        console.warn(`No action defined for button ID: ${buttonId}`);
    }
  };

  const handleMouseDownDrag = (ref) => (e) => {
    if (isMinimized || isFullScreen) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    startData.current = {
      x: rect.left,
      y: rect.top,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    if (isDocked) {
      setIsDocked(false);
      setIsFloating(true);
      setSize({ w: 400, h: window.innerHeight * 0.83 });
      setPos({ x: rect.left, y: rect.top });
    }
    setDragging(true);
  };

  const handleMouseDownResize = (type) => (e) => {
    if (isMinimized || isFullScreen) return;
    e.preventDefault();
    e.stopPropagation();
    startData.current = {
      w: size.w,
      h: size.h,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    setResizing(true);
    setResizeType(type);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - startData.current.mouseX;
      const dy = e.clientY - startData.current.mouseY;
      // const newX = Math.max(sidebarWidth + 20, Math.min(window.innerWidth - size.w - 20, startData.current.x + dx));
      // const newY = Math.max(navbarHeight + feedbackBannerHeight + 15, Math.min(window.innerHeight - size.h - 20, startData.current.y + dy));
      const newX = Math.max(0, Math.min(window.innerWidth - size.w, startData.current.x + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - size.h, startData.current.y + dy));
      setPos({ x: newX, y: newY });
      return;
    }
    if (resizing) {
      const dx = e.clientX - startData.current.mouseX;
      const dy = e.clientY - startData.current.mouseY;
      let newW = startData.current.w;
      let newH = startData.current.h;
      if (resizeType === 'width') {
        newW = Math.max(isFloating ? 300 : 300, Math.min(600, startData.current.w - dx));
      } else if (resizeType === 'both') {
        newW = Math.max(isFloating ? 300 : 200, Math.min(800, startData.current.w + dx));
        newH = Math.max(isFloating ? 450 : 200, Math.min(800, startData.current.h + dy));
      }
      setSize({ w: newW, h: newH });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setResizeType('');
  };

  useEffect(() => {
    const handleEvents = (e) => {
      if (dragging || resizing) {
        e.preventDefault();
        handleMouseMove(e);
      }
    };

    if (dragging || resizing) {
      document.addEventListener('mousemove', handleEvents, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleEvents);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
    return () => { };
  }, [dragging, resizing]);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const updateSidebarWidth = debounce(() => {
      setSidebarWidth(sidebar.offsetWidth || 0);
    }, 100);
    updateSidebarWidth();
    const resizeObserver = new ResizeObserver(updateSidebarWidth);
    resizeObserver.observe(sidebar);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const feedbackBanner = document.querySelector('.feedback_banner');
    if (!feedbackBanner) return;

    const updateFeedbackBannerHeight = () => {
      setFeedbackBannerHeight(feedbackBanner.offsetHeight || 0);
    };
    updateFeedbackBannerHeight();
    const resizeObserver = new ResizeObserver(updateFeedbackBannerHeight);
    resizeObserver.observe(feedbackBanner);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const navbar = document.querySelector('.navbarContainer');
    if (!navbar) return;

    const updateNavbarHeight = () => {
      setNavbarHeight(navbar.offsetHeight || 0);
    };
    updateNavbarHeight();
    const resizeObserver = new ResizeObserver(updateNavbarHeight);
    resizeObserver.observe(navbar);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      const handleResize = debounce(() => {
        setSize({ w: window.innerWidth - sidebarWidth - 40, h: window.innerHeight - feedbackBannerHeight - navbarHeight - 16 });
        setPos({ x: sidebarWidth + 20, y: feedbackBannerHeight + navbarHeight + 15 });
      }, 100);
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
    return () => { };
  }, [isFullScreen, sidebarWidth, feedbackBannerHeight, navbarHeight]);

  useEffect(() => {
    if (aiResponse && Array.isArray(aiResponse) && aiResponse.length > 0) {
      const latestResponse = aiResponse[aiResponse.length - 1];
      const newHistory = [];
      if (latestResponse.msg) {
        latestResponse.msg.forEach((m) => {
          newHistory.push({ type: 'text', sender: 'ai', content: m.text, id: m.id });
        });
      }
      if (latestResponse.suggestions) {
        newHistory.push({ type: 'suggestions', sender: 'ai', content: latestResponse.suggestions });
      }
      if (latestResponse.l3) {
        newHistory.push({
          type: 'customize',
          sender: 'ai',
          content: latestResponse.l3.text,
          button: latestResponse.l3.customize,
        });
      }
      setChatHistory((prev) => [...prev, ...newHistory]);
      setButtons(latestResponse.btns || []);

      if (latestResponse.suggestions && latestResponse.suggestions.length > 0) {
        const firstSug = latestResponse.suggestions[0];
        setSelectedSuggestion(firstSug);
        insertSuggestion(firstSug, false);
      }
    }
  }, [aiResponse]);

  const insertSuggestion = (sug, addToHistory = true) => {
    const { name } = fieldData;
    switch (name) {
      case 'title':
        updateTitle(sug);
        break;
      case 'shortDescription':
        updateShortDescription(sug);
        break;
      case 'description':
        updateDescription(sug);
        break;
      case 'cardImage':
        updateCardImage(sug);
        break;
      case 'bannerImage':
        updateBannerImage(sug);
        break;
      default:
        break;
    }

    if (addToHistory) {
      const isImage = isValidImageUrl(sug);
      setChatHistory((prev) => [
        ...prev,
        {
          type: isImage ? 'image' : 'text',
          sender: 'user',
          content: sug,
        },
      ]);
    }
  };

  const getReadableFieldName = (fieldName) => {
    switch (fieldName) {
      case 'title':
        return 'Title';
      case 'shortDescription':
        return 'Short Description';
      case 'description':
        return 'Description';
      case 'cardImage':
        return 'Course Card Image';
      case 'bannerImage':
        return 'Banner Image';
      default:
        return fieldName;
    }
  };

  const handleSelectSuggestion = (sug) => {
    setSelectedSuggestion(sug);
    insertSuggestion(sug, true);
    const readableName = getReadableFieldName(fieldData.name);

    // Add thank you message
    setChatHistory((prev) => [
      ...prev,
      { type: 'text', sender: 'ai', content: `The ${readableName} you selected has been successfully inserted!` },
    ]);

    // Add recommendation and continue button
    let recommendMsg = '';
    if (fieldData.name === 'title') {
      recommendMsg = 'Create a Short Description for your course using Copilot. Click Continue to proceed.';
    } else if (fieldData.name === 'shortDescription') {
      recommendMsg = 'Generate a detailed Course Description with Copilot. Click Continue to continue';
    } else if (fieldData.name === 'description') {
      recommendMsg = 'Design a professional Course Card Image using Copilot. Click Continue to begin.';
    } else if (fieldData.name === 'cardImage') {
      recommendMsg = 'Create an engaging Course Banner Image with Copilot. Click Continue to start.';
    }

    if (recommendMsg) {
      setChatHistory((prev) => [...prev, { type: 'text', sender: 'ai', content: recommendMsg }]);
      setButtons([{ id: 'continue', label: 'Continue', status: 'active' }]);
    } else {
      setButtons([]);
    }
  };

  const handleInsert = () => {
    if (selectedSuggestion) {
      insertSuggestion(selectedSuggestion, true);
      setSelectedSuggestion(null);
    }
  };

  const handleCustomize = () => {
    setChatHistory((prev) => [...prev, { type: 'text', sender: 'user', content: 'Customizing...' }]);
    // Add customization logic if needed
    fetchSuggestions(prompt || getPreviousValue(fieldData.name) || '');
  };

  const value = {
    isOpen,
    fieldData,
    isDocked,
    isMinimized,
    size,
    pos,
    openCopilot,
    closeCopilot,
    toggleMinimize,
    dock,
    setSize,
    setPos,
    setIsDocked,
    isFullScreen,
    toggleFullScreen,
    dragging,
    setDragging,
    resizing,
    setResizing,
    resizeType,
    setResizeType,
    sidebarWidth,
    feedbackBannerHeight,
    navbarHeight,
    isFloating,
    setIsFloating,
    handleMouseDownDrag,
    handleMouseDownResize,
    handleFloating,
    title,
    updateTitle,
    shortDescription,
    updateShortDescription,
    description,
    updateDescription,
    cardImage,
    updateCardImage,
    bannerImage,
    updateBannerImage,
    aiResponse,
    setAiResponse,
    chatHistory,
    selectedSuggestion,
    prompt,
    setPrompt,
    handleSelectSuggestion,
    handleInsert,
    handleCustomize,
    sendPrompt,
    buttons,
    setButtons,
    handleButtonAction,
  };

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
};

export default CopilotContext;