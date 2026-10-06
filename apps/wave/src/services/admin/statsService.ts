import { db } from '@/db/db';
import { albums, songs } from '@/db/schema';
import { parseDurationToSeconds } from '@/utils/audioMetadata';
import { and, count, desc, eq, isNull, or, sql, sum } from 'drizzle-orm';

export interface StatsResponse {
  totals: {
    albums: number;
    tracks: number;
    totalDuration: number; // in seconds
  };
  extremes: {
    longestTrack: { title: string; duration: string } | null;
    shortestTrack: { title: string; duration: string } | null;
  };
  vinylStats: {
    byRpmSpeed: Array<{ rpmSpeed: string; count: number }>;
    byCondition: Array<{ condition: string; count: number }>;
    byDecade: Array<{ decade: number; count: number }>;
  };
  health: {
    published: number;
    unpublished: number;
    missingCover: number;
    missingReleaseYear: number;
    missingEquipment: number;
  };
  recent: Array<{
    id: number;
    title: string;
    artist: string;
    digitizationDate: string | null;
    createdAt: string | null;
  }>;
}

export class StatsService {
  async getStats(): Promise<StatsResponse> {
    // Get totals
    const totals = await this.getTotals();

    // Get extremes
    const extremes = await this.getExtremes();

    // Get vinyl stats
    const vinylStats = await this.getVinylStats();

    // Get health metrics
    const health = await this.getHealth();

    // Get recent albums
    const recent = await this.getRecent();

    return {
      totals,
      extremes,
      vinylStats,
      health,
      recent,
    };
  }

  private async getTotals() {
    // Count albums
    const albumCountResult = await db
      .select({ count: count() })
      .from(albums)
      .get();

    // Count tracks
    const trackCountResult = await db
      .select({ count: count() })
      .from(songs)
      .get();

    // Get all song durations and sum them in application code
    // (SQLite doesn't have great string parsing, so we'll do it in JS)
    const allSongs = await db
      .select({ duration: songs.duration })
      .from(songs)
      .all();

    const totalDuration = allSongs.reduce((acc, song) => {
      return acc + parseDurationToSeconds(song.duration);
    }, 0);

    return {
      albums: albumCountResult?.count ?? 0,
      tracks: trackCountResult?.count ?? 0,
      totalDuration,
    };
  }

  private async getExtremes() {
    // Get all songs with duration to find extremes
    const allSongs = await db
      .select({
        title: songs.title,
        duration: songs.duration,
      })
      .from(songs)
      .all();

    if (allSongs.length === 0) {
      return {
        longestTrack: null,
        shortestTrack: null,
      };
    }

    // Parse durations and find extremes
    const songsWithSeconds = allSongs
      .map((song) => ({
        ...song,
        seconds: parseDurationToSeconds(song.duration),
      }))
      .filter((song) => song.seconds > 0); // Filter out invalid durations

    if (songsWithSeconds.length === 0) {
      return {
        longestTrack: null,
        shortestTrack: null,
      };
    }

    const longest = songsWithSeconds.reduce((prev, current) =>
      current.seconds > prev.seconds ? current : prev,
    );

    const shortest = songsWithSeconds.reduce((prev, current) =>
      current.seconds < prev.seconds ? current : prev,
    );

    return {
      longestTrack: {
        title: longest.title,
        duration: longest.duration,
      },
      shortestTrack: {
        title: shortest.title,
        duration: shortest.duration,
      },
    };
  }

  private async getVinylStats() {
    // Group by RPM speed
    const rpmSpeedResult = await db
      .select({
        rpmSpeed: albums.rpmSpeed,
        count: count(),
      })
      .from(albums)
      .where(sql`${albums.rpmSpeed} IS NOT NULL`)
      .groupBy(albums.rpmSpeed)
      .all();

    // Group by vinyl condition
    const conditionResult = await db
      .select({
        condition: albums.vinylCondition,
        count: count(),
      })
      .from(albums)
      .where(sql`${albums.vinylCondition} IS NOT NULL`)
      .groupBy(albums.vinylCondition)
      .all();

    // Group by decade (derived from release_year)
    const decadeResult = await db
      .select({
        decade: sql<number>`(${albums.releaseYear} / 10) * 10`.as('decade'),
        count: count(),
      })
      .from(albums)
      .where(sql`${albums.releaseYear} IS NOT NULL`)
      .groupBy(sql`(${albums.releaseYear} / 10) * 10`)
      .all();

    return {
      byRpmSpeed: rpmSpeedResult.map((r) => ({
        rpmSpeed: r.rpmSpeed ?? '',
        count: r.count,
      })),
      byCondition: conditionResult.map((c) => ({
        condition: c.condition ?? '',
        count: c.count,
      })),
      byDecade: decadeResult.map((d) => ({
        decade: d.decade,
        count: d.count,
      })),
    };
  }

  private async getHealth() {
    // Count published vs unpublished
    const publishedResult = await db
      .select({ count: count() })
      .from(albums)
      .where(eq(albums.isPublished, 1))
      .get();

    const unpublishedResult = await db
      .select({ count: count() })
      .from(albums)
      .where(eq(albums.isPublished, 0))
      .get();

    // Count missing cover
    const missingCoverResult = await db
      .select({ count: count() })
      .from(albums)
      .where(or(isNull(albums.cover), eq(albums.cover, '')))
      .get();

    // Count missing release_year
    const missingReleaseYearResult = await db
      .select({ count: count() })
      .from(albums)
      .where(isNull(albums.releaseYear))
      .get();

    // Count missing equipment_used
    const missingEquipmentResult = await db
      .select({ count: count() })
      .from(albums)
      .where(or(isNull(albums.equipmentUsed), eq(albums.equipmentUsed, '')))
      .get();

    return {
      published: publishedResult?.count ?? 0,
      unpublished: unpublishedResult?.count ?? 0,
      missingCover: missingCoverResult?.count ?? 0,
      missingReleaseYear: missingReleaseYearResult?.count ?? 0,
      missingEquipment: missingEquipmentResult?.count ?? 0,
    };
  }

  private async getRecent() {
    // Get top 5 most recently digitized albums
    // Order by digitization_date DESC, fallback to created_at DESC
    const recentAlbums = await db
      .select({
        id: albums.id,
        title: albums.title,
        artist: albums.artist,
        digitizationDate: albums.digitizationDate,
        createdAt: albums.createdAt,
      })
      .from(albums)
      .orderBy(
        desc(sql`COALESCE(${albums.digitizationDate}, ${albums.createdAt})`),
      )
      .limit(5)
      .all();

    return recentAlbums;
  }
}

export const statsService = new StatsService();
