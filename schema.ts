import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "seller", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "in_progress",
  "revision",
  "completed",
  "cancelled",
  "dispute",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "payment",
  "refund",
  "withdrawal",
  "commission",
  "earnings",
]);
export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "in_review",
  "resolved",
]);

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (extended for marketplace)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("client"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  bio: text("bio"),
  isSeller: boolean("is_seller").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  responseTime: integer("response_time"),
  completedOrders: integer("completed_orders").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: varchar("name_ru").notNull(),
  nameTm: varchar("name_tm").notNull(),
  slug: varchar("slug").notNull().unique(),
  icon: varchar("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services (Kworks)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  titleRu: varchar("title_ru").notNull(),
  titleTm: varchar("title_tm").notNull(),
  descriptionRu: text("description_ru").notNull(),
  descriptionTm: text("description_tm").notNull(),
  imageUrl: varchar("image_url"),
  // Basic package
  basicPrice: decimal("basic_price", { precision: 10, scale: 2 }).notNull(),
  basicDeliveryDays: integer("basic_delivery_days").notNull(),
  basicDescriptionRu: text("basic_description_ru").notNull(),
  basicDescriptionTm: text("basic_description_tm").notNull(),
  // Standard package
  standardPrice: decimal("standard_price", { precision: 10, scale: 2 }),
  standardDeliveryDays: integer("standard_delivery_days"),
  standardDescriptionRu: text("standard_description_ru"),
  standardDescriptionTm: text("standard_description_tm"),
  // Premium package
  premiumPrice: decimal("premium_price", { precision: 10, scale: 2 }),
  premiumDeliveryDays: integer("premium_delivery_days"),
  premiumDescriptionRu: text("premium_description_ru"),
  premiumDescriptionTm: text("premium_description_tm"),
  // Metadata
  isActive: boolean("is_active").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  orderCount: integer("order_count").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio items
export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serviceId: varchar("service_id").references(() => services.id),
  titleRu: varchar("title_ru"),
  titleTm: varchar("title_tm"),
  descriptionRu: text("description_ru"),
  descriptionTm: text("description_tm"),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  packageType: varchar("package_type").notNull(), // 'basic', 'standard', 'premium'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  deliveryDays: integer("delivery_days").notNull(),
  status: orderStatusEnum("status").notNull().default("created"),
  requirementsRu: text("requirements_ru"),
  requirementsTm: text("requirements_tm"),
  deliveryUrl: varchar("delivery_url"),
  deliveryNotes: text("delivery_notes"),
  revisionCount: integer("revision_count").notNull().default(0),
  maxRevisions: integer("max_revisions").notNull().default(2),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content"),
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  fileSize: integer("file_size"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id).unique(),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  sellerResponse: text("seller_response"),
  sellerResponseAt: timestamp("seller_response_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  descriptionRu: text("description_ru"),
  descriptionTm: text("description_tm"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  paymentMethod: varchar("payment_method").notNull(),
  paymentDetails: text("payment_details").notNull(),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Disputes
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id).unique(),
  complainantId: varchar("complainant_id").notNull().references(() => users.id),
  respondentId: varchar("respondent_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"),
  status: disputeStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true,
  orderCount: true,
  rating: true,
  reviewCount: true,
});
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  revisionCount: true,
  completedAt: true,
});
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true,
  sellerResponse: true,
  sellerResponseAt: true,
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  processedBy: true,
  processedAt: true,
});
export const insertDisputeSchema = createInsertSchema(disputes).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  resolution: true,
  refundAmount: true,
  resolvedBy: true,
  resolvedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type Setting = typeof settings.$inferSelect;
