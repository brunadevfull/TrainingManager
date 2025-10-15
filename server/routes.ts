import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema, insertCategorySchema, insertVideoSchema, insertDocumentSchema, insertAnnouncementSchema } from "@shared/schema";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

// Configure multer for video uploads
const videoUploadDir = path.join(process.cwd(), "uploads", "videos");
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

const videoUpload = multer({
  dest: videoUploadDir,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  },
});

// Configure multer for document uploads
const documentUploadDir = path.join(process.cwd(), "uploads", "documents");
if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, { recursive: true });
}

const documentUpload = multer({
  dest: documentUploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for documents
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and image files are allowed!'));
    }
  },
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "papem35-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
};

// Middleware to check admin role
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session(sessionConfig));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { nip, password } = req.body;
      
      if (!nip || !password) {
        return res.status(400).json({ message: "NIP e senha são obrigatórios" });
      }

      const user = await storage.getUserByNip(nip);
      if (!user) {
        return res.status(401).json({ message: "NIP ou senha inválidos" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "NIP ou senha inválidos" });
      }

      if (!user.active) {
        return res.status(401).json({ message: "Usuário inativo" });
      }

      // Update last login with only the required field
      const updatedUser = await storage.updateUser(user.id, { lastLogin: new Date() });

      // Set session
      req.session.userId = updatedUser.id;
      req.session.userRole = updatedUser.role;

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User routes
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersWithStats();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if NIP already exists
      const existingUser = await storage.getUserByNip(userData.nip);
      if (existingUser) {
        return res.status(400).json({ message: "NIP já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const user = await storage.updateUser(id, userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Category routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create category error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Video routes
  app.get("/api/videos", requireAuth, async (req, res) => {
    try {
      const { category } = req.query;
      let videos;
      
      if (category) {
        videos = await storage.getVideosByCategory(parseInt(category as string));
      } else {
        videos = await storage.getAllVideos();
      }
      
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/videos/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: "Vídeo não encontrado" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Get video error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/videos", requireAdmin, videoUpload.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Arquivo de vídeo é obrigatório" });
      }

      const uploadedBy = req.session.userId;
      if (!uploadedBy) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const videoData = insertVideoSchema.parse({
        ...req.body,
        filename: req.file.filename,
        uploadedBy,
        duration: parseInt(req.body.duration) || 0,
        categoryId: parseInt(req.body.categoryId) || null,
        requiresCertificate: req.body.requiresCertificate === "true",
      });

      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create video error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/videos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Vídeo excluído com sucesso" });
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Video streaming
  app.get("/api/videos/:id/stream", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: "Vídeo não encontrado" });
      }

      const videoPath = path.join(videoUploadDir, video.filename);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ message: "Arquivo de vídeo não encontrado" });
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error("Stream video error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Video completion routes
  app.post("/api/videos/:id/complete", requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      // Check if already completed
      const existing = await storage.getVideoCompletion(userId, videoId);
      if (existing) {
        return res.status(400).json({ message: "Vídeo já foi marcado como concluído" });
      }

      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Vídeo não encontrado" });
      }

      const completion = await storage.createVideoCompletion({
        userId,
        videoId,
        progress: 100,
        certificateIssued: video.requiresCertificate,
      });

      res.json(completion);
    } catch (error) {
      console.error("Complete video error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Video view tracking
  app.post("/api/videos/:id/view", requireAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { duration } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const view = await storage.createVideoView({
        userId,
        videoId,
        duration: parseInt(duration) || 0,
      });

      res.json(view);
    } catch (error) {
      console.error("Track video view error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User progress routes
  app.get("/api/users/:id/progress", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session.userId;
      
      if (!currentUserId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      // Check if user can access this progress (themselves or admin)
      if (currentUserId !== userId) {
        const currentUser = await storage.getUser(currentUserId);
        if (!currentUser || currentUser.role !== "admin") {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }

      const stats = await storage.getUserStats(userId);
      const completions = await storage.getUserCompletions(userId);
      const views = await storage.getUserViews(userId);

      res.json({
        stats,
        completions,
        views,
      });
    } catch (error) {
      console.error("Get user progress error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Statistics routes
  app.get("/api/stats/system", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Get system stats error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Reports routes
  app.get("/api/reports/progress", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersWithStats();
      const videos = await storage.getAllVideos();
      
      const report = {
        users: users.map(({ password, ...user }) => user),
        videos: videos.map(video => ({
          id: video.id,
          title: video.title,
          category: video.category?.name || "Sem categoria",
          duration: video.duration,
          completions: video.completions.length,
          views: video.views.length,
        })),
        generatedAt: new Date().toISOString(),
      };

      res.json(report);
    } catch (error) {
      console.error("Generate progress report error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/documents", requireAdmin, documentUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Arquivo é obrigatório" });
      }

      const uploadedBy = req.session.userId;
      if (!uploadedBy) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const documentData = insertDocumentSchema.parse({
        ...req.body,
        filename: req.file.filename,
        fileType: req.file.mimetype.split('/')[1],
        fileSize: req.file.size,
        uploadedBy,
        categoryId: parseInt(req.body.categoryId) || null,
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create document error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      const documentPath = path.join(documentUploadDir, document.filename);
      
      if (!fs.existsSync(documentPath)) {
        return res.status(404).json({ message: "Arquivo não encontrado" });
      }

      // Track document view
      await storage.createDocumentView({
        userId,
        documentId: id,
        downloaded: true,
      });

      // Update download count - we'll handle this in the database directly
      await storage.updateDocument(id, {});

      res.download(documentPath, document.filename);
    } catch (error) {
      console.error("Download document error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.json({ message: "Documento excluído com sucesso" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Announcements routes
  app.get("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/announcements", requireAdmin, async (req, res) => {
    try {
      const createdBy = req.session.userId;
      if (!createdBy) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        createdBy,
      });

      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create announcement error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.json({ message: "Aviso excluído com sucesso" });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
