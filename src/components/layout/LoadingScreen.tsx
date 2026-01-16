import { Loader2 } from "lucide-react";

/**
 * A premium-looking loading screen for lazy-loaded routes
 */
const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
                {/* Animated Rings */}
                <div className="absolute w-16 h-16 border-4 border-primary/10 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>

                {/* Logo or Icon */}
                <div className="z-10 bg-white p-2">
                    <span className="text-xl font-black text-primary">Y</span>
                </div>
            </div>

            <p className="mt-6 text-sm font-bold tracking-[0.2em] text-primary/60 uppercase animate-pulse">
                Chargement...
            </p>
        </div>
    );
};

export default LoadingScreen;
