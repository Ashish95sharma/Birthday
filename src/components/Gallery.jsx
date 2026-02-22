import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import "./Gallery.css";

function Gallery({ isActive }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photosRevealed, setPhotosRevealed] = useState(false);

  const photosRef = useRef([]);
  const lightboxImgRef = useRef(null);

  const photos = [
    { src: "/images/memory1.png", alt: "Memory 1" },
    { src: "/images/memory2.jpg", alt: "Memory 2" },
    { src: "/images/memory3.jpg", alt: "Memory 3" },
    { src: "/images/memory4.jpg", alt: "Memory 4" },
  ];

  // Rotation per image: 0 = -90°, 1 = +90°, 2 = -90°, 3 = 0°
  const photoRotations = [-90, 90, -90, 0];

  // Reveal photos with GSAP when page becomes active
  useEffect(() => {
    if (isActive && !photosRevealed) {
      setTimeout(() => setPhotosRevealed(true), 10);

      const els = photosRef.current;
      els.forEach((el, i) => {
        if (!el) return;
        const rotation = photoRotations[i] ?? 0;
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, scale: 0.8, rotation },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation,
            duration: 0.6,
            ease: "back.out(1.4)",
            delay: 0.2 + i * 0.12,
          }
        );
      });
    }
  }, [isActive, photosRevealed]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);

    // Animate lightbox appearance
    if (lightboxImgRef.current) {
      gsap.fromTo(
        lightboxImgRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }
      );
    }
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Handle body overflow in effect
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const showNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % photos.length;

    // Animate transition
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          gsap.fromTo(
            lightboxImgRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    }
  }, [currentIndex, photos.length]);

  const showPrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + photos.length) % photos.length;

    // Animate transition
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          gsap.fromTo(
            lightboxImgRef.current,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    }
  }, [currentIndex, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      } else if (e.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, showNext, showPrev, closeLightbox]);

  return (
    <section className="gallery">
      <h2> Some best Glimpse of You</h2>
      <div className="photos">
        {photos.map((photo, index) => (
          <img
            key={index}
            ref={(el) => (photosRef.current[index] = el)}
            className={
              photoRotations[index] === -90
                ? "photo-rotate-left"
                : photoRotations[index] === 90
                  ? "photo-rotate-right"
                  : ""
            }
            src={photo.src}
            alt={photo.alt}
            onClick={() => openLightbox(index)}
            loading="lazy"
          />
        ))}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <img
            ref={lightboxImgRef}
            className={
              photoRotations[currentIndex] === -90
                ? "photo-rotate-left"
                : photoRotations[currentIndex] === 90
                  ? "photo-rotate-right"
                  : ""
            }
            src={photos[currentIndex].src}
            alt={photos[currentIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✖
          </button>
        </div>
      )}
    </section>
  );
}

export default Gallery;
