import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faExpand } from "@fortawesome/free-solid-svg-icons";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

// Material Design 3 Carousel variants following MD3 specifications
const carouselVariants = cva(
    "relative w-full",
    {
        variants: {
            layout: {
                "multi-browse": "px-4", // 16dp padding on sides
                "uncontained": "px-4", // 16dp padding on sides  
                "hero": "px-4", // 16dp padding on sides
                "center-aligned-hero": "px-4", // 16dp padding on sides
                "full-screen": "px-0", // No padding, edge-to-edge
            },
            scrollBehavior: {
                default: "", // Standard scrolling
                snap: "", // Snap-scrolling (handled by Embla options)
            },
        },
        defaultVariants: {
            layout: "uncontained",
            scrollBehavior: "default",
        },
    }
);

// Material Design 3 Carousel Item variants
const carouselItemVariants = cva(
    "min-w-0 shrink-0 grow-0 relative",
    {
        variants: {
            layout: {
                "multi-browse": "",
                "uncontained": "basis-full pl-2 pr-2 first:pl-0 last:pr-0", // 8dp gap between items
                "hero": "",
                "center-aligned-hero": "",
                "full-screen": "basis-full",
            },
            size: {
                large: "",
                medium: "",
                small: "basis-[40px] min-w-[40px] max-w-[56px]", // 40-56dp as per MD3 specs
            },
            reducedMotion: {
                true: "",
                false: "",
            },
        },
        compoundVariants: [
            // Multi-browse layout sizes
            {
                layout: "multi-browse",
                size: "large",
                class: "basis-auto flex-1 max-w-[300px]", // Customizable max width
            },
            {
                layout: "multi-browse",
                size: "medium",
                class: "basis-auto flex-1",
            },
            {
                layout: "multi-browse",
                size: "small",
                class: "basis-[40px] min-w-[40px] max-w-[56px]",
            },
            // Hero layout sizes
            {
                layout: "hero",
                size: "large",
                class: "basis-auto flex-1 max-w-[300px]",
            },
            {
                layout: "hero",
                size: "small",
                class: "basis-[40px] min-w-[40px] max-w-[56px]",
            },
            // Center-aligned hero
            {
                layout: "center-aligned-hero",
                size: "large",
                class: "basis-auto flex-1 max-w-[300px]",
            },
            {
                layout: "center-aligned-hero",
                size: "small",
                class: "basis-[40px] min-w-[40px] max-w-[56px]",
            },
            // Reduced motion adjustments
            {
                reducedMotion: true,
                class: "transition-none", // Remove parallax effects
            },
        ],
        defaultVariants: {
            layout: "uncontained",
            size: "large",
            reducedMotion: false,
        },
    }
);

type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: "horizontal" | "vertical";
    setApi?: (api: CarouselApi) => void;
    showAllButton?: boolean;
    onShowAll?: () => void;
    header?: string;
} & VariantProps<typeof carouselVariants>;

type CarouselContextProps = {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0];
    api: ReturnType<typeof useEmblaCarousel>[1];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    currentIndex: number;
    totalItems: number;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
    const context = React.useContext(CarouselContext);

    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }

    return context;
}

