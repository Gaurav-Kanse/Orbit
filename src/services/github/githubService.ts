import { invoke } from '@tauri-apps/api/core';
import { ContributionWeek, ContributionDay, GithubUserData } from '../../types';

export class GithubService {
  /**
   * Fetches real GitHub contribution HTML using native Rust IPC command (bypassing CORS 100%).
   */
  static async fetchContributions(username: string): Promise<GithubUserData> {
    if (!username || !username.trim()) {
      return this.getEmptyUserData(username || 'guest');
    }

    const cleanUsername = username.trim();
    let html = '';

    // 1. Primary: Invoke native Rust command (No CORS restriction)
    try {
      html = await invoke<string>('fetch_github_contributions', { username: cleanUsername });
    } catch (err) {
      console.warn('[Orbit GithubService] Tauri invoke failed, falling back to direct web fetch:', err);
      try {
        const res = await fetch(`https://github.com/users/${cleanUsername}/contributions`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' },
        });
        if (res.ok) {
          html = await res.text();
        }
      } catch (_) {}
    }

    if (html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract total count from H2 header
        let totalContributions = 0;
        const h2Text = doc.querySelector('h2')?.textContent || '';
        const match = h2Text.match(/([\d,]+)\s+contributions/i);
        if (match) {
          totalContributions = parseInt(match[1].replace(/,/g, ''), 10);
        }

        // Map tooltips for exact daily counts (e.g. "15 contributions on August 20th")
        const countByDate: Record<string, number> = {};
        const tooltips = doc.querySelectorAll('tool-tip');
        tooltips.forEach((tip) => {
          const text = tip.textContent || '';
          const forId = tip.getAttribute('for') || '';
          const countMatch = text.match(/(\d+)\s+contribution/i);
          const count = countMatch ? parseInt(countMatch[1], 10) : 0;

          if (forId) {
            const el = doc.getElementById(forId);
            const date = el?.getAttribute('data-date');
            if (date) {
              countByDate[date] = count;
            }
          }
        });

        // Extract all day cells ([data-date])
        const dayCells = doc.querySelectorAll('[data-date]');
        const daysList: ContributionDay[] = [];
        let calculatedTotal = 0;

        dayCells.forEach((cell) => {
          const date = cell.getAttribute('data-date');
          const levelAttr = cell.getAttribute('data-level');
          const level = (levelAttr ? parseInt(levelAttr, 10) : 0) as 0 | 1 | 2 | 3 | 4;

          if (date) {
            const count = countByDate[date] !== undefined ? countByDate[date] : level > 0 ? level * 2 : 0;
            calculatedTotal += count;
            daysList.push({
              date,
              count,
              level,
            });
          }
        });

        if (daysList.length > 0) {
          // Sort chronologically by date
          daysList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const weeks: ContributionWeek[] = [];
          for (let i = 0; i < daysList.length; i += 7) {
            weeks.push({
              days: daysList.slice(i, i + 7),
            });
          }

          return {
            username: cleanUsername,
            avatarUrl: `https://github.com/${cleanUsername}.png`,
            totalContributions: Math.max(totalContributions, calculatedTotal),
            weeks,
            lastFetched: new Date().toISOString(),
          };
        }
      } catch (parseErr) {
        console.error('[Orbit GithubService] HTML parsing error:', parseErr);
      }
    }

    return this.getEmptyUserData(cleanUsername);
  }

  private static getEmptyUserData(username: string): GithubUserData {
    const today = new Date();
    const weeks: ContributionWeek[] = [];
    for (let w = 51; w >= 0; w--) {
      const days: ContributionDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        days.push({
          date: date.toISOString().split('T')[0],
          count: 0,
          level: 0,
        });
      }
      weeks.push({ days });
    }

    return {
      username,
      totalContributions: 0,
      weeks,
      lastFetched: new Date().toISOString(),
    };
  }
}
