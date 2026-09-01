import { ContributionWeek, ContributionDay, GithubUserData } from '../../types';

export class GithubService {
  /**
   * Fetches real contribution data for any public GitHub username using CORS-enabled APIs.
   */
  static async fetchContributions(username: string): Promise<GithubUserData> {
    if (!username || !username.trim()) {
      return this.getEmptyUserData(username || 'guest');
    }

    const cleanUsername = username.trim();

    try {
      // 1. Primary: Try CORS-enabled Vercel GitHub Contributions API
      const res = await fetch(`https://github-contributions.vercel.app/api/v1/${cleanUsername}`);

      if (res.ok) {
        const json = await res.text();
        const parsed = JSON.parse(json);

        if (parsed && Array.isArray(parsed.years)) {
          const currentYearData = parsed.years[0]; // Recent year
          const rawDays: any[] = currentYearData?.contributions || [];

          let total = 0;
          const daysList: ContributionDay[] = rawDays.map((d: any) => {
            const count = d.count || 0;
            total += count;
            const level = (d.intensity ? parseInt(d.intensity, 10) : count > 8 ? 4 : count > 4 ? 3 : count > 2 ? 2 : count > 0 ? 1 : 0) as 0 | 1 | 2 | 3 | 4;
            return {
              date: d.date,
              count,
              level,
            };
          });

          // Group into weeks
          const weeks: ContributionWeek[] = [];
          for (let i = 0; i < daysList.length; i += 7) {
            weeks.push({
              days: daysList.slice(i, i + 7),
            });
          }

          return {
            username: cleanUsername,
            avatarUrl: `https://github.com/${cleanUsername}.png`,
            totalContributions: currentYearData.total || total,
            weeks,
            lastFetched: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('[Orbit GithubService] Vercel API fetch failed, trying fallback:', err);
    }

    // 2. Fallback: Parse GitHub REST events API (CORS enabled)
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
    } catch (fallbackErr) {
      console.warn('[Orbit GithubService] GitHub events fallback failed:', fallbackErr);
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
