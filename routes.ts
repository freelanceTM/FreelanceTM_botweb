import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertServiceSchema, insertOrderSchema, insertReviewSchema, insertWithdrawalRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Services
  app.get('/api/services', async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const services = await storage.getServices({ categoryId });
      
      // Get sellers for each service
      const servicesWithSellers = await Promise.all(
        services.map(async (service) => {
          const seller = await storage.getUser(service.sellerId);
          return { ...service, seller };
        })
      );
      
      res.json(servicesWithSellers);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/popular', async (req, res) => {
    try {
      const services = await storage.getPopularServices();
      const servicesWithSellers = await Promise.all(
        services.map(async (service) => {
          const seller = await storage.getUser(service.sellerId);
          return { ...service, seller };
        })
      );
      res.json(servicesWithSellers);
    } catch (error) {
      console.error("Error fetching popular services:", error);
      res.status(500).json({ message: "Failed to fetch popular services" });
    }
  });

  app.get('/api/services/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const services = await storage.getServicesBySeller(userId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching my services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      const seller = await storage.getUser(service.sellerId);
      res.json({ ...service, seller });
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.get('/api/services/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByService(req.params.id);
      const reviewsWithBuyers = await Promise.all(
        reviews.map(async (review) => {
          const buyer = await storage.getUser(review.buyerId);
          return { ...review, buyer };
        })
      );
      res.json(reviewsWithBuyers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isSeller) {
        return res.status(403).json({ message: "Must be a seller to create services" });
      }

      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService({
        ...validatedData,
        sellerId: userId,
      });
      
      res.json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  // Orders
  app.get('/api/orders/buyer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders({ buyerId: userId });
      
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const [service, seller] = await Promise.all([
            storage.getService(order.serviceId),
            storage.getUser(order.sellerId),
          ]);
          return { ...order, service, seller };
        })
      );
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/seller', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders({ sellerId: userId });
      
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const [service, buyer] = await Promise.all([
            storage.getService(order.serviceId),
            storage.getUser(order.buyerId),
          ]);
          return { ...order, service, buyer };
        })
      );
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const buyerOrders = await storage.getOrders({ buyerId: userId });
      const sellerOrders = await storage.getOrders({ sellerId: userId });
      const allOrders = [...buyerOrders, ...sellerOrders];
      
      const ordersWithUsers = await Promise.all(
        allOrders.map(async (order) => {
          const [buyer, seller] = await Promise.all([
            storage.getUser(order.buyerId),
            storage.getUser(order.sellerId),
          ]);
          return { ...order, buyer, seller };
        })
      );
      
      res.json(ordersWithUsers);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const [service, buyer, seller] = await Promise.all([
        storage.getService(order.serviceId),
        storage.getUser(order.buyerId),
        storage.getUser(order.sellerId),
      ]);
      
      res.json({ ...order, service, buyer, seller });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get('/api/orders/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesByOrder(req.params.id);
      const messagesWithSenders = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          return { ...message, sender };
        })
      );
      res.json(messagesWithSenders);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { serviceId, packageType } = req.body;
      
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      let price: number;
      let deliveryDays: number;
      
      if (packageType === 'basic') {
        price = Number(service.basicPrice);
        deliveryDays = service.basicDeliveryDays;
      } else if (packageType === 'standard') {
        price = Number(service.standardPrice || service.basicPrice);
        deliveryDays = service.standardDeliveryDays || service.basicDeliveryDays;
      } else {
        price = Number(service.premiumPrice || service.basicPrice);
        deliveryDays = service.premiumDeliveryDays || service.basicDeliveryDays;
      }
      
      // Get commission rate from settings (default 20%)
      const commissionSetting = await storage.getSetting('commission_rate');
      const commissionRate = commissionSetting ? Number(commissionSetting.value) : 20;
      const commission = price * (commissionRate / 100);
      
      // Check buyer balance
      const buyer = await storage.getUser(userId);
      if (!buyer || Number(buyer.balance) < price) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create order
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + deliveryDays);
      
      const order = await storage.createOrder({
        serviceId,
        buyerId: userId,
        sellerId: service.sellerId,
        packageType,
        price: price.toString(),
        commission: commission.toString(),
        deliveryDays,
        status: 'created',
        dueDate,
      });
      
      // Deduct from buyer balance and record transaction
      await storage.updateUserBalance(userId, -price);
      const buyerBalance = Number(buyer.balance);
      await storage.createTransaction({
        userId,
        orderId: order.id,
        type: 'payment',
        amount: price.toString(),
        balanceBefore: buyerBalance.toString(),
        balanceAfter: (buyerBalance - price).toString(),
        descriptionRu: `Оплата заказа #${order.id.slice(0, 8)}`,
        descriptionTm: `Sargyt #${order.id.slice(0, 8)} töleg`,
      });
      
      // Add to seller pending balance
      await storage.updateUserBalance(service.sellerId, 0, price - commission);
      
      res.json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completedAt = new Date();
        
        // Transfer from pending to available for seller
        const seller = await storage.getUser(order.sellerId);
        if (seller) {
          const amount = Number(order.price) - Number(order.commission);
          await storage.updateUserBalance(order.sellerId, amount, -amount);
          await storage.updateUserBalance(order.sellerId, 0, 0); // Update totalEarnings
          
          const sellerBalance = Number(seller.balance);
          await storage.createTransaction({
            userId: order.sellerId,
            orderId: order.id,
            type: 'earnings',
            amount: amount.toString(),
            balanceBefore: sellerBalance.toString(),
            balanceAfter: (sellerBalance + amount).toString(),
            descriptionRu: `Оплата за заказ #${order.id.slice(0, 8)}`,
            descriptionTm: `Sargyt #${order.id.slice(0, 8)} töleg`,
          });
        }
      }
      
      const updated = await storage.updateOrder(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: error.message || "Failed to update order" });
    }
  });

  app.post('/api/orders/:id/deliver', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { deliveryUrl, deliveryNotes } = req.body;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.sellerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updated = await storage.updateOrder(req.params.id, {
        deliveryUrl,
        deliveryNotes,
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error delivering order:", error);
      res.status(400).json({ message: error.message || "Failed to deliver order" });
    }
  });

  // Transactions
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Withdrawal requests
  app.get('/api/withdrawal-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const withdrawals = await storage.getWithdrawalsByUser(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post('/api/withdrawal-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWithdrawalRequestSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user || Number(user.balance) < Number(validatedData.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const withdrawal = await storage.createWithdrawal({
        ...validatedData,
        userId,
      });
      
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Error creating withdrawal:", error);
      res.status(400).json({ message: error.message || "Failed to create withdrawal request" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get all users - simplified for now
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/services', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const services = await storage.getServices();
      const servicesWithSellers = await Promise.all(
        services.map(async (service) => {
          const seller = await storage.getUser(service.sellerId);
          return { ...service, seller };
        })
      );
      res.json(servicesWithSellers);
    } catch (error) {
      console.error("Error fetching admin services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders({});
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const [buyer, seller] = await Promise.all([
            storage.getUser(order.buyerId),
            storage.getUser(order.sellerId),
          ]);
          return { ...order, buyer, seller };
        })
      );
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/disputes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const disputes = await storage.getDisputes();
      const disputesWithOrders = await Promise.all(
        disputes.map(async (dispute) => {
          const order = await storage.getOrder(dispute.orderId);
          return { ...dispute, order };
        })
      );
      res.json(disputesWithOrders);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get('/api/admin/withdrawals', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const user = await storage.getUser(withdrawal.userId);
          return { ...withdrawal, user };
        })
      );
      res.json(withdrawalsWithUsers);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post('/api/admin/users/:id/ban', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.upsertUser({
        ...user,
        isBanned: !user.isBanned,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.post('/api/admin/withdrawals/:id/:action', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const withdrawal = await storage.getWithdrawal(req.params.id);
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      const action = req.params.action;
      const userId = (req.user as any).claims.sub;
      
      if (action === 'approve') {
        await storage.updateWithdrawal(req.params.id, {
          status: 'approved',
          processedBy: userId,
          processedAt: new Date(),
        });
        
        // Deduct from user balance
        await storage.updateUserBalance(withdrawal.userId, -Number(withdrawal.amount));
        
        const user = await storage.getUser(withdrawal.userId);
        if (user) {
          const userBalance = Number(user.balance);
          await storage.createTransaction({
            userId: withdrawal.userId,
            type: 'withdrawal',
            amount: withdrawal.amount.toString(),
            balanceBefore: userBalance.toString(),
            balanceAfter: (userBalance - Number(withdrawal.amount)).toString(),
            descriptionRu: `Вывод средств`,
            descriptionTm: `Serişdeleri çykarmak`,
          });
        }
      } else if (action === 'reject') {
        await storage.updateWithdrawal(req.params.id, {
          status: 'rejected',
          processedBy: userId,
          processedAt: new Date(),
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, { ws: WebSocket; userId: string; orderId: string }>();
  
  wss.on('connection', (ws) => {
    let clientId = '';
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          clientId = `${message.userId || 'anon'}_${message.orderId}`;
          clients.set(clientId, { ws, userId: message.userId, orderId: message.orderId });
        } else if (message.type === 'sendMessage') {
          const order = await storage.getOrder(message.orderId);
          if (!order) return;
          
          const receiverId = message.senderId === order.buyerId ? order.sellerId : order.buyerId;
          
          const newMessage = await storage.createMessage({
            orderId: message.orderId,
            senderId: message.senderId,
            receiverId,
            content: message.content,
          });
          
          const sender = await storage.getUser(message.senderId);
          
          // Broadcast to all clients in the same order
          clients.forEach((client) => {
            if (client.orderId === message.orderId && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify({
                type: 'message',
                orderId: message.orderId,
                message: { ...newMessage, sender },
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
    
    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
      }
    });
  });

  return httpServer;
}
