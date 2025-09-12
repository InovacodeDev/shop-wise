"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "./input";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClock, faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

// Material Design 3 Date Picker Context
interface DatePickerContextValue {
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    variant: "docked" | "modal" | "input";
    disabled?: boolean;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

// Material Design 3 Time Picker Context  
interface TimePickerContextValue {
    selectedTime: string;
    setSelectedTime: (time: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    variant: "dial" | "input";
    format24: boolean;
    disabled?: boolean;
}

const TimePickerContext = React.createContext<TimePickerContextValue | null>(null);

// Material Design 3 Date Picker variants
const datePickerVariants = cva(
    "relative",
    {
        variants: {
            variant: {
                docked: "inline-block",
                modal: "inline-block",
                input: "inline-block w-full"
            }
        },
        defaultVariants: {
            variant: "docked"
        }
    }
);

// Material Design 3 Time Picker variants
const timePickerVariants = cva(
    "relative",
    {
        variants: {
            variant: {
                dial: "inline-block",
                input: "inline-block w-full"
            },
            orientation: {
                vertical: "flex-col",
                horizontal: "flex-row"
            }
        },
        defaultVariants: {
            variant: "dial",
            orientation: "vertical"
        }
    }
);

// Date Picker Input Field styled according to Material Design 3
const DatePickerInput = React.forwardRef<
    HTMLInputElement,
    Omit<React.ComponentPropsWithoutRef<typeof Input>, 'value'> & {
        value?: Date;
        placeholder?: string;
        variant?: "filled" | "outlined";
        disabled?: boolean;
    }
>(({ value, placeholder = "Select date", variant = "outlined", disabled, className, ...props }, ref) => {
    const context = React.useContext(DatePickerContext);

    const formatDate = (date: Date | undefined) => {
        if (!date) return "";
        return format(date, "MM/dd/yyyy");
    };

    return (
        <div className="relative">
            <Input
                ref={ref}
                variant={variant}
                value={formatDate(value)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly
                className={`pr-10 ${className}`}
                {...props}
            />
            <FontAwesomeIcon
                icon={faCalendar}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none"
            />
        </div>
    );
});
DatePickerInput.displayName = "DatePickerInput";

// Time Picker Input Field styled according to Material Design 3
const TimePickerInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentPropsWithoutRef<typeof Input> & {
        placeholder?: string;
        variant?: "filled" | "outlined";
        disabled?: boolean;
    }
>(({ value, placeholder = "Select time", variant = "outlined", disabled, className, ...props }, ref) => {
    return (
        <div className="relative">
            <Input
                ref={ref}
                variant={variant}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                readOnly
                className={`pr-10 ${className}`}
                {...props}
            />
            <FontAwesomeIcon
                icon={faClock}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none"
            />
        </div>
    );
});
TimePickerInput.displayName = "TimePickerInput";

// Date Picker Root Component
interface DatePickerProps extends VariantProps<typeof datePickerVariants> {
    children: React.ReactNode;
    value?: Date;
    onValueChange?: (date: Date | undefined) => void;
    disabled?: boolean;
}

const DatePicker = React.forwardRef<
    HTMLDivElement,
    DatePickerProps
>(({ children, value, onValueChange, variant = "docked", disabled = false, ...props }, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (value !== selectedDate) {
            setSelectedDate(value);
        }
    }, [value]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        onValueChange?.(date);
        if (variant === "docked") {
            setIsOpen(false);
        }
    };

    const contextValue: DatePickerContextValue = {
        selectedDate,
        setSelectedDate: handleDateSelect,
        isOpen,
        setIsOpen,
        variant: variant!,
        disabled
    };

    return (
        <DatePickerContext.Provider value={contextValue}>
            <div ref={ref} className={datePickerVariants({ variant })} {...props}>
                {children}
            </div>
        </DatePickerContext.Provider>
    );
});
DatePicker.displayName = "DatePicker";

// Time Picker Root Component
interface TimePickerProps extends VariantProps<typeof timePickerVariants> {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (time: string) => void;
    format24?: boolean;
    disabled?: boolean;
}

const TimePicker = React.forwardRef<
    HTMLDivElement,
    TimePickerProps
>(({ children, value = "", onValueChange, variant = "dial", orientation = "vertical", format24 = false, disabled = false, ...props }, ref) => {
    const [selectedTime, setSelectedTime] = React.useState(value);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (value !== selectedTime) {
            setSelectedTime(value);
        }
    }, [value]);

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        onValueChange?.(time);
        if (variant === "input") {
            setIsOpen(false);
        }
    };

    const contextValue: TimePickerContextValue = {
        selectedTime,
        setSelectedTime: handleTimeSelect,
        isOpen,
        setIsOpen,
        variant: variant!,
        format24,
        disabled
    };

    return (
        <TimePickerContext.Provider value={contextValue}>
            <div ref={ref} className={timePickerVariants({ variant, orientation })} {...props}>
                {children}
            </div>
        </TimePickerContext.Provider>
    );
});
TimePicker.displayName = "TimePicker";

