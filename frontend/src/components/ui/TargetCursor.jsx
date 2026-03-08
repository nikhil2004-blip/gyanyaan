import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const TargetCursor = ({
    targetSelector = '.cursor-target',
    spinDuration = 2,
    hideDefaultCursor = true,
    hoverDuration = 0.2,
    parallaxOn = true // Currently unused inside rewritten absolute tracking, but left for compability
}) => {
    const cursorRef = useRef(null);
    const cornersRef = useRef(null);
    const spinTl = useRef(null);
    const dotRef = useRef(null);

    const activeStrengthRef = useRef({ current: 0 });

    const isMobile = useMemo(() => {
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
        return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
    }, []);

    const constants = useMemo(
        () => ({
            borderWidth: 3,
            cornerSize: 12
        }),
        []
    );

    const moveCursor = useCallback((x, y) => {
        if (!cursorRef.current) return;
        gsap.to(cursorRef.current, {
            x,
            y,
            duration: 0.1,
            ease: 'power3.out',
            overwrite: 'auto'
        });
    }, []);

    useEffect(() => {
        if (isMobile || !cursorRef.current) return;

        const originalCursor = document.body.style.cursor;
        if (hideDefaultCursor) {
            document.body.style.cursor = 'none';
            const style = document.createElement('style');
            style.id = 'target-cursor-global-style';
            style.innerHTML = `* { cursor: none !important; }`;
            document.head.appendChild(style);
        }

        const cursor = cursorRef.current;
        cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

        let activeTarget = null;
        let currentLeaveHandler = null;
        let resumeTimeout = null;

        const { cornerSize, borderWidth } = constants;
        const defaultPositions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
        ];

        // initialize positions
        const corners = Array.from(cornersRef.current);
        corners.forEach((corner, i) => {
            gsap.set(corner, { x: defaultPositions[i].x, y: defaultPositions[i].y });
        });

        gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });

        const createSpinTimeline = () => {
            if (spinTl.current) spinTl.current.kill();
            spinTl.current = gsap
                .timeline({ repeat: -1 })
                .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
        };
        createSpinTimeline();

        const tickerFn = () => {
            if (!cornersRef.current || !cursorRef.current) return;
            const strength = activeStrengthRef.current.current;

            // If we aren't tracking any object just freeze relative positioning 
            if (strength === 0 || !activeTarget) return;

            // If the element has been unmounted from the DOM (e.g. React router changed page)
            if (!activeTarget.isConnected) {
                if (currentLeaveHandler) currentLeaveHandler();
                return;
            }

            const cursorX = gsap.getProperty(cursorRef.current, 'x');
            const cursorY = gsap.getProperty(cursorRef.current, 'y');

            // Live computation of bounding box so scrolling/animations perfectly track live HTML positions!
            const rect = activeTarget.getBoundingClientRect();
            // Use an exactly calculated inset margin of 4px to hug the button borders
            const pad = 4;
            const targetCorners = [
                { x: rect.left - pad, y: rect.top - pad },
                { x: rect.right + pad - cornerSize, y: rect.top - pad },
                { x: rect.right + pad - cornerSize, y: rect.bottom + pad - cornerSize },
                { x: rect.left - pad, y: rect.bottom + pad - cornerSize }
            ];

            const elements = Array.from(cornersRef.current);
            elements.forEach((corner, i) => {
                const defX = defaultPositions[i].x;
                const defY = defaultPositions[i].y;

                // Snapped position coordinates relative to centered cursor wrapper (since children inherit transform)
                const snapX = targetCorners[i].x - cursorX;
                const snapY = targetCorners[i].y - cursorY;

                let finalX = defX + (snapX - defX) * strength;
                let finalY = defY + (snapY - defY) * strength;

                gsap.set(corner, { x: finalX, y: finalY });
            });
        };

        gsap.ticker.add(tickerFn);

        const moveHandler = e => moveCursor(e.clientX, e.clientY);
        window.addEventListener('mousemove', moveHandler);

        const scrollHandler = () => {
            if (!activeTarget || !cursorRef.current) return;
            const mouseX = gsap.getProperty(cursorRef.current, 'x');
            const mouseY = gsap.getProperty(cursorRef.current, 'y');
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);

            if (!elementUnderMouse) return; // ignore out of window

            const isStillOverTarget = (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);

            if (!isStillOverTarget) {
                if (currentLeaveHandler) currentLeaveHandler();
            }
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });

        const mouseDownHandler = () => {
            if (!dotRef.current) return;
            gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
            gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
        };

        const mouseUpHandler = () => {
            if (!dotRef.current) return;
            gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
            gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
        };

        window.addEventListener('mousedown', mouseDownHandler);
        window.addEventListener('mouseup', mouseUpHandler);

        const enterHandler = e => {
            const directTarget = e.target;
            const allTargets = [];
            let current = directTarget;
            while (current && current !== document.body) {
                if (current.matches && current.matches(targetSelector)) {
                    allTargets.push(current);
                }
                current = current.parentElement;
            }

            const target = allTargets[0] || null;
            if (!target || !cursorRef.current || !cornersRef.current) return;
            if (activeTarget === target) return;

            if (activeTarget) {
                if (currentLeaveHandler) currentLeaveHandler();
            }

            if (resumeTimeout) {
                clearTimeout(resumeTimeout);
                resumeTimeout = null;
            }

            activeTarget = target;

            const elements = Array.from(cornersRef.current);
            elements.forEach(corner => gsap.killTweensOf(corner));
            gsap.killTweensOf(activeStrengthRef.current);

            gsap.killTweensOf(cursorRef.current, 'rotation');
            spinTl.current?.pause();
            gsap.set(cursorRef.current, { rotation: 0 });

            gsap.to(activeStrengthRef.current, {
                current: 1,
                duration: hoverDuration,
                ease: 'power2.out'
            });

            const leaveHandler = () => {
                gsap.killTweensOf(activeStrengthRef.current);
                activeStrengthRef.current.current = 0;
                activeTarget = null;
                currentLeaveHandler = null;
                target.removeEventListener('mouseleave', leaveHandler);

                if (cornersRef.current) {
                    const els = Array.from(cornersRef.current);
                    gsap.killTweensOf(els);
                    const tl = gsap.timeline();
                    els.forEach((corner, index) => {
                        tl.to(
                            corner,
                            { x: defaultPositions[index].x, y: defaultPositions[index].y, duration: 0.3, ease: 'power3.out' },
                            0
                        );
                    });
                }

                resumeTimeout = setTimeout(() => {
                    if (!activeTarget && cursorRef.current && spinTl.current) {
                        const currentRotation = gsap.getProperty(cursorRef.current, 'rotation');
                        const normalizedRotation = currentRotation % 360;
                        spinTl.current.kill();
                        spinTl.current = gsap
                            .timeline({ repeat: -1 })
                            .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
                        gsap.to(cursorRef.current, {
                            rotation: normalizedRotation + 360,
                            duration: spinDuration * (1 - normalizedRotation / 360),
                            ease: 'none',
                            onComplete: () => spinTl.current?.restart()
                        });
                    }
                    resumeTimeout = null;
                }, 50);
            };

            currentLeaveHandler = leaveHandler;
            target.addEventListener('mouseleave', leaveHandler);
        };

        window.addEventListener('mouseover', enterHandler, { passive: true });

        return () => {
            gsap.ticker.remove(tickerFn);
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseover', enterHandler);
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('mousedown', mouseDownHandler);
            window.removeEventListener('mouseup', mouseUpHandler);

            if (activeTarget && currentLeaveHandler) {
                currentLeaveHandler();
            }
            spinTl.current?.kill();

            if (hideDefaultCursor) {
                document.body.style.cursor = originalCursor;
                const styleEl = document.getElementById('target-cursor-global-style');
                if (styleEl) styleEl.remove();
            }
        };
    }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration]);

    useEffect(() => {
        if (isMobile || !cursorRef.current || !spinTl.current) return;
        if (spinTl.current.isActive()) {
            spinTl.current.kill();
            spinTl.current = gsap
                .timeline({ repeat: -1 })
                .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
        }
    }, [spinDuration, isMobile]);

    if (isMobile) return null;

    return (
        <div ref={cursorRef} className="target-cursor-wrapper">
            <div ref={dotRef} className="target-cursor-dot" />
            <div className="target-cursor-corner corner-tl" />
            <div className="target-cursor-corner corner-tr" />
            <div className="target-cursor-corner corner-br" />
            <div className="target-cursor-corner corner-bl" />
        </div>
    );
};

export default TargetCursor;
