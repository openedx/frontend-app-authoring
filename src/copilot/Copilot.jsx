import { useRef, useEffect } from 'react';
import { Button, Icon, Form } from '@openedx/paragon';
import { ChevronLeft, ChevronRight, Close, ArrowForward, Fullscreen, FullscreenExit, Send } from '@openedx/paragon/icons';
import { useCopilot } from './CopilotContext';
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
    handleInsert,
    handleCustomize,
    prompt,
    setPrompt,
    sendPrompt,
    buttons,
    handleButtonAction,
    questions,
    currentQuestionIndex,
    handleAnswer,
  } = useCopilot();

  const ref = useRef(null);
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

  if (!isOpen) return null;

  const panelStyle = {
    position: isFullScreen ? 'fixed' : (isDocked ? 'relative' : 'fixed'),
    right: isDocked ? '-20px' : 'auto',
    left: isFullScreen ? `calc(${sidebarWidth + 20}px)` : (isDocked ? 'auto' : `${pos.x}px`),
    top: isFullScreen ? `calc(${feedbackBannerHeight + navbarHeight + 15}px)` : (isDocked ? '0' : `${pos.y}px`),
    width: isFullScreen ? `calc(100vw - ${sidebarWidth + 40}px)` : (isMinimized ? `${TAB_WIDTH}px` : `${size.w}px`),
    height: isFullScreen ? `calc(100vh - ${feedbackBannerHeight + navbarHeight + 16}px)` : (isDocked ? '83vh' : `${size.h}px`),
    backgroundColor: isFullScreen || !isDocked ? 'rgba(255, 255, 255, 0.6)' : 'var(--bg-surface)',
    backdropFilter: isFullScreen || !isDocked ? 'blur(0) saturate(180%)' : 'none',
    WebkitBackdropFilter: isFullScreen || !isDocked ? 'blur(0) saturate(180%)' : 'none',
    border: isFullScreen || !isDocked ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--border-color)',
    boxShadow: isFullScreen || !isDocked ? '0 4px 30px rgba(0, 0, 0, 0.2)' : 'none',
    borderLeft: isFullScreen ? 'none' : '1px solid var(--border-color)',
    zIndex: isFullScreen ? 2000 : 999,
    overflow: 'hidden',
    transition: isFullScreen ? 'width 0.8s ease-in-out' : 'width 0.8s ease-in-out, height 0.8s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle = { display: isMinimized && !isFullScreen ? 'none' : 'block' };
  const chatContainerRef = useRef(null);

  return (
    <div className={`copilot-wrapper ${isDocked ? 'docked' : 'inline'}`}>
      <div ref={ref} style={panelStyle} className={`copilot-panel ${isFullScreen ? 'fullscreen' : ''} ${(isDocked && !isFullScreen) ? 'isDocked' : ''}`}>
        <div className="copilot-header">
          <div className="header-left" style={{ display: isMinimized && !isFullScreen ? 'none' : 'flex' }}>
            <span className="title">Copilot</span>
          </div>
          <div className="header-mid" onMouseDown={handleMouseDownDrag(ref)}></div>
          <div className="header-right">
            {isDocked && !isFullScreen && (
              <Button variant="tertiary" size="sm" onClick={toggleMinimize} className="minimize-icon">
                <Icon src={isMinimized ? ChevronLeft : ChevronRight} />
              </Button>
            )}
            {!isMinimized && !isFullScreen && !isFloating && (
              <div className="drag-handle" onClick={handleFloating}>
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
        <div className="copilot-content" style={contentStyle}>
          <div className="chat-messages" ref={chatContainerRef}>
            {chatHistory.map((item, index) => (
              <div key={index} className={`message-container ${item.sender}`}>
                {item.type === 'text' && (
                  <div className="message">{item.content}</div>
                )}
                {item.type === 'suggestions' && (
                  item.content.map((sug) => {
                    const isImageSuggestion = isValidImageUrl(sug);
                    if (isImageSuggestion || item.type === 'image') {
                      return (
                        <img
                          key={sug}
                          src={sug}
                          alt="Suggested image"
                          className={`suggestion image-suggestion ${selectedSuggestion === sug ? 'selected' : ''}`}
                          onClick={() => handleSelectSuggestion(sug)}
                        />
                      );
                    }
                    return (
                      <div
                        key={sug}
                        className={`suggestion ${selectedSuggestion === sug ? 'selected' : ''}`}
                        onClick={() => handleSelectSuggestion(sug)}
                      >
                        {sug}
                      </div>
                    );
                  })
                )}
                {item.type === 'image' && (
                  <img
                    src={item.content}
                    alt="Inserted image"
                    className="message image-message"
                  />
                )}
                {item.type === 'customize' && (
                  <div className="message">
                    {item.content}
                  </div>
                )}
                {item.type === 'question' && (
                  <div className="message-container ai">
                    <div className="customQuestion">
                      <div className="question-counter message">
                        Q{item.questionIndex}/{item.totalQuestions}
                      </div>
                      <div className="message">{item.content}</div>
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
            {/* {questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
              <div className="message-container ai">
                <div className="question-counter">
                  Q{currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="message">{questions[currentQuestionIndex].text}</div>
                {questions[currentQuestionIndex].options ? (
                  questions[currentQuestionIndex].options.map((option) => (
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
            )} */}

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
                placeholder={questions.length > 0 && currentQuestionIndex >= 0 && !questions[currentQuestionIndex].options ? 'Type your answer...' : 'Type your message...'}
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

        {/* Resizers and indicators moved here, inside .copilot-panel */}
        {!isFullScreen && (
          <>
            {isDocked ? (
              <div className="resize-indicator left-indicator" title="Resize"></div>
            ) : (
              <div className="resize-indicator bottom-right-indicator" title="Resize"></div>
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