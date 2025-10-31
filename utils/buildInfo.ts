/**
 * Build information utility
 * Provides access to build-time metadata (SHA, branch, build date, etc.)
 */

export interface BuildInfo {
  gitSha: string;
  gitShaShort: string;
  gitBranch: string;
  buildDate: string;
  buildNumber: string;
}

/**
 * Get current build information
 */
export const getBuildInfo = (): BuildInfo => {
  return {
    gitSha: import.meta.env.VITE_GIT_SHA || 'dev',
    gitShaShort: import.meta.env.VITE_GIT_SHA_SHORT || 'dev',
    gitBranch: import.meta.env.VITE_GIT_BRANCH || 'local',
    buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    buildNumber: import.meta.env.VITE_BUILD_TIME || '0',
  };
};

/**
 * Get a formatted version string
 */
export const getVersionString = (): string => {
  const info = getBuildInfo();
  return `${info.gitShaShort} (${info.gitBranch})`;
};

/**
 * Get build info as a formatted string
 */
export const getBuildInfoString = (): string => {
  const info = getBuildInfo();
  return [
    `SHA: ${info.gitShaShort}`,
    `Branch: ${info.gitBranch}`,
    `Build: #${info.buildNumber}`,
    `Date: ${new Date(info.buildDate).toLocaleDateString()}`,
  ].join(' | ');
};

/**
 * Log build info to console (useful for debugging)
 */
export const logBuildInfo = (): void => {
  const info = getBuildInfo();
  console.log('%c🚀 Build Information', 'color: #4CAF50; font-weight: bold;');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Commit SHA (short): ${info.gitShaShort}`);
  console.log(`📦 Commit SHA (full): ${info.gitSha}`);
  console.log(`🌿 Branch: ${info.gitBranch}`);
  console.log(`🔢 Build Number: ${info.buildNumber}`);
  console.log(`📅 Build Date: ${new Date(info.buildDate).toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

