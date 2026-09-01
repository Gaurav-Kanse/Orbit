import { ContributionWeek, ContributionDay, GithubUserData } from '../../types';

// Mock generator for realistic GitHub contribution calendar over 52 weeks
export function generateMockGithubData(username = 'developer'): GithubUserData {
  const weeks: ContributionWeek[] = [];
  const today = new Date();
  let total = 0;

  // Generate 52 weeks x 7 days
  for (let w = 51; w >= 0; w--) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      
      // Seed random contributions with realistic activity clusters
      const rand = Math.random();
      let count = 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;

      if (rand > 0.45) {
        count = Math.floor(Math.random() * 8) + 1;
        if (count === 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;
      }

      total += count;
      days.push({
        date: date.toISOString().split('T')[0],
        count,
        level,
      });
    }
    weeks.push({ days });
  }

  return {
    username,
    totalContributions: total,
    weeks,
    lastFetched: new Date().toISOString(),
  };
}

export class GithubService {
  private static STORAGE_KEY = 'focus_island_github_token';

  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static setToken(token: string) {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  static clearToken() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static async fetchContributions(token?: string): Promise<GithubUserData> {
    const activeToken = token || this.getToken();
    if (!activeToken) {
      return generateMockGithubData();
    }

    try {
      // In production with token, query GitHub GraphQL API v4
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              viewer {
                login
                avatarUrl
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        contributionCount
                        date
                        weekday
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('GitHub API request failed');
      }

      const data = await response.json();
      const user = data.data.viewer;
      const calendar = user.contributionsCollection.contributionCalendar;

      const weeks: ContributionWeek[] = calendar.weeks.map((w: any) => ({
        days: w.contributionDays.map((d: any) => {
          const count = d.contributionCount;
          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (count > 0 && count <= 2) level = 1;
          else if (count <= 5) level = 2;
          else if (count <= 8) level = 3;
          else if (count > 8) level = 4;

          return {
            date: d.date,
            count,
            level,
          };
        }),
      }));

      return {
        username: user.login,
        avatarUrl: user.avatarUrl,
        totalContributions: calendar.totalContributions,
        weeks,
        lastFetched: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Using cached / mock GitHub data due to API error:', err);
      return generateMockGithubData();
    }
  }
}
