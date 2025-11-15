import { useRef, useEffect } from 'react';
import { Button, Icon, Form } from '@openedx/paragon';
import { ChevronLeft, ChevronRight, Close, ArrowForward, Fullscreen, FullscreenExit, Send } from '@openedx/paragon/icons';
import { Bookmark, BookmarkBorder } from '@openedx/paragon/icons';
import { useCopilot } from './CopilotContext';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import './copilot.scss';

const isValidImageUrl = (url) => {
  return (
    typeof url === 'string' &&
    (url.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)(?=\?|$)/i) ||
      url.match(/^https?:\/\/(www\.)?picsum\.photos\/.+/i))
  );
};


const TAB_WIDTH = 60;

const Copilot = () => {
  const { formatMessage } = useIntl();
  const t = (msg, values) => formatMessage(msg, values);
  const {
    isOpen,
    fieldData,
    isDocked,
    isMinimized,
    size,
    pos,
    closeCopilot,
    toggleMinimize,
    dock,
    isFullScreen,
    toggleFullScreen,
    sidebarWidth,
    feedbackBannerHeight,
    navbarHeight,
    isFloating,
    handleMouseDownDrag,
    handleMouseDownResize,
    handleFloating,
    chatHistory,
    selectedSuggestion,
    handleSelectSuggestion,
    prompt,
    setPrompt,
    sendPrompt,
    buttons,
    handleButtonAction,
    questions,
    currentQuestionIndex,
    handleAnswer,
    retryLastAction,
    pinnedSuggestions,
    pinSuggestion,
    unpinSuggestion,
    insertPinnedSuggestion,
    getSortedPinnedSuggestions,
    enabledCopilot,
  } = useCopilot();

  const ref = useRef(null);
  const panelRef = useRef(null);
  const chatContainerRef = useRef(null);
  const pinnedContainerRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const chat = chatContainerRef.current;
    if (!panel || !chat) return;

    let rafId = null;

    const updateChatHeight = () => {
      const panelHeight = panel.getBoundingClientRect().height;
      const percentage = panelHeight <= 615 ? 75 : 85;
      chat.style.height = `${percentage}%`;
      chat.style.maxHeight = `${percentage}%`;
      chat.style.flex = 'none'; // Prevent flex from overriding
      rafId = null;
    };

    const scheduleUpdate = () => {
      if (!rafId) rafId = requestAnimationFrame(updateChatHeight);
    };

    // Initial
    scheduleUpdate();

    // ResizeObserver for panel size changes
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(panel);

    // Window resize
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isOpen, isFullScreen, size, pos, isDocked, isMinimized]);

  const handleSendAnswer = () => {
    if (prompt.trim()) {
      handleAnswer(prompt.trim(), fieldData.name);
      setPrompt('');
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, questions, currentQuestionIndex]);
  useEffect(() => {
    if (!pinnedContainerRef.current || pinnedSuggestions.length === 0) return;

    const lastPinned = pinnedSuggestions[pinnedSuggestions.length - 1];
    const fieldGroup = pinnedContainerRef.current.querySelector(`[data-field="${lastPinned.field}"]`);

    requestAnimationFrame(() => {
      if (fieldGroup) {
        fieldGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        pinnedContainerRef.current.scrollTo({
          top: pinnedContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  }, [pinnedSuggestions]);

  if (!isOpen) return null;

  const panelStyle = {
    position: isFullScreen ? 'fixed' : (isDocked ? 'relative' : 'fixed'),
    right: isDocked ? '-20px' : 'auto',
    left: isFullScreen ? `calc(${sidebarWidth + 20}px)` : (isDocked ? 'auto' : `${pos.x}px`),
    top: isFullScreen ? `calc(${feedbackBannerHeight + navbarHeight + 15}px)` : (isDocked ? '0' : `${pos.y}px`),
    width: isFullScreen ? `calc(100vw - ${sidebarWidth + 40}px)` : (isMinimized ? `${TAB_WIDTH}px` : `${size.w}px`),
    height: isFullScreen ? `calc(100vh - ${feedbackBannerHeight + navbarHeight + 16}px)` : (isDocked ? '83vh' : `${size.h}px`),
    backgroundColor: isFullScreen || !isDocked ? 'color-mix(in srgb, var(--bg-surface) 80%, transparent)' : 'var(--bg-surface)',
    backdropFilter: isFullScreen || !isDocked ? 'blur(0) saturate(180%)' : 'none',
    WebkitBackdropFilter: isFullScreen || !isDocked ? 'blur(0) saturate(180%)' : 'none',
    border: isFullScreen || !isDocked ? '1px solid color-mix(in srgb, var(--border-color) 20%, transparent)' : '1px solid var(--border-color)',
    boxShadow: isFullScreen || !isDocked ? '0 4px 30px rgba(0, 0, 0, 0.2)' : 'none',
    borderLeft: isFullScreen ? 'none' : '1px solid var(--border-color)',
    zIndex: isFullScreen ? 2000 : 999,
    overflow: 'hidden',
    transition: isFullScreen ? 'width 0.8s ease-in-out' : 'width 0.8s ease-in-out, height 0.8s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle = { display: isMinimized && !isFullScreen ? 'none' : 'block' };

  return (
    <div className={`copilot-wrapper ${isDocked ? 'docked' : 'inline'}`}>
      <div ref={(el) => {
        ref.current = el;
        panelRef.current = el;
      }} style={panelStyle} className={`copilot-panel ${isFullScreen ? 'fullscreen' : ''} ${(isDocked && !isFullScreen) ? 'isDocked' : ''}`}>

        <div className="copilot-header">
          <div className="header-left" style={{ display: isMinimized && !isFullScreen ? 'none' : 'flex' }}>
            <span className="title">{t(messages.copilotTitle)}</span>
          </div>
          {!isFullScreen && <div className="header-mid" onMouseDown={handleMouseDownDrag(ref)}></div>}
          <div className="header-right">
            {isDocked && !isFullScreen && (
              <Button variant="tertiary" size="sm" onClick={toggleMinimize} className="minimize-icon">
                <Icon src={isMinimized ? ChevronLeft : ChevronRight} />
              </Button>
            )}
            {!isMinimized && !isFullScreen && !isFloating && (
              <div className="drag-handle" onClick={handleFloating} title={t(messages.tooltipDragToMove)}>
                <div className="dots">
                  <span /><span /><span />
                  <span /><span /><span />
                </div>
              </div>
            )}
            {!isMinimized && (
              <Button variant="tertiary" size="sm" onClick={toggleFullScreen}>
                <Icon src={isFullScreen ? FullscreenExit : Fullscreen} />
              </Button>
            )}
            {!isMinimized && !isDocked && !isFullScreen && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  dock();
                }}
              >
                <Icon src={ArrowForward} />
              </Button>
            )}
            {!isMinimized && (
              <Button variant="tertiary" size="sm" onClick={closeCopilot}>
                <Icon src={Close} />
              </Button>
            )}
          </div>
        </div>
        {enabledCopilot ? (
          <>
            <div className="copilot-content" style={contentStyle}>
              <div ref={ref => {
                pinnedContainerRef.current = ref;
              }} className={`${pinnedSuggestions.length === 0 ? 'none' : 'pined-suggestion'}`}>
                {(() => {
                  const sorted = getSortedPinnedSuggestions();
                  const grouped = {};
                  sorted.forEach(sug => {
                    if (!grouped[sug.field]) grouped[sug.field] = [];
                    grouped[sug.field].push(sug);
                  });

                  const fieldLabels = {
                    title: t(messages.fieldTitle),
                    shortDescription: t(messages.fieldShortDescription),
                    description: t(messages.fieldDescription),
                    cardImage: t(messages.fieldCardImage),
                    bannerImage: t(messages.fieldBannerImage),
                  };

                  return Object.keys(grouped).map(field => (
                    <div key={field} className="pinned-group" data-field={field}>
                      <div className="pinned-group-label">
                        {fieldLabels[field] || field}
                      </div>
                      <div className="pinned-group-items">
                        {grouped[field].map((sug) => {
                          const isImage = isValidImageUrl(sug.value);
                          return (
                            <div
                              key={`${sug.field}-${sug.value}`}
                              className={`pinned-item ${isImage ? 'image' : 'text'}`}
                              onClick={() => insertPinnedSuggestion(sug)}
                              title={t(messages.tooltipClickToInsert)}
                            >
                              {isImage ? (
                                <img src={sug.value} alt="Pinned" />
                              ) : (
                                <div>{sug.value}</div>
                              )}
                              <button
                                className="unpin-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unpinSuggestion(sug);
                                }}
                                title={t(messages.tooltipRemovePinned)}
                              >
                                <Icon src={Close} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="chat-messages" ref={chatContainerRef}>
                {chatHistory.map((item, index) => (
                  <div key={index} className={`message-container ${item.sender}`}>
                    {item.type === 'text' && (
                      <div className="message">{item.content}</div>
                    )}
                    {item.type === 'error' && (
                      <div className="message error">
                        <div>{item.content}</div>
                        <Button onClick={item.retryAction || retryLastAction} size="sm" variant="outline-danger">
                          {t(messages.retry)}
                        </Button>
                      </div>
                    )}


                    {item.type === 'suggestions' && (
                      item.content.map((sug) => {
                        const isImage = isValidImageUrl(sug.value);
                        const isPinned = pinnedSuggestions.some(p => p.value === sug.value && p.field === sug.field);

                        const suggestionEl = isImage ? (
                          <img
                            key={`${sug.field}-${sug.value}`}
                            src={sug.value}
                            alt={t(messages.altSuggestionImage)}
                            className={`suggestion image-suggestion ${selectedSuggestion === sug.value ? 'selected' : ''}`}
                            onClick={() => handleSelectSuggestion(sug)}
                          />
                        ) : (
                          <div
                            key={`${sug.field}-${sug.value}`}
                            className={`suggestion ${selectedSuggestion === sug ? 'selected' : ''}`}
                            onClick={() => handleSelectSuggestion(sug)}
                          >
                            {sug.value}
                          </div>
                        );

                        return (
                          <div key={`${sug.field}-${sug.value}`} className="suggestion-wrapper">
                            {suggestionEl}
                            <button
                              className={`pin-btn ${isPinned ? 'pinned' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                isPinned ? unpinSuggestion(sug) : pinSuggestion(sug);
                              }}
                              title={isPinned ? t(messages.tooltipUnpin) : t(messages.tooltipPin)}
                            >
                              <Icon src={isPinned ? Bookmark : BookmarkBorder} />
                            </button>
                          </div>
                        );
                      })
                    )}
                    {item.type === 'image' && (
                      <div className="message-container user">
                        <img
                          src={item.content?.value || item.content}
                          alt={t(messages.altSelectedImage)}
                          className="image-message"
                        />
                      </div>
                    )}

                    {item.type === 'customize' && (
                      <div className="message">
                        {item.content}
                      </div>
                    )}


                    {item.type === 'question' && (
                      <div className="message-container ai">
                        <div className="customQuestion">
                          {t(messages.questionCounter, { current: item.questionIndex, total: item.totalQuestions })} {item.content}
                        </div>
                        {item.options ? (
                          item.options.map((option) => (
                            <div
                              key={option}
                              className={`suggestion ${selectedSuggestion === option ? 'selected' : ''}`}
                              onClick={() => handleAnswer(option, fieldData.name)}
                            >
                              {option}
                            </div>
                          ))
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}

              </div>
              <div className="copilot-content-bottom">
                <div className="copilot-content-bottom-button">
                  {buttons.map((button) => (
                    <Button
                      key={button.id}
                      variant={button.status === 'active' ? 'primary' : 'outline-primary'}
                      onClick={() => handleButtonAction(button.id)}
                      size="sm"
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
                <div className="input-container">
                  <Form.Control
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      questions.length > 0 && currentQuestionIndex >= 0 && !questions[currentQuestionIndex]?.options
                        ? t(messages.placeholderAnswer)
                        : t(messages.placeholderMessage)
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        if (questions.length > 0 && currentQuestionIndex >= 0 && !questions[currentQuestionIndex].options) {
                          handleSendAnswer();
                        } else {
                          sendPrompt();
                        }
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (questions.length > 0 && currentQuestionIndex >= 0 && !questions[currentQuestionIndex].options) {
                        handleSendAnswer();
                      } else {
                        sendPrompt();
                      }
                    }}
                  >
                    <Icon src={Send} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="copilot-loading"><span>{t(messages.loadingcopilot)}</span></div>
        )
        }
        {/* Resizers and indicators moved here, inside .copilot-panel */}
        {!isFullScreen && !isMinimized && (
          <>
            {isDocked ? (
              <div className="resize-indicator left-indicator" title={t(messages.tooltipResize)}></div>
            ) : (
              <div className="resize-indicator bottom-right-indicator" title={t(messages.tooltipResize)}></div>
            )}
          </>
        )}
        {!isFullScreen && (
          isDocked ? (
            <div
              className="resizer resizer-left"
              onMouseDown={(e) => handleMouseDownResize('width')(e)}
            />
          ) : (
            <div
              className="resizer resizer-bottom-right"
              onMouseDown={(e) => handleMouseDownResize('both')(e)}
            />
          )
        )}

      </div>
    </div>
  );
};

export default Copilot;