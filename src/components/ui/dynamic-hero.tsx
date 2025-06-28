import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { GradientBackground } from "@/components/ui/noisy-gradient-backgrounds";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

// Type definitions
interface RgbColor {
    r: number;
    g: number;
    b: number;
}

interface NavItem {
    id: string;
    label: string;
    onClick?: () => void;
    href?: string;
    target?: string;
}

interface HeroSectionProps {
    heading?: string;
    tagline?: string;
    buttonText?: string;
    imageUrl?: string;
    videoUrl?: string;
    navItems?: NavItem[];
}

interface MousePosition {
    x: number | null;
    y: number | null;
}

// Helper to parse 'rgb(r, g, b)' or 'rgba(r, g, b, a)' string to {r, g, b}
const parseRgbColor = (colorString: string): RgbColor | null => {
    if (!colorString) return null;
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
        };
    }
    return null;
};

// A simple SVG Play Icon
const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
);

// Rotating Globe SVG Component
const RotatingGlobe: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg 
        className={`${className} animate-spin-slow`} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: '20s' }}
    >
        {/* Gradient definition for top-to-bottom fade */}
        <defs>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="30%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="70%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
            <mask id="fadeMask">
                <rect width="200" height="200" fill="url(#fadeGradient)" />
            </mask>
        </defs>
        
        {/* Globe container with mask applied */}
        <g mask="url(#fadeMask)">
        {/* Globe base circle */}
        <circle 
            cx="100" 
            cy="100" 
            r="80" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.6"
        />
        
        {/* Latitude lines */}
        <ellipse 
            cx="100" 
            cy="100" 
            rx="80" 
            ry="20" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        <ellipse 
            cx="100" 
            cy="100" 
            rx="80" 
            ry="40" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        <ellipse 
            cx="100" 
            cy="100" 
            rx="80" 
            ry="60" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        
        {/* Longitude lines */}
        <ellipse 
            cx="100" 
            cy="100" 
            rx="20" 
            ry="80" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        <ellipse 
            cx="100" 
            cy="100" 
            rx="40" 
            ry="80" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        <ellipse 
            cx="100" 
            cy="100" 
            rx="60" 
            ry="80" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
        />
        
        {/* Vertical center line */}
        <line 
            x1="100" 
            y1="20" 
            x2="100" 
            y2="180" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            opacity="0.5"
        />
        
        {/* Horizontal center line */}
        <line 
            x1="20" 
            y1="100" 
            x2="180" 
            y2="100" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            opacity="0.5"
        />
        
        {/* Continent-like shapes */}
        <path 
            d="M60 80 Q80 70 100 80 Q120 85 140 75 Q130 95 120 100 Q100 105 80 95 Q70 90 60 80" 
            fill="currentColor" 
            opacity="0.3"
        />
        <path 
            d="M70 120 Q90 115 110 125 Q125 130 130 140 Q115 145 100 140 Q85 135 70 120" 
            fill="currentColor" 
            opacity="0.3"
        />
        <path 
            d="M40 60 Q55 55 70 65 Q65 75 50 70 Q45 65 40 60" 
            fill="currentColor" 
            opacity="0.3"
        />
        </g>
    </svg>
);

const defaultNavItems: NavItem[] = [
    { id: 'home', label: 'Home', onClick: () => console.info('Default Home clicked') },
    { id: 'about', label: 'About', href: '#about-section' },
    { id: 'pricing', label: 'Pricing', onClick: () => console.info('Default Pricing clicked') },
    { id: 'get-started-nav', label: 'Get Started', onClick: () => console.info('Default Nav Get Started clicked') },
];

