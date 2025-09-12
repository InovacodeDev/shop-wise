// Test-only ambient declarations to appease TS for performance.memory & helpers in specs.
interface PerformanceMemory {
    usedJSHeapSize: number;
}

interface Performance {
    memory?: PerformanceMemory;
}

declare function createPerformantMockComponent(name: string): any;
