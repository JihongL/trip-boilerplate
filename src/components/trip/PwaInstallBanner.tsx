import { motion, AnimatePresence } from "framer-motion";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const PwaInstallBanner = () => {
  const { showPrompt, install, dismiss } = usePwaInstall();

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed left-4 right-4 z-40 mx-auto max-w-lg"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
            <div className="flex-shrink-0 text-3xl">📲</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                홈 화면에 추가하면 더 편해요!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                앱처럼 바로 열 수 있어요
              </p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={install}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl active:scale-95 transition-transform"
              >
                설치
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-1 text-xs text-muted-foreground active:opacity-60"
              >
                나중에
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaInstallBanner;
