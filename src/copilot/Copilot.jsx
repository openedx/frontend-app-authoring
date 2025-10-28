import { useRef, useEffect } from 'react';
import { Button, Icon, Form } from '@openedx/paragon';
import { ChevronLeft, ChevronRight, Close, ArrowForward, Fullscreen, FullscreenExit, Send } from '@openedx/paragon/icons';
import { useCopilot } from './CopilotContext';
import './copilot.scss';

const isValidImageUrl = (url) => {
  return typeof url === 'string' && url.match(/\.(jpeg|jpg|png|gif)(?=\?|$)/i);
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
  } = useCopilot();

  const ref = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

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

  // return (
  //   <div className={`copilot-wrapper ${isDocked ? 'docked' : 'inline'}`}>
  //     <div ref={ref} style={panelStyle} className={`copilot-panel ${isFullScreen ? 'fullscreen' : ''} ${(isDocked && !isFullScreen) ? 'isDocked' : ''}`}>
  //       <div className="copilot-header">
  //         <div className="header-left" style={{ display: isMinimized && !isFullScreen ? 'none' : 'flex' }}>
  //           <span className="title">Copilot</span>
  //         </div>
  //         <div className="header-mid" onMouseDown={handleMouseDownDrag(ref)}></div>
  //         <div className="header-right">
  //           {isDocked && !isFullScreen && (
  //             <Button variant="tertiary" size="sm" onClick={toggleMinimize} className="minimize-icon">
  //               <Icon src={isMinimized ? ChevronLeft : ChevronRight} />
  //             </Button>
  //           )}
  //           {!isMinimized && !isFullScreen && !isFloating && (
  //             <div className="drag-handle" onClick={handleFloating}>
  //               <div className="dots">
  //                 <span /><span /><span />
  //                 <span /><span /><span />
  //               </div>
  //             </div>
  //           )}
  //           {!isMinimized && (
  //             <Button variant="tertiary" size="sm" onClick={toggleFullScreen}>
  //               <Icon src={isFullScreen ? FullscreenExit : Fullscreen} />
  //             </Button>
  //           )}
  //           {!isMinimized && !isDocked && !isFullScreen && (
  //             <Button
  //               variant="tertiary"
  //               size="sm"
  //               onClick={() => {
  //                 dock();
  //               }}
  //             >
  //               <Icon src={ArrowForward} />
  //             </Button>
  //           )}
  //           {!isMinimized && (
  //             <Button variant="tertiary" size="sm" onClick={closeCopilot}>
  //               <Icon src={Close} />
  //             </Button>
  //           )}
  //         </div>
  //       </div>
  //       <div className="copilot-content" style={contentStyle}>
  //         <div className="chat-messages" >
  //           {chatHistory.map((item, index) => (
  //             <div key={index} className={`message-container ${item.sender}`}>
  //               {item.type === 'text' && (
  //                 <div className="message">{item.content}</div>
  //               )}
  //               {item.type === ('suggestions') && (
  //                 item.content.map((sug) => {
  //                   const isImageSuggestion = isValidImageUrl(sug);
  //                   if (isImageSuggestion) {
  //                     return (
  //                       <img
  //                         key={sug}
  //                         src={sug}
  //                         alt="Suggested image"
  //                         className={`suggestion image-suggestion ${selectedSuggestion === sug ? 'selected' : ''}`}
  //                         onClick={() => handleSelectSuggestion(sug)}
  //                       />
  //                     );
  //                   }
  //                   return (
  //                     <div
  //                       key={sug}
  //                       className={`suggestion ${selectedSuggestion === sug ? 'selected' : ''}`}
  //                       onClick={() => handleSelectSuggestion(sug)}
  //                     >
  //                       {sug}
  //                     </div>
  //                   );
  //                 })
  //               )}
  //               {item.type === 'image' && (
  //                 <img
  //                   src={item.content}
  //                   alt="Inserted image"
  //                   className="message image-message"
  //                 />
  //               )}
  //               {item.type === 'customize' && (
  //                 <div className="message">
  //                   {item.content}
  //                 </div>
  //               )}
  //             </div>
  //           ))}
  //         </div>
  //         <div className="copilot-content-bottom">
  //           <div className="copilot-content-bottom-button" >
  //             {buttons.map((button) => (
  //               <Button
  //                 key={button.id}
  //                 variant={button.status === 'active' ? 'primary' : 'outline-primary'}
  //                 onClick={() => handleButtonAction(button.id)}
  //                 size="sm"
  //               >
  //                 {button.label}
  //               </Button>
  //             ))}
  //           </div>
  //           <div className="input-container" >
  //             <Form.Control
  //               type="text"
  //               value={prompt}
  //               onChange={(e) => setPrompt(e.target.value)}
  //               placeholder="Type your message..."
  //               onKeyPress={(e) => e.key === 'Enter' && sendPrompt()}
  //             />
  //             <Button variant="primary" size="sm" onClick={sendPrompt}>
  //               <Icon src={Send} />
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     {/* {!isFullScreen && (
  //       <>
  //         {isDocked ? (
  //           <div className="resize-indicator left-indicator" title="Resize"></div>
  //         ) : (
  //           <div className="resize-indicator bottom-right-indicator" title="Resize"></div>
  //         )}
  //       </>
  //     )}
  //     {!isFullScreen && (
  //       isDocked ? (
  //         <div className="resizer resizer-left" onMouseDown={handleMouseDownResize('width')} />
  //       ) : (
  //         <div className="resizer resizer-bottom-right" onMouseDown={handleMouseDownResize('both')} />
  //       )
  //     )} */}
  //     {/* {!isFullScreen && (
  //       <>
  //         {isDocked ? (
  //           <div
  //             className="resize-indicator left-indicator"
  //             title="Resize"
  //             onMouseDown={(e) => {
  //               console.log('Left resizer clicked'); // Debug log
  //               handleMouseDownResize('width')(e);
  //             }}
  //           ></div>
  //         ) : (
  //           <div
  //             className="resize-indicator bottom-right-indicator"
  //             title="Resize"
  //             onMouseDown={(e) => {
  //               console.log('Bottom-right resizer clicked'); // Debug log
  //               handleMouseDownResize('both')(e);
  //             }}
  //           ></div>
  //         )}
  //       </>
  //     )}
  //     {!isFullScreen && (
  //       isDocked ? (
  //         <div
  //           className="resizer resizer-left"
  //           onMouseDown={(e) => {
  //             console.log('Left resizer mousedown'); // Debug log
  //             handleMouseDownResize('width')(e);
  //           }}
  //         />
  //       ) : (
  //         <div
  //           className="resizer resizer-bottom-right"
  //           onMouseDown={(e) => {
  //             console.log('Bottom-right resizer mousedown'); // Debug log
  //             handleMouseDownResize('both')(e);
  //           }}
  //         />
  //       )
  //     )} */}

  //     {!isFullScreen && (
  //       <>
  //         {isDocked ? (
  //           <div
  //             className="resize-indicator left-indicator"
  //             title="Resize"
  //           // Remove onMouseDown from indicator (redundant; use resizer for interaction)
  //           ></div>
  //         ) : (
  //           <div
  //             className="resize-indicator bottom-right-indicator"
  //             title="Resize"
  //           // Remove onMouseDown from indicator
  //           ></div>
  //         )}
  //       </>
  //     )}
  //     {!isFullScreen && (
  //       isDocked ? (
  //         <div
  //           className="resizer resizer-left"
  //           onMouseDown={(e) => {
  //             // Remove console.log for production
  //             handleMouseDownResize('width')(e);
  //           }}
  //         />
  //       ) : (
  //         <div
  //           className="resizer resizer-bottom-right"
  //           onMouseDown={(e) => {
  //             // Remove console.log for production
  //             handleMouseDownResize('both')(e);
  //           }}
  //         />
  //       )
  //     )}
  //   </div>
  // );
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
                    if (isImageSuggestion) {
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
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && sendPrompt()}
              />
              <Button variant="primary" size="sm" onClick={sendPrompt}>
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