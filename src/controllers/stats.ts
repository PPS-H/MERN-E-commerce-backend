import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import {
  cache,
  calculatePercentage,
  getCharReports,
  getInventory,
} from "../utils/features.js";

export const dashboradStats = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let stats;
    // if (cache.has("admin-dashboard-stats")) {
    //   stats = JSON.parse(cache.get("admin-dashboard-stats") as string);
    // } else {
    const today = new Date();
    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    // Getting this month and previous month last and end dates
    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };
    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    // Getting this month and last month users count
    const previousMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    // Getting this month and last month products count
    const previousMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    // Getting this month and last month orders count
    const previousMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    // Getting previous six months orders users count
    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastSixMonths,
        $lte: today,
      },
    });
    // Getting latest 4 transactions
    const latestTransactionsPromise = Order.find({})
      .select(["total", "status", "discount", "orderItems"])
      .limit(4);
    const [
      previousMonthUsers,
      thisMonthUsers,
      previousMonthProducts,
      thisMonthProducts,
      previousMonthOrders,
      thisMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransactions,
    ] = await Promise.all([
      previousMonthUsersPromise,
      thisMonthUsersPromise,
      previousMonthProductsPromise,
      thisMonthProductsPromise,
      previousMonthOrdersPromise,
      thisMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const previousMonthRevenue = previousMonthOrders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const percentageChange = {
      users: calculatePercentage(
        thisMonthUsers.length,
        previousMonthUsers.length
      ),
      products: calculatePercentage(
        thisMonthProducts.length,
        previousMonthProducts.length
      ),
      orders: calculatePercentage(
        thisMonthOrders.length,
        previousMonthOrders.length
      ),
      revenue: calculatePercentage(thisMonthRevenue, previousMonthRevenue),
    };

    const count = {
      revenue,
      products: productsCount,
      users: usersCount,
      orders: allOrders.length,
    };

    const lastSixMonthTransactions = new Array(6).fill(0);
    const lastSixMonthRevenue = new Array(6).fill(0);

    // Getting past six months data for the graph on admin dashboard
    lastSixMonthOrders.forEach((order) => {
      let createdAt = order.createdAt;
      let yearDiff = today.getFullYear() - createdAt.getFullYear();
      let monthDiff = Math.abs(
        yearDiff * 12 + today.getMonth() - createdAt.getMonth()
      );
      if (monthDiff < 6) {
        lastSixMonthTransactions[5 - monthDiff] += 1;
        lastSixMonthRevenue[5 - monthDiff] += order.total || 0;
      }
    });

    let inventory: Record<string, number>[] = await getInventory({
      categories,
      productsCount,
    });
    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };
    // const modifiedLatestTransaction = latestTransactions.map((i) => ({
    //   _id: i._id,
    //   discount: i.discount,
    //   amount: i.total,
    //   quantity: i.orderItems.length,
    //   status: i.status,
    // }));

    let modifiedLatestTransaction:Array<Object> = [];
    latestTransactions.forEach((i) => {
      if (i.orderItems.length > 1) {
        i.orderItems.forEach((value) => {
          modifiedLatestTransaction.push({
            name: value.name,
            photo: value.photo,
            amount: value.price,
            quantity: value.quantity,
            status: i.status,
          });
        });
      } else {
        modifiedLatestTransaction.push({
          name: i.orderItems[0].name,
          photo: i.orderItems[0].photo,
          amount: i.orderItems[0].price,
          quantity: i.orderItems[0].quantity,
          status: i.status,
        });
      }
    });

    stats = {
      percentageChange,
      count,
      inventory,
      chart: {
        order: lastSixMonthTransactions,
        revenue: lastSixMonthRevenue,
      },
      userRatio,
      latestTransactions: modifiedLatestTransaction.slice(0,4),
    };

    cache.set("admin-dashboard-stats", JSON.stringify(stats));
    // }

    res.status(200).json({
      success: true,
      stats,
    });
  }
);

