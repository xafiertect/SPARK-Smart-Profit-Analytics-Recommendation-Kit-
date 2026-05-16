// Levenshtein Distance for string similarity
export function getSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) {
    // Boost if one is substring of another, proportional to length
    return Math.max(s1.length, s2.length) > 0 ? (Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)) * 0.9 : 0;
  }

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Deletion
        dp[i][j - 1] + 1,      // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  const maxLen = Math.max(m, n);
  if (maxLen === 0) return 1.0;
  
  return (maxLen - dp[m][n]) / maxLen;
}
