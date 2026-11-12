import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  Code2,
  FileText,
  Boxes,
  Terminal,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';
import { AndroidFileRecord } from '../types';

export const ProjectCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileRecord>(ANDROID_PROJECT_FILES[4]); // MainActivity.kt
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files into zip structure
      ANDROID_PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add README.md with build and installation instructions
      const readmeContent = `# OTG Guardian - Android Studio Project
## Native Android OTG Auto-Maintenance & Recovery for OnePlus Nord CE 2 Lite 5G
- Device Model: CPH2381
- Firmware: CPH2381_14.0.0.0.3000(EX01C10P02)
- Android: 14 (API Level 34)
- OxygenOS: 14.0

### How to Build & Install:
1. Open Android Studio (Hedgehog 2023.1.1+ or Iguana / Jellyfish).
2. Select "Open Project" and select the unzipped "android" folder.
3. Allow Gradle to sync dependencies.
4. Connect your OnePlus Nord CE 2 Lite 5G with USB Debugging enabled.
5. Click Run (or execute './gradlew assembleDebug').
6. The debug APK will be generated at:
   app/build/outputs/apk/debug/app-debug.apk

### Optional One-Time ADB Grant (for Zero-Touch Direct Settings Toggle):
\`\`\`bash
adb shell pm grant com.otgguardian.app android.permission.WRITE_SECURE_SETTINGS
\`\`\`

### Optional Battery Optimization Whitelist:
\`\`\`bash
adb shell dumpsys deviceidle whitelist +com.otgguardian.app
\`\`\`
`;
      zip.file('android/README.md', readmeContent);

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'OTG_Guardian_OnePlus_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to create zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Complete Native Android Studio Project
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Full Kotlin source code, Jetpack Compose UI, AndroidManifest.xml, and Gradle configuration.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href="/otg-guardian.apk"
            download="otg-guardian.apk"
            className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download APK File</span>
          </a>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full sm:w-auto py-2.5 px-4 bg-[#142038] hover:bg-[#1a2c4e] border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Packaging ZIP...' : zipSuccess ? 'Downloaded!' : 'Download Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File Tree Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-1">
            PROJECT FILES ({ANDROID_PROJECT_FILES.length})
          </span>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {ANDROID_PROJECT_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#101b2f] border-cyan-500/60 shadow-md text-cyan-300'
                      : 'bg-[#0e1525] border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <span className="font-bold block truncate">{file.filename}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* File Toolbar */}
          <div className="p-3 bg-[#0d1424] border-b border-slate-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold">{selectedFile.filename}</span>
              <span className="text-[10px] text-slate-500 font-mono">({selectedFile.language})</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Description bar */}
          <div className="px-3 py-1.5 bg-[#0a0f1c] border-b border-slate-800/80 text-[11px] text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Body */}
          <div className="p-4 overflow-x-auto max-h-[500px] font-mono text-[11px] leading-relaxed text-slate-300 custom-scrollbar select-text">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
