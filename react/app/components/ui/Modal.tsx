import React, { SFC, useRef, useLayoutEffect, useState, useContext, useCallback, createContext, useMemo } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useTransition, animated, config, useSpring } from "react-spring";

import "css/reach-modal-overrides.scss";
import { useHeight } from "app/animationHelpers";

export const StandardModalHeader: SFC<{ onHide: any; caption: any }> = props => {
  let { onHide, caption } = props;
  return (
    <>
      <div className="standard-reach-header">
        <h4 className="modal-title">{caption}</h4>
        <a style={{ marginLeft: "auto" }} className="close" onClick={onHide}>
          <span>&times;</span>
        </a>
      </div>
      <hr />
    </>
  );
};

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

export const ModalSizingContext = createContext(null);

type ModalTypes = { isOpen: boolean; style?: any; onHide: any; headerCaption?: any; className?: string; focusRef?: any };
const Modal: SFC<ModalTypes> = props => {
  let { isOpen, onHide, headerCaption, focusRef = null, style = { maxWidth: "600px" }, children } = props;

  const modalTransition = useTransition(!!isOpen, {
    config: isOpen ? { ...config.stiff } : { duration: 150 },
    from: { opacity: 0, transform: `translate3d(0px, -10px, 0px)` },
    enter: { opacity: 1, transform: `translate3d(0px, 0px, 0px)` },
    leave: { opacity: 0, transform: `translate3d(0px, 10px, 0px)` }
  });

  const animatModalSizing = useRef(true);
  const modalSizingPacket = useMemo(() => {
    return {
      disable() {
        animatModalSizing.current = false;
      },
      enable() {
        animatModalSizing.current = true;
      }
    };
  }, []);

  const [heightOn, setHeightOn] = useState(false);
  const [sizingRef, contentHeight] = useHeight({ on: heightOn });
  const uiReady = useRef(false);

  const activateRef = ref => {
    sizingRef.current = ref;
    if (!heightOn) {
      setHeightOn(true);
    }
  };

  const heightStyles =
    useSpring({
      immediate: !uiReady.current || !animatModalSizing.current,
      config: { ...config.stiff },
      from: { height: 0 },
      to: { height: contentHeight },
      onRest: () => (uiReady.current = true)
    }) || {};

  return (
    <ModalSizingContext.Provider value={modalSizingPacket}>
      {modalTransition(
        (styles, isOpen) =>
          isOpen && (
            <AnimatedDialogOverlay
              allowPinchZoom={true}
              initialFocusRef={focusRef}
              onDismiss={onHide}
              isOpen={isOpen}
              style={{ opacity: styles.opacity }}
            >
              <AnimatedDialogContent
                style={{
                  transform: styles.transform,
                  border: "4px solid hsla(0, 0%, 0%, 0.5)",
                  borderRadius: 10,
                  ...style
                }}
              >
                <animated.div style={{ overflow: "hidden", ...heightStyles }}>
                  <div style={{ padding: "10px" }} ref={activateRef}>
                    {headerCaption ? <StandardModalHeader caption={headerCaption} onHide={onHide} /> : null}
                    {children}
                  </div>
                </animated.div>
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </ModalSizingContext.Provider>
  );
};

export default Modal;
