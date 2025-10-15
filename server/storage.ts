import { 
  users, 
  categories, 
  videos, 
  videoCompletions, 
  videoViews,
  documents,
  announcements,
  documentViews,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Video,
  type InsertVideo,
  type VideoCompletion,
  type InsertVideoCompletion,
  type VideoView,
  type InsertVideoView,
  type VideoWithDetails,
  type UserWithStats,
  type Document,
  type InsertDocument,
  type DocumentWithDetails,
  type Announcement,
  type InsertAnnouncement,
  type AnnouncementWithCreator,
  type DocumentView,
  type InsertDocumentView
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNip(nip: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUsersWithStats(): Promise<UserWithStats[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Video operations
  getVideo(id: number): Promise<VideoWithDetails | undefined>;
  getAllVideos(): Promise<VideoWithDetails[]>;
  getVideosByCategory(categoryId: number): Promise<VideoWithDetails[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: number): Promise<void>;
  
  // Video completion operations
  getVideoCompletion(userId: number, videoId: number): Promise<VideoCompletion | undefined>;
  createVideoCompletion(completion: InsertVideoCompletion): Promise<VideoCompletion>;
  getUserCompletions(userId: number): Promise<VideoCompletion[]>;
  getVideoCompletions(videoId: number): Promise<VideoCompletion[]>;
  
  // Video view operations
  createVideoView(view: InsertVideoView): Promise<VideoView>;
  getUserViews(userId: number): Promise<VideoView[]>;
  getVideoViews(videoId: number): Promise<VideoView[]>;
  
  // Statistics
  getUserStats(userId: number): Promise<{
    completedVideos: number;
    totalVideos: number;
    totalWatchTime: number;
    certificates: number;
  }>;
  
  getSystemStats(): Promise<{
    totalUsers: number;
    totalVideos: number;
    totalViews: number;
    totalCertificates: number;
  }>;
  
  // Document operations
  getDocument(id: number): Promise<DocumentWithDetails | undefined>;
  getAllDocuments(): Promise<DocumentWithDetails[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Document view operations
  createDocumentView(view: InsertDocumentView): Promise<DocumentView>;
  
  // Announcement operations
  getAllAnnouncements(): Promise<AnnouncementWithCreator[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, username));
    return user || undefined;
  }

  async getUserByNip(nip: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.nip, nip));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  async getUsersWithStats(): Promise<UserWithStats[]> {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        nip: users.nip,
        password: users.password,
        role: users.role,
        rank: users.rank,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        active: users.active,
        completedVideos: sql<number>`count(distinct ${videoCompletions.videoId})`,
        totalWatchTime: sql<number>`coalesce(sum(${videoViews.duration}), 0)`,
        certificates: sql<number>`count(distinct case when ${videoCompletions.certificateIssued} then ${videoCompletions.id} end)`
      })
      .from(users)
      .leftJoin(videoCompletions, eq(users.id, videoCompletions.userId))
      .leftJoin(videoViews, eq(users.id, videoViews.userId))
      .groupBy(users.id)
      .orderBy(asc(users.name));

    return result;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Video operations
  async getVideo(id: number): Promise<VideoWithDetails | undefined> {
    const result = await db.query.videos.findFirst({
      where: eq(videos.id, id),
      with: {
        category: true,
        uploader: true,
        completions: true,
        views: true
      }
    });
    return result;
  }

  async getAllVideos(): Promise<VideoWithDetails[]> {
    return await db.query.videos.findMany({
      with: {
        category: true,
        uploader: true,
        completions: true,
        views: true
      },
      orderBy: [desc(videos.createdAt)]
    });
  }

  async getVideosByCategory(categoryId: number): Promise<VideoWithDetails[]> {
    return await db.query.videos.findMany({
      where: eq(videos.categoryId, categoryId),
      with: {
        category: true,
        uploader: true,
        completions: true,
        views: true
      },
      orderBy: [desc(videos.createdAt)]
    });
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(insertVideo).returning();
    return video;
  }

  async updateVideo(id: number, updateData: Partial<InsertVideo>): Promise<Video> {
    const [video] = await db.update(videos).set(updateData).where(eq(videos.id, id)).returning();
    return video;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Video completion operations
  async getVideoCompletion(userId: number, videoId: number): Promise<VideoCompletion | undefined> {
    const [completion] = await db
      .select()
      .from(videoCompletions)
      .where(and(eq(videoCompletions.userId, userId), eq(videoCompletions.videoId, videoId)));
    return completion || undefined;
  }

  async createVideoCompletion(insertCompletion: InsertVideoCompletion): Promise<VideoCompletion> {
    const [completion] = await db.insert(videoCompletions).values(insertCompletion).returning();
    return completion;
  }

  async getUserCompletions(userId: number): Promise<VideoCompletion[]> {
    return await db.select().from(videoCompletions).where(eq(videoCompletions.userId, userId));
  }

  async getVideoCompletions(videoId: number): Promise<VideoCompletion[]> {
    return await db.select().from(videoCompletions).where(eq(videoCompletions.videoId, videoId));
  }

  // Video view operations
  async createVideoView(insertView: InsertVideoView): Promise<VideoView> {
    const [view] = await db.insert(videoViews).values(insertView).returning();
    return view;
  }

  async getUserViews(userId: number): Promise<VideoView[]> {
    return await db.select().from(videoViews).where(eq(videoViews.userId, userId));
  }

  async getVideoViews(videoId: number): Promise<VideoView[]> {
    return await db.select().from(videoViews).where(eq(videoViews.videoId, videoId));
  }

  // Statistics
  async getUserStats(userId: number): Promise<{
    completedVideos: number;
    totalVideos: number;
    totalWatchTime: number;
    certificates: number;
  }> {
    const completedVideosResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoCompletions)
      .where(eq(videoCompletions.userId, userId));

    const totalVideosResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(eq(videos.active, true));

    const watchTimeResult = await db
      .select({ total: sql<number>`coalesce(sum(${videoViews.duration}), 0)` })
      .from(videoViews)
      .where(eq(videoViews.userId, userId));

    const certificatesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoCompletions)
      .where(and(eq(videoCompletions.userId, userId), eq(videoCompletions.certificateIssued, true)));

    return {
      completedVideos: completedVideosResult[0].count,
      totalVideos: totalVideosResult[0].count,
      totalWatchTime: watchTimeResult[0].total,
      certificates: certificatesResult[0].count,
    };
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalVideos: number;
    totalViews: number;
    totalCertificates: number;
  }> {
    const usersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.active, true));

    const videosResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(eq(videos.active, true));

    const viewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoViews);

    const certificatesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoCompletions)
      .where(eq(videoCompletions.certificateIssued, true));

    return {
      totalUsers: usersResult[0].count,
      totalVideos: videosResult[0].count,
      totalViews: viewsResult[0].count,
      totalCertificates: certificatesResult[0].count,
    };
  }

  // Document operations
  async getDocument(id: number): Promise<DocumentWithDetails | undefined> {
    const result = await db
      .select()
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(and(eq(documents.id, id), eq(documents.active, true)));

    if (result.length === 0) return undefined;

    const document = result[0];
    const views = await db
      .select()
      .from(documentViews)
      .where(eq(documentViews.documentId, id));

    return {
      ...document.documents,
      category: document.categories,
      uploader: document.users ? { ...document.users, password: '' } : null,
      views,
    } as DocumentWithDetails;
  }

  async getAllDocuments(): Promise<DocumentWithDetails[]> {
    const result = await db
      .select()
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(eq(documents.active, true))
      .orderBy(desc(documents.createdAt));

    const documentsWithViews = await Promise.all(
      result.map(async (doc) => {
        const views = await db
          .select()
          .from(documentViews)
          .where(eq(documentViews.documentId, doc.documents.id));

        return {
          ...doc.documents,
          category: doc.categories,
          uploader: doc.users ? { ...doc.users, password: '' } : null,
          views,
        } as DocumentWithDetails;
      })
    );

    return documentsWithViews;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.update(documents).set({ active: false }).where(eq(documents.id, id));
  }

  // Document view operations
  async createDocumentView(insertView: InsertDocumentView): Promise<DocumentView> {
    const [view] = await db.insert(documentViews).values(insertView).returning();
    return view;
  }

  // Announcement operations
  async getAllAnnouncements(): Promise<AnnouncementWithCreator[]> {
    const result = await db
      .select()
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .where(eq(announcements.active, true))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));

    return result.map(item => ({
      ...item.announcements,
      creator: item.users ? { ...item.users, password: '' } : null,
    })) as AnnouncementWithCreator[];
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements).values(insertAnnouncement).returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.update(announcements).set({ active: false }).where(eq(announcements.id, id));
  }
}

export const storage = new DatabaseStorage();
