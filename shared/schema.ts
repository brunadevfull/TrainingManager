import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nip: varchar("nip", { length: 11 }).notNull().unique(), // NIP format: 11.1111.11
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user' or 'admin'
  rank: text("rank"), // posto/graduação
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  active: boolean("active").default(true).notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  duration: integer("duration").notNull(), // in seconds
  categoryId: integer("category_id").references(() => categories.id),
  requiresCertificate: boolean("requires_certificate").default(false).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const videoCompletions = pgTable("video_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  progress: integer("progress").default(100).notNull(), // percentage
  certificateIssued: boolean("certificate_issued").default(false).notNull(),
});

export const videoViews = pgTable("video_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  duration: integer("duration").notNull(), // seconds watched
});

// Documents table for PDFs and other documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // 'pdf', 'doc', 'docx', etc.
  fileSize: integer("file_size").notNull(), // in bytes
  categoryId: integer("category_id").references(() => categories.id),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
});

// Announcements table for system-wide announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"), // 'info', 'warning', 'urgent', 'success'
  priority: integer("priority").default(1).notNull(), // 1=low, 2=medium, 3=high
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true).notNull(),
  targetRole: text("target_role"), // null=all, 'user', 'admin'
});

// Document views tracking
export const documentViews = pgTable("document_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  downloaded: boolean("downloaded").default(false).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  videoCompletions: many(videoCompletions),
  videoViews: many(videoViews),
  uploadedVideos: many(videos),
  uploadedDocuments: many(documents),
  documentViews: many(documentViews),
  announcements: many(announcements),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
  documents: many(documents),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  uploader: one(users, {
    fields: [videos.uploadedBy],
    references: [users.id],
  }),
  completions: many(videoCompletions),
  views: many(videoViews),
}));

export const videoCompletionsRelations = relations(videoCompletions, ({ one }) => ({
  user: one(users, {
    fields: [videoCompletions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoCompletions.videoId],
    references: [videos.id],
  }),
}));

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  category: one(categories, {
    fields: [documents.categoryId],
    references: [categories.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  views: many(documentViews),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const documentViewsRelations = relations(documentViews, ({ one }) => ({
  user: one(users, {
    fields: [documentViews.userId],
    references: [users.id],
  }),
  document: one(documents, {
    fields: [documentViews.documentId],
    references: [documents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const insertVideoCompletionSchema = createInsertSchema(videoCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertVideoViewSchema = createInsertSchema(videoViews).omit({
  id: true,
  viewedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentViewSchema = createInsertSchema(documentViews).omit({
  id: true,
  viewedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type VideoCompletion = typeof videoCompletions.$inferSelect;
export type InsertVideoCompletion = z.infer<typeof insertVideoCompletionSchema>;
export type VideoView = typeof videoViews.$inferSelect;
export type InsertVideoView = z.infer<typeof insertVideoViewSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type DocumentView = typeof documentViews.$inferSelect;
export type InsertDocumentView = z.infer<typeof insertDocumentViewSchema>;

// Extended types for API responses
export type VideoWithDetails = Video & {
  category: Category | null;
  uploader: User | null;
  completions: VideoCompletion[];
  views: VideoView[];
};

export type UserWithStats = User & {
  completedVideos: number;
  totalWatchTime: number;
  certificates: number;
};

export type DocumentWithDetails = Document & {
  category: Category | null;
  uploader: User | null;
  views: DocumentView[];
};

export type AnnouncementWithCreator = Announcement & {
  creator: User | null;
};