const HeroSection: React.FC<HeroSectionProps> = ({
    heading = "Something you really want",
    tagline = "You can't live without this product. I'm sure of it.",
    buttonText = "Get Started",
    imageUrl,
    videoUrl,
    navItems = defaultNavItems,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetRef = useRef<HTMLButtonElement>(null);
    const mousePosRef = useRef<MousePosition>({ x: null, y: null });
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showVideo, setShowVideo] = useState(false);

    const resolvedCanvasColorsRef = useRef<{ strokeStyle: RgbColor }>({
        strokeStyle: { r: 128, g: 128, b: 128 }, // Default mid-gray
    });

    useEffect(() => {
        const tempElement = document.createElement('div');
        tempElement.style.display = 'none';
        document.body.appendChild(tempElement);

        const updateResolvedColors = () => {
            tempElement.style.color = 'var(--foreground)';
            const computedFgColor = getComputedStyle(tempElement).color;
            const parsedFgColor = parseRgbColor(computedFgColor);
            if (parsedFgColor) {
                resolvedCanvasColorsRef.current.strokeStyle = parsedFgColor;
            } else {
                console.warn("HeroSection: Could not parse --foreground for canvas arrow. Using fallback.");
                const isDarkMode = document.documentElement.classList.contains('dark');
                resolvedCanvasColorsRef.current.strokeStyle = isDarkMode ? { r: 250, g: 250, b: 250 } : { r: 10, g: 10, b: 10 }; // Brighter fallback
            }
        };
        updateResolvedColors();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
                    updateResolvedColors();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => {
            observer.disconnect();
            if (tempElement.parentNode) {
                tempElement.parentNode.removeChild(tempElement);
            }
        };
    }, []);

    const drawArrow = useCallback(() => {
        if (!canvasRef.current || !targetRef.current || !ctxRef.current) return;

        const targetEl = targetRef.current;
        const ctx = ctxRef.current;
        const mouse = mousePosRef.current;

        const x0 = mouse.x;
        const y0 = mouse.y;

        if (x0 === null || y0 === null) return;

        const rect = targetEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const a = Math.atan2(cy - y0, cx - x0);
        const x1 = cx - Math.cos(a) * (rect.width / 2 + 12);
        const y1 = cy - Math.sin(a) * (rect.height / 2 + 12);

        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5);
        const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
        const controlX = midX;
        const controlY = midY + offset * t;
        
        const r = Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
        // Increase max opacity to 1 (fully opaque) and adjust divisor for quicker ramp-up
        const opacity = Math.min(1.0, (r - Math.max(rect.width, rect.height) / 2) / 500); 

        const arrowColor = resolvedCanvasColorsRef.current.strokeStyle;
        ctx.strokeStyle = `rgba(${arrowColor.r}, ${arrowColor.g}, ${arrowColor.b}, ${opacity})`;
        // Increase line width for more visibility
        ctx.lineWidth = 2; // Changed from 1.5 to 2

        // Draw curve
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(controlX, controlY, x1, y1);
        // Adjust dash pattern for thicker line: longer dashes, similar gap
        ctx.setLineDash([10, 5]); // e.g., 10px dash, 5px gap
        ctx.stroke();
        ctx.restore();

        // Draw arrowhead
        const angle = Math.atan2(y1 - controlY, x1 - controlX);
        // Scale arrowhead with line width, base size 10 for lineWidth 1.5
        const headLength = 10 * (ctx.lineWidth / 1.5); 
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle - Math.PI / 6),
            y1 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle + Math.PI / 6),
            y1 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !targetRef.current) return;

        ctxRef.current = canvas.getContext("2d");
        const ctx = ctxRef.current;

        const updateCanvasSize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", updateCanvasSize);
        window.addEventListener("mousemove", handleMouseMove);
        updateCanvasSize();

        const animateLoop = () => {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawArrow();
            }
            animationFrameIdRef.current = requestAnimationFrame(animateLoop);
        };
        
        animateLoop();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [drawArrow]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && videoUrl) {
            const handleVideoEnd = () => {
                setShowVideo(false);
                videoElement.currentTime = 0;
            };

            if (showVideo) {
                videoElement.play().catch(error => {
                    console.error("HeroSection: Error playing video:", error);
                    setShowVideo(false);
                });
                videoElement.addEventListener('ended', handleVideoEnd);
            } else {
                videoElement.pause();
            }

            return () => {
                videoElement.removeEventListener('ended', handleVideoEnd);
            };
        }
    }, [showVideo, videoUrl]);

    const handlePlayButtonClick = () => {
        if (videoUrl) {
            setShowVideo(true);
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col relative overflow-hidden">
            {/* Noisy Gradient Background */}
            <GradientBackground
                gradientOrigin="bottom-middle"
                gradientSize="150% 150%"
                colors={[
                    { color: 'rgba(245,87,2,1)', stop: '10.5%' },
                    { color: 'rgba(245,120,2,1)', stop: '16%' },
                    { color: 'rgba(245,140,2,1)', stop: '17.5%' },
                    { color: 'rgba(245,170,100,1)', stop: '25%' },
                    { color: 'rgba(238,174,202,1)', stop: '40%' },
                    { color: 'rgba(202,179,214,1)', stop: '65%' },
                    { color: 'rgba(148,201,233,1)', stop: '100%' }
                ]}
                noiseIntensity={0.8}
                noisePatternSize={120}
                noisePatternRefreshInterval={2}
                noisePatternAlpha={40}
                className="z-[0]"
            />
            
            {/* Navigation removed - using external Header component */}

            <main className="flex-grow flex flex-col items-center justify-center relative z-10 pt-16">
                <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col items-center">
                    <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-center px-4">
                        {heading && heading.includes('GoRoam') ? (
                            <div className="flex flex-wrap justify-center items-center gap-2">
                                <span className="text-white">{heading.split('GoRoam')[0]}</span>
                                <AnimatedText 
                                    text="GoRoam"
                                    textClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-orange-500/90 dark:text-orange-400"
                                    underlineClassName="text-orange-400 dark:text-orange-400"
                                    underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
                                    underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
                                    underlineDuration={2}
                                    className="inline-block"
                                />
                                <span className="text-white">{heading.split('GoRoam')[1]}</span>
                            </div>
                        ) : (
                            <h1 className="text-5xl sm:text-5xl lg:text-6xl xl:text-9xl font-bold text-center px-4 text-white">
                                {heading}
                            </h1>
                        )}
                    </div>
                    <p className="mt-6 block text-white text-center text-lg sm:text-xl lg:text-2xl px-4 max-w-2xl">
                        {tagline}
                    </p>
                </div>

                <div className="mt-10 flex justify-center">
                    <MovingBorderButton
                        ref={targetRef}
                        borderRadius="1.75rem"
                        className="bg-black/20 text-white border-white/10 text-lg font-medium"
                        containerClassName="h-14 w-48"
                        duration={3000}
                    >
                        {buttonText}
                    </MovingBorderButton>
                </div>

                <div className="mt-12 lg:mt-16 w-full max-w-screen-sm mx-auto overflow-visible px-4 sm:px-2 relative">
                    {/* Rotating Globe Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible -translate-y-16 sm:-translate-y-20 md:-translate-y-24 lg:-translate-y-28">
                        <RotatingGlobe className="w-[32rem] h-[32rem] sm:w-[40rem] sm:h-[40rem] md:w-[48rem] md:h-[48rem] lg:w-[56rem] lg:h-[56rem] xl:w-[64rem] xl:h-[64rem] 2xl:w-[72rem] 2xl:h-[72rem] text-white/60" />
                    </div>
                    
                    <div className="bg-border rounded-[2rem] p-[0.25rem] relative z-10">
                        <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-[1.75rem] bg-card flex items-center justify-center overflow-hidden">
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                                        showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
                                    }`}
                                />
                            )}
                            {videoUrl && (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    muted
                                    playsInline
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                                />
                            )}
                            {!showVideo && videoUrl && imageUrl && (
                                <button
                                    onClick={handlePlayButtonClick}
                                    className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 p-2 sm:p-3 bg-accent/30 hover:bg-accent/50 text-accent-foreground backdrop-blur-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                    aria-label="Play video"
                                >
                                    <PlayIcon className="w-4 h-4 sm:w-5 sm:h-6" />
                                </button>
                            )}
                            {!imageUrl && !videoUrl && (
                                <div className="text-muted-foreground italic">Card Content Area</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <div className="h-12 sm:h-16 md:h-24"></div>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10"></canvas>
        </div>
    );
};

export { HeroSection }; 