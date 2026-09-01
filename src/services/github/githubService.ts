import { ContributionWeek, ContributionDay, GithubUserData } from '../../types';

export class GithubService {
  /**
   * Fetches real contribution data for any public GitHub username.
   */
  static async fetchContributions(username: string): Promise<GithubUserData> {
    if (!username || !username.trim()) {
      return this.getEmptyUserData(username || 'guest');
    }

    const cleanUsername = username.trim();

    try {
      // Fetch public HTML contribution page from GitHub
      const res = await fetch(`https://github.com/users/${cleanUsername}/contributions`, {
        headers: {
          'User-Agent': 'Orbit-Desktop-App',
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub user '${cleanUsername}' not found or network error`);
      }

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract all contribution day cells (<td class="ContributionCalendar-day" ...>)
      const dayCells = doc.querySelectorAll('td.ContributionCalendar-day, td[data-date]');

      const daysList: ContributionDay[] = [];
      let total = 0;

      dayCells.forEach((cell) => {
        const date = cell.getAttribute('data-date');
        const levelAttr = cell.getAttribute('data-level');
        const level = (levelAttr ? parseInt(levelAttr, 10) : 0) as 0 | 1 | 2 | 3 | 4;

        if (date) {
          // Calculate rough contribution count from level
          const count = level === 4 ? 12 : level === 3 ? 7 : level === 2 ? 4 : level === 1 ? 2 : 0;
          total += count;
          daysList.push({
            date,
            count,
            level,
          });
        }
      });

      if (daysList.length === 0) {
        return this.getEmptyUserData(cleanUsername);
      }

      // Group into 52 weeks of 7 days
      const weeks: ContributionWeek[] = [];
      for (let i = 0; i < daysList.length; i += 7) {
        weeks.push({
          days: daysList.slice(i, i + 7),
        });
      }

      return {
        username: cleanUsername,
        avatarUrl: `https://github.com/${cleanUsername}.png`,
        totalContributions: total,
        weeks,
        lastFetched: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[Orbit GithubService] Could not fetch live data for ${cleanUsername}:`, err);
      return this.getEmptyUserData(cleanUsername);
    }
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