// Docked Date Picker Trigger
const DatePickerTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button> & {
        placeholder?: string;
        variant?: "filled" | "outlined";
    }
>(({ children, placeholder = "Select date", variant = "outlined", className, ...props }, ref) => {
    const context = React.useContext(DatePickerContext);

    if (!context) {
        throw new Error("DatePickerTrigger must be used within DatePicker");
    }

    const { selectedDate, isOpen, setIsOpen, disabled } = context;

    const formatDate = (date: Date | undefined) => {
        if (!date) return placeholder;
        return format(date, "MM/dd/yyyy");
    };

    if (children) {
        return (
            <PopoverTrigger asChild>
                <button
                    ref={ref}
                    type="button"
                    disabled={disabled}
                    className={className}
                    {...props}
                >
                    {children}
                </button>
            </PopoverTrigger>
        );
    }

    return (
        <PopoverTrigger asChild>
            <DatePickerInput
                ref={ref as React.Ref<HTMLInputElement>}
                value={selectedDate}
                placeholder={placeholder}
                variant={variant}
                disabled={disabled}
                className={className}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                {...(props as any)}
            />
        </PopoverTrigger>
    );
});
DatePickerTrigger.displayName = "DatePickerTrigger";

// Modal Date Picker Trigger
const ModalDatePickerTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button> & {
        placeholder?: string;
        variant?: "filled" | "outlined";
    }
>(({ children, placeholder = "Select date", variant = "outlined", className, ...props }, ref) => {
    const context = React.useContext(DatePickerContext);

    if (!context) {
        throw new Error("ModalDatePickerTrigger must be used within DatePicker");
    }

    const { selectedDate, isOpen, setIsOpen, disabled } = context;

    const formatDate = (date: Date | undefined) => {
        if (!date) return placeholder;
        return format(date, "MM/dd/yyyy");
    };

    if (children) {
        return (
            <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={className}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                {...props}
            >
                {children}
            </button>
        );
    }

    return (
        <DatePickerInput
            ref={ref as React.Ref<HTMLInputElement>}
            value={selectedDate}
            placeholder={placeholder}
            variant={variant}
            disabled={disabled}
            className={className}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            {...(props as any)}
        />
    );
});
ModalDatePickerTrigger.displayName = "ModalDatePickerTrigger";

// Time Picker Trigger
const TimePickerTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button> & {
        placeholder?: string;
        variant?: "filled" | "outlined";
    }
>(({ children, placeholder = "Select time", variant = "outlined", className, ...props }, ref) => {
    const context = React.useContext(TimePickerContext);

    if (!context) {
        throw new Error("TimePickerTrigger must be used within TimePicker");
    }

    const { selectedTime, isOpen, setIsOpen, disabled } = context;

    if (children) {
        return (
            <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={className}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                {...props}
            >
                {children}
            </button>
        );
    }

    return (
        <TimePickerInput
            ref={ref as React.Ref<HTMLInputElement>}
            value={selectedTime || placeholder}
            placeholder={placeholder}
            variant={variant}
            disabled={disabled}
            className={className}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            {...(props as any)}
        />
    );
});
TimePickerTrigger.displayName = "TimePickerTrigger";

