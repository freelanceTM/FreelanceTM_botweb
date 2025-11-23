import {
  users,
  categories,
  services,
  portfolioItems,
  orders,
  messages,
  reviews,
  transactions,
  withdrawalRequests,
  disputes,
  settings,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Service,
  type InsertService,
  type InsertPortfolioItem,
  type PortfolioItem,
  type Order,
  type InsertOrder,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type Transaction,
  type InsertTransaction,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type Dispute,
  type InsertDispute,
  type Setting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: number, pending?: number): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Service operations
  getServices(filters?: { categoryId?: string }): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesBySeller(sellerId: string): Promise<Service[]>;
  getPopularServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service>;
  
  // Portfolio operations
  getPortfolioByUser(userId: string): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  
  // Order operations
  getOrders(filters: { buyerId?: string; sellerId?: string }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  
  // Message operations
  getMessagesByOrder(orderId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Review operations
  getReviewsByService(serviceId: string): Promise<Review[]>;
  getReviewByOrder(orderId: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  
  // Transaction operations
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Withdrawal operations
  getWithdrawalsByUser(userId: string): Promise<WithdrawalRequest[]>;
  getAllWithdrawals(): Promise<WithdrawalRequest[]>;
  getWithdrawal(id: string): Promise<WithdrawalRequest | undefined>;
  createWithdrawal(withdrawal: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest>;
  
  // Dispute operations
  getDisputes(): Promise<Dispute[]>;
  getDisputeByOrder(orderId: string): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, amount: number, pending?: number): Promise<void> {
    const updates: any = {};
    if (amount !== undefined) {
      updates.balance = sql`${users.balance} + ${amount}`;
    }
    if (pending !== undefined) {
      updates.pendingBalance = sql`${users.pendingBalance} + ${pending}`;
    }
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Service operations
  async getServices(filters?: { categoryId?: string }): Promise<Service[]> {
    let query = db.select().from(services).where(eq(services.isActive, true));
    
    if (filters?.categoryId) {
      query = query.where(eq(services.categoryId, filters.categoryId)) as any;
    }
    
    return query.orderBy(desc(services.createdAt));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesBySeller(sellerId: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.sellerId, sellerId)).orderBy(desc(services.createdAt));
  }

  async getPopularServices(): Promise<Service[]> {
    return db.select().from(services)
      .where(eq(services.isActive, true))
      .orderBy(desc(services.orderCount))
      .limit(12);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const [updated] = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return updated;
  }

  // Portfolio operations
  async getPortfolioByUser(userId: string): Promise<PortfolioItem[]> {
    return db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(portfolioItems.sortOrder);
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [newItem] = await db.insert(portfolioItems).values(item).returning();
    return newItem;
  }

  // Order operations
  async getOrders(filters: { buyerId?: string; sellerId?: string }): Promise<Order[]> {
    const conditions = [];
    if (filters.buyerId) conditions.push(eq(orders.buyerId, filters.buyerId));
    if (filters.sellerId) conditions.push(eq(orders.sellerId, filters.sellerId));
    
    const whereClause = conditions.length > 0 ? or(...conditions) : undefined;
    
    return db.select().from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }

  // Message operations
  async getMessagesByOrder(orderId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.orderId, orderId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Review operations
  async getReviewsByService(serviceId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.serviceId, serviceId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewByOrder(orderId: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.orderId, orderId));
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const [updated] = await db.update(reviews).set(updates).where(eq(reviews.id, id)).returning();
    return updated;
  }

  // Transaction operations
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Withdrawal operations
  async getWithdrawalsByUser(userId: string): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, userId)).orderBy(desc(withdrawalRequests.createdAt));
  }

  async getAllWithdrawals(): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.createdAt));
  }

  async getWithdrawal(id: string): Promise<WithdrawalRequest | undefined> {
    const [withdrawal] = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id));
    return withdrawal;
  }

  async createWithdrawal(withdrawal: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [newWithdrawal] = await db.insert(withdrawalRequests).values(withdrawal).returning();
    return newWithdrawal;
  }

  async updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest> {
    const [updated] = await db.update(withdrawalRequests).set(updates).where(eq(withdrawalRequests.id, id)).returning();
    return updated;
  }

  // Dispute operations
  async getDisputes(): Promise<Dispute[]> {
    return db.select().from(disputes).orderBy(desc(disputes.createdAt));
  }

  async getDisputeByOrder(orderId: string): Promise<Dispute | undefined> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.orderId, orderId));
    return dispute;
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db.insert(disputes).values(dispute).returning();
    return newDispute;
  }

  async updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute> {
    const [updated] = await db.update(disputes).set(updates).where(eq(disputes.id, id)).returning();
    return updated;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db.insert(settings).values({ key, value }).onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    }).returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