export const productsStats = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let productStats;
    if (cache.has("products-stats")) {
      productStats = JSON.parse(cache.get("products-stats") as string);
    } else {
      const [
        processingOrders,
        shippedOrders,
        deliveredOrders,
        categories,
        productsCount,
        outOfStock,
        allUsers,
        adminUsers,
        allOrders,
      ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        User.find({}).select("dob"),
        User.countDocuments({ role: "admin" }),
        Order.find({}),
      ]);

      let inventory: Record<string, number>[] = await getInventory({
        categories,
        productsCount,
      });
      const grossIncome = allOrders.reduce(
        (prev, order) => prev + (order.total || 0),
        0
      );

      const discount = allOrders.reduce(
        (prev, order) => prev + (order.discount || 0),
        0
      );

      const productionCost = allOrders.reduce(
        (prev, order) => prev + (order.shippingCharges || 0),
        0
      );

      const burnt = allOrders.reduce(
        (prev, order) => prev + (order.tax || 0),
        0
      );

      const marketingCost = Math.round(grossIncome * (30 / 100));

      const netMargin =
        grossIncome - discount - productionCost - burnt - marketingCost;

      const revenueDistribution = {
        netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost,
      };

      const userAgeGroups = {
        teen: allUsers.filter((user) => user.age < 20).length,
        adult: allUsers.filter((user) => user.age >= 20 && user.age < 40)
          .length,
        old: allUsers.filter((user) => user.age >= 40).length,
      };
      const userRoles = {
        admin: adminUsers,
        customer: allUsers.length - adminUsers,
      };

      productStats = {
        Orders: {
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
        },
        inventory,
        stock: {
          inStock: productsCount - outOfStock,
          outOfStock,
        },
        revenueDistribution,
        userAgeGroups,
        userRoles,
      };
      cache.set("products-stats", JSON.stringify(productStats));
    }
    res.status(200).json({
      success: true,
      productStats,
    });
  }
);

export const salesReports = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let salesReports;
    if (cache.has("sales-reports")) {
      salesReports = JSON.parse(cache.get("sales-reports") as string);
    } else {
      const today = new Date();

      const lastSixMonths = new Date();
      lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

      const lastTwelveMonths = new Date();
      lastTwelveMonths.setMonth(lastTwelveMonths.getMonth() - 12);

      const baseQuery = {
        createdAt: {
          $gte: lastSixMonths,
          $lte: today,
        },
      };

      const OrderBaseQuery = {
        createdAt: {
          $gte: lastSixMonths,
          $lte: today,
        },
      };
      const [products, users, orders] = await Promise.all([
        Product.find(baseQuery).select("createdAt"),
        User.find(baseQuery).select("createdAt"),
        Order.find(OrderBaseQuery).select("createdAt"),
      ]);

      const sixMonthsProducts = getCharReports({
        length: 6,
        chartData: products,
      });
      const sixMonthsUsers = getCharReports({ length: 6, chartData: users });
      const tweleveMonthsOrders = getCharReports({
        length: 12,
        chartData: orders,
      });

      salesReports = {
        products: sixMonthsProducts,
        users: sixMonthsUsers,
        orders: tweleveMonthsOrders,
      };
      cache.set("sales-reports", JSON.stringify(salesReports));
    }
    res.status(200).json({
      success: true,
      salesReports,
    });
  }
);
export const yearlyReports = TryCatch(
  async (req: Request, res: Response, nest: NextFunction) => {
    let yearlyReports;
    if (cache.has("yearly-reports")) {
      yearlyReports = JSON.parse(cache.get("yearly-reports") as string);
    } else {
      const today = new Date();

      const lastTwelveMonths = new Date();
      lastTwelveMonths.setMonth(lastTwelveMonths.getMonth() - 12);

      const baseQuery = {
        createdAt: {
          $gte: lastTwelveMonths,
          $lte: today,
        },
      };

      const [products, users, orders] = await Promise.all([
        Product.find(baseQuery).select("createdAt"),
        User.find(baseQuery).select("createdAt"),
        Order.find(baseQuery).select(["createdAt", "discount", "total"]),
      ]);

      const twelveMonthsProducts = getCharReports({
        length: 12,
        chartData: products,
      });
      const twelveMonthsUsers = getCharReports({
        length: 12,
        chartData: users,
      });
      const tweleveMonthsRevnue = getCharReports({
        length: 12,
        chartData: orders,
        property: "total",
      });
      const tweleveMonthsDiscount = getCharReports({
        length: 12,
        chartData: orders,
        property: "discount",
      });

      yearlyReports = {
        products: twelveMonthsProducts,
        users: twelveMonthsUsers,
        revenue: tweleveMonthsRevnue,
        discount: tweleveMonthsDiscount,
      };
      cache.set("yearly-reports", JSON.stringify(yearlyReports));
    }
    res.status(200).json({
      success: true,
      yearlyReports,
    });
  }
);