// Docked Date Picker Content (uses Popover)
const DatePickerContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof PopoverContent> & {
        showTodayButton?: boolean;
        showClearButton?: boolean;
    }
>(({ showTodayButton = true, showClearButton = true, className, ...props }, ref) => {
    const context = React.useContext(DatePickerContext);

    if (!context) {
        throw new Error("DatePickerContent must be used within DatePicker");
    }

    const { selectedDate, setSelectedDate, variant, isOpen, setIsOpen } = context;

    if (variant === "modal") {
        return null; // Modal uses DialogContent instead
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverContent
                ref={ref}
                className={`w-auto p-0 ${className}`}
                align="start"
                {...props}
            >
                <div className="bg-surface-container-high rounded-xl shadow-lg border-0">
                    <div className="p-6 space-y-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className="rounded-xl"
                        />
                        {(showTodayButton || showClearButton) && (
                            <div className="flex justify-between border-t border-outline-variant pt-4">
                                {showClearButton && (
                                    <Button
                                        variant="text"
                                        size="sm"
                                        onClick={() => setSelectedDate(undefined)}
                                    >
                                        Clear
                                    </Button>
                                )}
                                {showTodayButton && (
                                    <Button
                                        variant="text"
                                        size="sm"
                                        onClick={() => setSelectedDate(new Date())}
                                    >
                                        Today
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});
DatePickerContent.displayName = "DatePickerContent";

// Modal Date Picker Content (uses Dialog)
const ModalDatePickerContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & {
        title?: string;
        description?: string;
        showTodayButton?: boolean;
        showClearButton?: boolean;
    }
>(({ title = "Select date", description, showTodayButton = true, showClearButton = true, className, ...props }, ref) => {
    const context = React.useContext(DatePickerContext);

    if (!context) {
        throw new Error("ModalDatePickerContent must be used within DatePicker");
    }

    const { selectedDate, setSelectedDate, isOpen, setIsOpen } = context;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                ref={ref}
                className={`max-w-md ${className}`}
                {...props}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="py-4">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="rounded-xl mx-auto"
                    />
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <div className="flex gap-2">
                        {showClearButton && (
                            <Button
                                variant="text"
                                onClick={() => setSelectedDate(undefined)}
                            >
                                Clear
                            </Button>
                        )}
                        {showTodayButton && (
                            <Button
                                variant="text"
                                onClick={() => setSelectedDate(new Date())}
                            >
                                Today
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="text" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsOpen(false)}>
                            OK
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
ModalDatePickerContent.displayName = "ModalDatePickerContent";

// Time Picker Dial Component
const TimePickerDial = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & {
        title?: string;
    }
>(({ title = "Select time", className, ...props }, ref) => {
    const context = React.useContext(TimePickerContext);

    if (!context) {
        throw new Error("TimePickerDial must be used within TimePicker");
    }

    const { selectedTime, setSelectedTime, isOpen, setIsOpen, format24 } = context;

    // Parse time string
    const parseTime = (timeStr: string) => {
        if (!timeStr) return { hours: 12, minutes: 0, period: 'AM' };

        const [time, period] = timeStr.includes('AM') || timeStr.includes('PM')
            ? timeStr.split(' ')
            : [timeStr, format24 ? '' : 'AM'];

        const [hours, minutes] = time.split(':').map(Number);
        return { hours: hours || 12, minutes: minutes || 0, period: period || 'AM' };
    };

    const { hours, minutes, period } = parseTime(selectedTime);
    const [currentHours, setCurrentHours] = React.useState(hours);
    const [currentMinutes, setCurrentMinutes] = React.useState(minutes);
    const [currentPeriod, setCurrentPeriod] = React.useState(period);
    const [selectingHours, setSelectingHours] = React.useState(true);

    const formatTime = (h: number, m: number, p: string) => {
        if (format24) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
        return `${h}:${m.toString().padStart(2, '0')} ${p}`;
    };

    const handleTimeChange = () => {
        const formattedTime = formatTime(currentHours, currentMinutes, currentPeriod);
        setSelectedTime(formattedTime);
    };

    React.useEffect(() => {
        handleTimeChange();
    }, [currentHours, currentMinutes, currentPeriod]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                ref={ref}
                className={`max-w-sm ${className}`}
                {...props}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Time Display */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-4xl font-light">
                            <button
                                className={`px-4 py-2 rounded-lg transition-colors ${selectingHours
                                    ? 'bg-primary-container text-on-primary-container'
                                    : 'text-on-surface hover:bg-on-surface/8'
                                    }`}
                                onClick={() => setSelectingHours(true)}
                            >
                                {currentHours.toString().padStart(2, '0')}
                            </button>
                            <span className="text-on-surface">:</span>
                            <button
                                className={`px-4 py-2 rounded-lg transition-colors ${!selectingHours
                                    ? 'bg-primary-container text-on-primary-container'
                                    : 'text-on-surface hover:bg-on-surface/8'
                                    }`}
                                onClick={() => setSelectingHours(false)}
                            >
                                {currentMinutes.toString().padStart(2, '0')}
                            </button>
                        </div>
                        {!format24 && (
                            <div className="flex flex-col gap-1">
                                <button
                                    className={`px-3 py-1 rounded text-sm transition-colors ${currentPeriod === 'AM'
                                        ? 'bg-tertiary-container text-on-tertiary-container'
                                        : 'text-on-surface hover:bg-on-surface/8'
                                        }`}
                                    onClick={() => setCurrentPeriod('AM')}
                                >
                                    AM
                                </button>
                                <button
                                    className={`px-3 py-1 rounded text-sm transition-colors ${currentPeriod === 'PM'
                                        ? 'bg-tertiary-container text-on-tertiary-container'
                                        : 'text-on-surface hover:bg-on-surface/8'
                                        }`}
                                    onClick={() => setCurrentPeriod('PM')}
                                >
                                    PM
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Clock Dial */}
                    <div className="relative w-64 h-64 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-surface-container-highest">
                            {/* Hour markers */}
                            {selectingHours && Array.from({ length: format24 ? 24 : 12 }, (_, i) => {
                                const hour = format24 ? i : i + 1;
                                const angle = format24 ? (i * 15) : ((i + 1) * 30);
                                const radius = format24 && i >= 12 ? 80 : 100;
                                const x = Math.sin((angle * Math.PI) / 180) * radius + 128;
                                const y = -Math.cos((angle * Math.PI) / 180) * radius + 128;

                                return (
                                    <button
                                        key={hour}
                                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors transform -translate-x-1/2 -translate-y-1/2 ${currentHours === hour
                                            ? 'bg-primary text-on-primary'
                                            : 'hover:bg-on-surface/8 text-on-surface'
                                            }`}
                                        style={{ left: x, top: y }}
                                        onClick={() => setCurrentHours(hour)}
                                    >
                                        {format24 ? hour.toString().padStart(2, '0') : hour}
                                    </button>
                                );
                            })}

                            {/* Minute markers */}
                            {!selectingHours && Array.from({ length: 12 }, (_, i) => {
                                const minute = i * 5;
                                const angle = i * 30;
                                const x = Math.sin((angle * Math.PI) / 180) * 100 + 128;
                                const y = -Math.cos((angle * Math.PI) / 180) * 100 + 128;

                                return (
                                    <button
                                        key={minute}
                                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors transform -translate-x-1/2 -translate-y-1/2 ${currentMinutes === minute
                                            ? 'bg-primary text-on-primary'
                                            : 'hover:bg-on-surface/8 text-on-surface'
                                            }`}
                                        style={{ left: x, top: y }}
                                        onClick={() => setCurrentMinutes(minute)}
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </button>
                                );
                            })}

                            {/* Center dot */}
                            <div className="absolute w-2 h-2 bg-primary rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

                            {/* Hand */}
                            <div
                                className="absolute w-0.5 bg-primary origin-bottom transform -translate-x-1/2"
                                style={{
                                    height: selectingHours ? (format24 && currentHours >= 12 ? '80px' : '100px') : '100px',
                                    left: '50%',
                                    bottom: '50%',
                                    transformOrigin: 'bottom',
                                    transform: `translateX(-50%) rotate(${selectingHours
                                        ? format24 ? (currentHours * 15) : ((currentHours % 12) * 30)
                                        : (currentMinutes * 6)
                                        }deg)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Toggle input mode */}
                    <div className="flex justify-center">
                        <Button variant="text" size="sm">
                            <FontAwesomeIcon icon={faKeyboard} className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="text" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setIsOpen(false)}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
TimePickerDial.displayName = "TimePickerDial";

// Time Picker Input Component
const TimePickerInputMode = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & {
        title?: string;
    }
>(({ title = "Enter time", className, ...props }, ref) => {
    const context = React.useContext(TimePickerContext);

    if (!context) {
        throw new Error("TimePickerInputMode must be used within TimePicker");
    }

    const { selectedTime, setSelectedTime, isOpen, setIsOpen, format24 } = context;

    // Parse time string
    const parseTime = (timeStr: string) => {
        if (!timeStr) return { hours: 12, minutes: 0, period: 'AM' };

        const [time, period] = timeStr.includes('AM') || timeStr.includes('PM')
            ? timeStr.split(' ')
            : [timeStr, format24 ? '' : 'AM'];

        const [hours, minutes] = time.split(':').map(Number);
        return { hours: hours || 12, minutes: minutes || 0, period: period || 'AM' };
    };

    const { hours, minutes, period } = parseTime(selectedTime);
    const [currentHours, setCurrentHours] = React.useState(hours.toString().padStart(2, '0'));
    const [currentMinutes, setCurrentMinutes] = React.useState(minutes.toString().padStart(2, '0'));
    const [currentPeriod, setCurrentPeriod] = React.useState(period);

    const formatTime = (h: string, m: string, p: string) => {
        if (format24) {
            return `${h}:${m}`;
        }
        return `${h}:${m} ${p}`;
    };

    const handleSave = () => {
        const formattedTime = formatTime(currentHours, currentMinutes, currentPeriod);
        setSelectedTime(formattedTime);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                ref={ref}
                className={`max-w-sm ${className}`}
                {...props}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs text-on-surface-variant">Hour</label>
                            <Input
                                variant="outlined"
                                value={currentHours}
                                onChange={(e) => setCurrentHours(e.target.value)}
                                className="w-20 text-center text-2xl"
                                maxLength={2}
                            />
                        </div>
                        <span className="text-2xl text-on-surface mt-6">:</span>
                        <div className="space-y-2">
                            <label className="block text-xs text-on-surface-variant">Minute</label>
                            <Input
                                variant="outlined"
                                value={currentMinutes}
                                onChange={(e) => setCurrentMinutes(e.target.value)}
                                className="w-20 text-center text-2xl"
                                maxLength={2}
                            />
                        </div>
                        {!format24 && (
                            <div className="space-y-2 ml-2">
                                <label className="block text-xs text-on-surface-variant">Period</label>
                                <div className="flex flex-col gap-1">
                                    <button
                                        className={`px-3 py-2 rounded text-sm transition-colors ${currentPeriod === 'AM'
                                            ? 'bg-tertiary-container text-on-tertiary-container'
                                            : 'text-on-surface hover:bg-on-surface/8 border border-outline'
                                            }`}
                                        onClick={() => setCurrentPeriod('AM')}
                                    >
                                        AM
                                    </button>
                                    <button
                                        className={`px-3 py-2 rounded text-sm transition-colors ${currentPeriod === 'PM'
                                            ? 'bg-tertiary-container text-on-tertiary-container'
                                            : 'text-on-surface hover:bg-on-surface/8 border border-outline'
                                            }`}
                                        onClick={() => setCurrentPeriod('PM')}
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toggle dial mode */}
                    <div className="flex justify-center">
                        <Button variant="text" size="sm">
                            <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="text" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
TimePickerInputMode.displayName = "TimePickerInputMode";

export {
    DatePicker,
    DatePickerTrigger,
    DatePickerContent,
    ModalDatePickerTrigger,
    ModalDatePickerContent,
    DatePickerInput,
    TimePicker,
    TimePickerTrigger,
    TimePickerDial,
    TimePickerInputMode,
    TimePickerInput
};
