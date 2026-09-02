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

    // 1. Primary: Fetch native GitHub contributions HTML
    try {
      const res = await fetch(`https://github.com/users/${cleanUsername}/contributions`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      });

      if (res.ok) {
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract total count from h2 (e.g. "198 contributions in the last year")
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

          // Find corresponding td/rect by id
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
      }
    } catch (err) {
      console.warn('[Orbit GithubService] Native GitHub fetch failed, trying API fallback:', err);
    }

    // 2. Secondary: Vercel GitHub Contributions API
    try {
      const res = await fetch(`https://github-contributions.vercel.app/api/v1/${cleanUsername}`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.years)) {
          let totalAllYears = 0;
          json.years.forEach((y: any) => {
            totalAllYears += y.total || 0;
          });

          const rawDays: any[] = json.years[0]?.contributions || [];
          let totalCurrent = 0;
          const daysList: ContributionDay[] = rawDays.map((d: any) => {
            const count = d.count || 0;
            totalCurrent += count;
            const level = (d.intensity ? parseInt(d.intensity, 10) : count > 8 ? 4 : count > 4 ? 3 : count > 2 ? 2 : count > 0 ? 1 : 0) as 0 | 1 | 2 | 3 | 4;
            return {
              date: d.date,
              count,
              level,
            };
          });

          const weeks: ContributionWeek[] = [];
          for (let i = 0; i < daysList.length; i += 7) {
            weeks.push({ days: daysList.slice(i, i + 7) });
          }

          return {
            username: cleanUsername,
            avatarUrl: `https://github.com/${cleanUsername}.png`,
            totalContributions: Math.max(totalAllYears, totalCurrent),
            weeks,
            lastFetched: new Date().toISOString(),
          };
        }
      }
    } catch (_) {}

    // 3. Fallback: GitHub REST Events API
    try {
      const eventsRes = await fetch(`https://api.github.com/users/${cleanUsername}/events`);
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        const countsByDate: Record<string, number> = {};

        events.forEach((evt: any) => {
          if (evt.created_at) {
            const date = evt.created_at.split('T')[0];
            countsByDate[date] = (countsByDate[date] || 0) + 1;
          }
        });

        const today = new Date();
        const daysList: ContributionDay[] = [];
        let total = 0;

        for (let i = 364; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const count = countsByDate[dateStr] || 0;
          total += count;
          const level = (count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0) as 0 | 1 | 2 | 3 | 4;
          daysList.push({ date: dateStr, count, level });
        }

        const weeks: ContributionWeek[] = [];
        for (let i = 0; i < daysList.length; i += 7) {
          weeks.push({ days: daysList.slice(i, i + 7) });
        }

        return {
          username: cleanUsername,
          avatarUrl: `https://github.com/${cleanUsername}.png`,
          totalContributions: total,
          weeks,
          lastFetched: new Date().toISOString(),
        };
      }
    } catch (_) {}

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