const Carousel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
    (
        {
            orientation = "horizontal",
            opts,
            setApi,
            plugins,
            className,
            children,
            layout = "uncontained",
            scrollBehavior = "default",
            showAllButton = false,
            onShowAll,
            header,
            ...props
        },
        ref
    ) => {
        const [carouselRef, api] = useEmblaCarousel(
            {
                ...opts,
                axis: orientation === "horizontal" ? "x" : "y",
                // Enable snap scrolling for certain layouts as per MD3 specs
                align: layout === "center-aligned-hero" ? "center" : "start",
                containScroll: layout === "full-screen" ? "trimSnaps" : "trimSnaps",
            },
            plugins
        );
        const [canScrollPrev, setCanScrollPrev] = React.useState(false);
        const [canScrollNext, setCanScrollNext] = React.useState(false);
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [totalItems, setTotalItems] = React.useState(0);

        // Check for reduced motion preference
        const [reducedMotion, setReducedMotion] = React.useState(false);

        React.useEffect(() => {
            const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            setReducedMotion(mediaQuery.matches);

            const handleChange = (e: MediaQueryListEvent) => {
                setReducedMotion(e.matches);
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }, []);

        const onSelect = React.useCallback((api: CarouselApi) => {
            if (!api) {
                return;
            }

            setCanScrollPrev(api.canScrollPrev());
            setCanScrollNext(api.canScrollNext());
            setCurrentIndex(api.selectedScrollSnap());
            setTotalItems(api.scrollSnapList().length);
        }, []);

        const scrollPrev = React.useCallback(() => {
            api?.scrollPrev();
        }, [api]);

        const scrollNext = React.useCallback(() => {
            api?.scrollNext();
        }, [api]);

        const handleKeyDown = React.useCallback(
            (event: React.KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    scrollPrev();
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    scrollNext();
                } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    // Allow vertical navigation to leave carousel
                    event.stopPropagation();
                }
            },
            [scrollPrev, scrollNext]
        );

        React.useEffect(() => {
            if (!api || !setApi) {
                return;
            }

            setApi(api);
        }, [api, setApi]);

        React.useEffect(() => {
            if (!api) {
                return;
            }

            onSelect(api);
            api.on("reInit", onSelect);
            api.on("select", onSelect);

            return () => {
                api?.off("select", onSelect);
            };
        }, [api, onSelect]);

        return (
            <CarouselContext.Provider
                value={{
                    carouselRef,
                    api: api,
                    opts,
                    orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
                    scrollPrev,
                    scrollNext,
                    canScrollPrev,
                    canScrollNext,
                    currentIndex,
                    totalItems,
                    layout,
                    scrollBehavior,
                    showAllButton,
                    onShowAll,
                    header,
                }}
            >
                <div className="w-full">
                    {/* Header with Show All button if provided */}
                    {header && (
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-medium text-on-surface">{header}</h2>
                            {showAllButton && onShowAll && (
                                <Button
                                    variant="text"
                                    size="icon"
                                    className="h-12 w-12"
                                    onClick={onShowAll}
                                    aria-label="Ver todos os itens"
                                >
                                    <FontAwesomeIcon icon={faExpand} className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Main Carousel Container */}
                    <div
                        ref={ref}
                        onKeyDownCapture={handleKeyDown}
                        className={cn(carouselVariants({ layout, scrollBehavior }), className)}
                        role="region"
                        aria-roledescription="carousel"
                        aria-label={header || "Carousel"}
                        {...props}
                    >
                        {children}
                    </div>

                    {/* Show All Button (when no header) */}
                    {!header && showAllButton && onShowAll && (
                        <div className="mt-1 flex justify-center">
                            <Button
                                variant="text"
                                onClick={onShowAll}
                                className="text-sm font-medium text-primary"
                            >
                                Ver todos
                            </Button>
                        </div>
                    )}
                </div>
            </CarouselContext.Provider>
        );
    }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { carouselRef, orientation, layout } = useCarousel();

    return (
        <div ref={carouselRef} className="overflow-hidden">
            <div
                ref={ref}
                className={cn(
                    "flex",
                    orientation === "horizontal"
                        ? layout === "uncontained"
                            ? "gap-2" // 8dp gap for uncontained
                            : "gap-2" // 8dp gap for all layouts
                        : "-mt-4 flex-col",
                    layout === "full-screen" && "gap-0", // No gaps for full-screen
                    className
                )}
                {...props}
            />
        </div>
    );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof carouselItemVariants>
>(({ className, layout, size = "large", ...props }, ref) => {
    const {
        orientation,
        layout: contextLayout,
        currentIndex,
        totalItems
    } = useCarousel();

    // Use context layout if not provided as prop
    const itemLayout = layout || contextLayout || "uncontained";

    // Check for reduced motion
    const [reducedMotion, setReducedMotion] = React.useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
    }, []);

    return (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} de ${totalItems}`}
            className={cn(
                carouselItemVariants({
                    layout: itemLayout,
                    size,
                    reducedMotion
                }),
                orientation === "vertical" && "pt-4",
                className
            )}
            {...props}
        />
    );
});
CarouselItem.displayName = "CarouselItem";

// Material Design 3 Carousel Text component
const CarouselText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        title?: string;
        description?: string;
        label?: string;
        adaptive?: boolean;
    }
>(({ className, title, description, label, adaptive = true, ...props }, ref) => {
    const { layout } = useCarousel();

    // In compact windows, limit text to 2 lines for non-simple backgrounds
    const isCompact = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",
                layout === "full-screen" && "p-6",
                className
            )}
            {...props}
        >
            {title && (
                <h3 className={cn(
                    "font-medium text-lg leading-tight mb-1",
                    adaptive && isCompact && "text-base line-clamp-1",
                    layout === "full-screen" && "text-2xl"
                )}>
                    {title}
                </h3>
            )}
            {description && (
                <p className={cn(
                    "text-sm opacity-90 leading-snug",
                    adaptive && isCompact && "line-clamp-1",
                    layout === "full-screen" && "text-base"
                )}>
                    {description}
                </p>
            )}
            {label && (
                <span className={cn(
                    "text-xs font-medium mt-2 inline-block px-2 py-1 bg-white/20 rounded",
                    adaptive && isCompact && "text-xs"
                )}>
                    {label}
                </span>
            )}
        </div>
    );
});
CarouselText.displayName = "CarouselText";

// Carousel Previous Button - not recommended for MD3 but kept for compatibility
const CarouselPrevious = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, variant = "outlined", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                "absolute h-8 w-8 rounded-full z-10 hidden", // Hidden by default as per MD3 guidelines
                orientation === "horizontal"
                    ? "-left-12 top-1/2 -translate-y-1/2"
                    : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
                className
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            aria-label="Item anterior do carousel"
            {...props}
        >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 fill-current" />
            <span className="sr-only">Slide anterior</span>
        </Button>
    );
});
CarouselPrevious.displayName = "CarouselPrevious";

// Carousel Next Button - not recommended for MD3 but kept for compatibility  
const CarouselNext = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, variant = "outlined", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                "absolute h-8 w-8 rounded-full z-10 hidden", // Hidden by default as per MD3 guidelines
                orientation === "horizontal"
                    ? "-right-12 top-1/2 -translate-y-1/2"
                    : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
                className
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
            aria-label="Próximo item do carousel"
            {...props}
        >
            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 fill-current" />
            <span className="sr-only">Próximo slide</span>
        </Button>
    );
});
CarouselNext.displayName = "CarouselNext";

// Carousel Indicator Dots (optional, not in MD3 spec but useful)
const CarouselIndicators = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { api, currentIndex, totalItems } = useCarousel();

    if (!api || totalItems <= 1) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "flex justify-center gap-2 mt-4",
                className
            )}
            role="tablist"
            aria-label="Indicadores do carousel"
            {...props}
        >
            {Array.from({ length: totalItems }).map((_, index) => (
                <button
                    key={index}
                    role="tab"
                    aria-selected={index === currentIndex}
                    aria-label={`Ir para slide ${index + 1}`}
                    className={cn(
                        "h-2 rounded-full transition-all duration-200",
                        index === currentIndex
                            ? "w-6 bg-primary"
                            : "w-2 bg-outline hover:bg-primary/50"
                    )}
                    onClick={() => api.scrollTo(index)}
                />
            ))}
        </div>
    );
});
CarouselIndicators.displayName = "CarouselIndicators";

export {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselText,
    CarouselPrevious,
    CarouselNext,
    CarouselIndicators,
};
