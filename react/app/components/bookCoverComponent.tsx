import React, { useState, useRef, useEffect } from "react";
import { getCrossOriginAttribute } from "util/corsHelpers";

import "./bookCoverComponentStyles.css";
import { SuspenseImg } from "./suspenseImage";

export const NoCoverMobile = () => (
  <div className="no-cover-mobile">
    <div>No Cover</div>
  </div>
);

export const NoCoverSmall = () => (
  <div className="no-cover-small">
    <div>No Cover</div>
  </div>
);

export const NoCoverMedium = () => (
  <div className="no-cover-medium">
    <div>No Cover</div>
  </div>
);

const Cover = ({ url, NoCoverComponent, preview = "", dontSuspend = false }) => {
  const initialUrl = useRef(url || "");
  const urlChanged = url !== initialUrl.current;
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  useEffect(() => {
    // make sure the image src is added after the onload handler
    if (imgRef.current) {
      imgRef.current.src = url;
    }
  }, [url, imgRef, preview]);

  if (!url) {
    return <NoCoverComponent />;
  }

  if (preview) {
    return (
      <>
        <img key="book-preview" alt="Book cover preview" src={preview} style={{ display: !loaded ? "block" : "none" }} />
        <img
          key={`book-preview-real-${url}`}
          alt="Book cover"
          {...getCrossOriginAttribute(url)}
          ref={imgRef}
          onLoad={() => setLoaded(true)}
          style={{ display: loaded ? "block" : "none" }}
        />
      </>
    );
  } else {
    return urlChanged || dontSuspend ? (
      <img key="book-real" alt="Book cover" {...getCrossOriginAttribute(url)} style={{ display: "block" }} src={url} />
    ) : (
      <SuspenseImg alt="Book cover" {...getCrossOriginAttribute(url)} style={{ display: "block" }} src={url} />
    );
  }
};

export const CoverMobile = ({ url, preview = "", dontSuspend = false }) => (
  <Cover url={url} preview={preview} NoCoverComponent={NoCoverMobile} dontSuspend={dontSuspend} />
);

export const CoverSmall = ({ url, preview = "", dontSuspend = false }) => (
  <Cover url={url} preview={preview} NoCoverComponent={NoCoverSmall} dontSuspend={dontSuspend} />
);

export const CoverMedium = ({ url, preview = "", dontSuspend = false }) => (
  <Cover url={url} preview={preview} NoCoverComponent={NoCoverMedium} dontSuspend={dontSuspend} />
);
